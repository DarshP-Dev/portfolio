param(
    [ValidateSet('Inspect','Build','Initialize','StartDatabase','CreateDatabase','Migrate','StartBackend','StartFrontend','Stop')]
    [string]$Action = 'Inspect',
    [switch]$RuntimeApproved
)
$ErrorActionPreference = 'Stop'
$demoRoot = [IO.Path]::GetFullPath((Join-Path (Split-Path $PSScriptRoot) '.cache/finance-demo'))
$config = Get-Content "$demoRoot/config.json" -Raw | ConvertFrom-Json
if ([IO.Path]::GetFullPath($config.workspace) -ne $demoRoot) { throw 'Workspace mismatch' }
if ($config.host -ne '127.0.0.1' -or $config.pgPort -ne 15432 -or $config.database -cne 'portfolio_finance_demo_1ad70246' -or $config.dbUser -cne 'finance_demo_1ad70246' -or $config.backendPort -ne 18080 -or $config.frontendPort -ne 13000) { throw 'Unexpected target' }
if ($config.jdbc -cne "jdbc:postgresql://127.0.0.1:15432/$($config.database)") { throw 'Effective JDBC target rejected' }
if ([IO.Path]::GetFullPath($config.dataDirectory) -ne "$demoRoot\pgdata") { throw 'Data directory rejected' }
if ($Action -notin @('Inspect','Build','Stop') -and !$RuntimeApproved) { throw 'User runtime approval required; pass -RuntimeApproved only after approval.' }
$backend = "$demoRoot/source/backend/backend"
$frontend = "$demoRoot/source/frontend/finance-tracker-frontend"
New-Item -ItemType Directory -Force "$demoRoot/tmp", "$demoRoot/profile", "$demoRoot/npm-cache", "$demoRoot/maven", "$demoRoot/logs" | Out-Null

function Invoke-DemoProcess([string]$File, [string[]]$Arguments, [string]$Directory, [hashtable]$Extra = @{}, [string]$Background = '', [bool]$Capture = $false) {
    $info = [Diagnostics.ProcessStartInfo]::new()
    $info.FileName = $File; $info.WorkingDirectory = $Directory
    $info.UseShellExecute = $false; $info.CreateNoWindow = $true
    $info.Environment.Clear()
    foreach ($name in @('SystemRoot','WINDIR','ComSpec','PATHEXT','OS','PROCESSOR_ARCHITECTURE','NUMBER_OF_PROCESSORS')) {
        $value = [Environment]::GetEnvironmentVariable($name)
        if ($value) { $info.Environment[$name] = $value }
    }
    $info.Environment['PATH'] = "$($config.javaHome)\bin;C:\Program Files\nodejs;$env:SystemRoot\System32;$env:SystemRoot"
    $info.Environment['JAVA_HOME'] = $config.javaHome
    $info.Environment['TEMP'] = "$demoRoot/tmp"; $info.Environment['TMP'] = "$demoRoot/tmp"
    $info.Environment['USERPROFILE'] = "$demoRoot/profile"
    $info.Environment['MAVEN_USER_HOME'] = "$demoRoot/maven"
    $info.Environment['npm_config_cache'] = "$demoRoot/npm-cache"
    $info.Environment['NEXT_TELEMETRY_DISABLED'] = '1'
    foreach ($entry in $Extra.GetEnumerator()) { $info.Environment[$entry.Key] = $entry.Value }
    if ([IO.Path]::GetFileName($File) -eq 'cmd.exe') {
        $info.Arguments = '/d /s /c "' + $Arguments[-1] + '"'
    } else { foreach ($argument in $Arguments) { $info.ArgumentList.Add($argument) } }
    if ($Background) { $info.RedirectStandardOutput = $true; $info.RedirectStandardError = $true }
    if ($Capture) { $info.RedirectStandardOutput = $true }
    if (!$Background) { $info.RedirectStandardOutput = $true; $info.RedirectStandardError = $true }
    $isPgCtl = [IO.Path]::GetFileName($File) -eq 'pg_ctl.exe'
    if ($isPgCtl) { $info.RedirectStandardOutput = $false; $info.RedirectStandardError = $false }
    $process = [Diagnostics.Process]::Start($info)
    if ($isPgCtl) {
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw 'Owned pg_ctl command failed' }
        return
    }
    if ($Background) {
        # Persist output without blocking a background server on full pipe buffers.
        $outStream = [IO.File]::Open("$demoRoot/logs/$Background.stdout.log", [IO.FileMode]::Create, [IO.FileAccess]::Write, [IO.FileShare]::ReadWrite)
        $errStream = [IO.File]::Open("$demoRoot/logs/$Background.stderr.log", [IO.FileMode]::Create, [IO.FileAccess]::Write, [IO.FileShare]::ReadWrite)
        $outCopy = $process.StandardOutput.BaseStream.CopyToAsync($outStream)
        $errCopy = $process.StandardError.BaseStream.CopyToAsync($errStream)
        @{ pid = $process.Id; executable = $File; workspace = $demoRoot } | ConvertTo-Json | Set-Content "$demoRoot/$Background.process.json"
        Write-Output "Started $Background process $($process.Id). Keep this terminal open; Ctrl+C ends its log forwarding."
        try { $process.WaitForExit(); $outCopy.GetAwaiter().GetResult(); $errCopy.GetAwaiter().GetResult() }
        finally { $outStream.Dispose(); $errStream.Dispose() }
    } else {
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        $captured = $stdoutTask.GetAwaiter().GetResult()
        $errors = $stderrTask.GetAwaiter().GetResult()
        if (!$Capture) { Write-Output $captured }
        if ($errors) { [Console]::Error.WriteLine($errors) }
        $process.WaitForExit(); if ($process.ExitCode -ne 0) { throw "$([IO.Path]::GetFileName($File)) failed with exit $($process.ExitCode)" }
        if ($Capture) { return $captured.Trim() }
    }
}
function Assert-FreePort([int]$Port) {
    $listeners = @(Get-NetTCPConnection -State Listen -ErrorAction Stop | Where-Object LocalPort -eq $Port)
    if ($listeners.Count) { throw "Port $Port already has a listener; do not reuse or stop it." }
}
function Stop-OwnedProcessTree([int]$ProcessId) {
    # Called only after verifying the recorded root belongs to this workspace.
    foreach ($child in @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId")) {
        Stop-OwnedProcessTree ([int]$child.ProcessId)
    }
    if (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue) { Stop-Process -Id $ProcessId }
}
function Assert-OwnedCluster {
    if (!(Test-Path "$demoRoot/cluster-marker.json")) { throw 'No owned cluster marker' }
    $marker = Get-Content "$demoRoot/cluster-marker.json" -Raw | ConvertFrom-Json
    if ($marker.database -ne $config.database -or $marker.dataDirectory -ne $config.dataDirectory) { throw 'Cluster identity mismatch' }
    $dataItem = Get-Item -LiteralPath $config.dataDirectory
    if ($dataItem.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Linked database directory refused' }
    if (Test-Path "$($config.dataDirectory)/postmaster.pid") {
        $serverPid = [int](Get-Content "$($config.dataDirectory)/postmaster.pid" -First 1)
        $serverProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$serverPid"
        $normalizedCommand = $serverProcess.CommandLine -replace '\\','/'
        $normalizedData = $config.dataDirectory -replace '\\','/'
        if (!$serverProcess -or [IO.Path]::GetFullPath($serverProcess.ExecutablePath) -ne [IO.Path]::GetFullPath("$($config.pgBin)/postgres.exe") -or $normalizedCommand -notlike "*$normalizedData*") { throw 'Owned PostgreSQL process verification failed' }
    }
}
function Demo-Secrets {
    $encrypted = Import-Clixml "$demoRoot/private/secrets.clixml"
    return @{ password = [Net.NetworkCredential]::new('', $encrypted.password).Password; jwt = [Net.NetworkCredential]::new('', $encrypted.jwt).Password }
}
function Pg-Environment {
    return @{ PGPASSWORD = (Demo-Secrets).password; PGHOST = $config.host; PGPORT = [string]$config.pgPort; PGUSER = $config.dbUser; PGPASSFILE = "$demoRoot/private/no-pgpass"; PGSERVICEFILE = "$demoRoot/private/no-pgservice" }
}
function Backend-Environment {
    $secret = Demo-Secrets
    return @{
        DB_URL = $config.jdbc; DB_USERNAME = $config.dbUser; DB_PASSWORD = $secret.password; JWT_SECRET = $secret.jwt
        PORT = [string]$config.backendPort; SERVER_ADDRESS = '127.0.0.1'; DB_MIGRATION_MODE = 'validate'
        CORS_ALLOWED_ORIGINS = "http://localhost:$($config.frontendPort)"
        RECURRING_SCHEDULER_ENABLED = 'false'; MARKET_DATA_ENABLED = 'false'; AI_INSIGHTS_ENABLED = 'false'
        # Also pin provider endpoints to an unused loopback destination as a second guard.
        MARKET_DATA_ENDPOINT = 'http://127.0.0.1:1/disabled'; MARKET_DATA_EOD_ENDPOINT = 'http://127.0.0.1:1/disabled'; AI_INSIGHTS_ENDPOINT = 'http://127.0.0.1:1/disabled'
    }
}
function Assert-Database([switch]$Empty, [string]$Database = $config.database) {
    Assert-OwnedCluster
    $sql = "SELECT json_build_object('database',current_database(),'role',current_user,'host',inet_server_addr(),'port',inet_server_port(),'directory',current_setting('data_directory'),'tables',(SELECT count(*) FROM information_schema.tables WHERE table_schema='public'));"
    $raw = Invoke-DemoProcess "$($config.pgBin)/psql.exe" @('-X','-At','-v','ON_ERROR_STOP=1','-d',$Database,'-c',$sql) $demoRoot (Pg-Environment) '' $true
    $identity = $raw | ConvertFrom-Json
    if ($identity.database -ne $Database -or $identity.role -ne $config.dbUser -or $identity.host -ne '127.0.0.1' -or $identity.port -ne 15432 -or [IO.Path]::GetFullPath($identity.directory) -ne [IO.Path]::GetFullPath($config.dataDirectory)) { throw 'Effective database identity mismatch; refusing any schema/application operation' }
    if ($Empty -and $identity.tables -ne 0) { throw 'Fresh database is not empty; migration refused' }
    Write-Output "Verified owned database $($identity.database) on 127.0.0.1:15432; public tables=$($identity.tables)"
}
switch ($Action) {
    'Inspect' {
        $config | Select-Object workspace,javaHome,pgBin,host,pgPort,database,dbUser,jdbc,dataDirectory,backendPort,frontendPort | Format-List
        Write-Output "Cluster initialized: $(Test-Path "$demoRoot/pgdata/PG_VERSION")"
        Write-Output "Data directory exists: $(Test-Path $config.dataDirectory)"
        foreach ($port in @($config.pgPort,$config.backendPort,$config.frontendPort)) { Assert-FreePort $port; Write-Output "Port $port currently has no TCP listener." }
        & "$($config.javaHome)/bin/java.exe" -version
        & "$($config.pgBin)/postgres.exe" --version
    }
    'Build' {
        if (!(Test-Path "$frontend/node_modules/.package-lock.json")) {
            Invoke-DemoProcess 'C:/Program Files/nodejs/node.exe' @('C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js','ci','--ignore-scripts','--no-audit','--no-fund') $frontend
        }
        $mavenHome = "$demoRoot/tools/apache-maven-3.9.15"
        $launcher = (Get-ChildItem "$mavenHome/boot/plexus-classworlds-*.jar" | Select-Object -First 1).FullName
        Invoke-DemoProcess "$($config.javaHome)/bin/java.exe" @("-Duser.home=$demoRoot/profile","-Dmaven.home=$mavenHome","-Dmaven.multiModuleProjectDirectory=$backend","-Dclassworlds.conf=$mavenHome/bin/m2.conf",'-classpath',$launcher,'org.codehaus.plexus.classworlds.launcher.Launcher','-B',"-Dmaven.repo.local=$demoRoot/maven/repository",'-Dmaven.test.skip=true','package') $backend
    }
    'Initialize' {
        Assert-FreePort $config.pgPort
        if (Test-Path $config.dataDirectory) { throw 'Refusing to initialize any existing data directory' }
        $pwFile = "$demoRoot/private/init-password.txt"
        try {
            [IO.File]::WriteAllText($pwFile, (Demo-Secrets).password)
            Invoke-DemoProcess "$($config.pgBin)/initdb.exe" @('-D',$config.dataDirectory,'-U',$config.dbUser,'--pwfile',$pwFile,'--auth=scram-sha-256','--encoding=UTF8','--locale=C') $demoRoot
        } finally { if (Test-Path $pwFile) { Remove-Item -LiteralPath $pwFile } }
        Add-Content "$($config.dataDirectory)/postgresql.conf" "`nlisten_addresses = '127.0.0.1'`nport = 15432`n"
        @{ database = $config.database; dataDirectory = $config.dataDirectory } | ConvertTo-Json | Set-Content "$demoRoot/cluster-marker.json"
    }
    'StartDatabase' {
        Assert-OwnedCluster; Assert-FreePort $config.pgPort
        Invoke-DemoProcess "$($config.pgBin)/pg_ctl.exe" @('-D',$config.dataDirectory,'-l',"$demoRoot/logs/postgres.log",'-w','start') $demoRoot
    }
    'CreateDatabase' {
        Assert-OwnedCluster
        if (Test-Path "$demoRoot/database-created.json") { throw 'Database creation already recorded' }
        Assert-Database -Database 'postgres' -Empty
        Invoke-DemoProcess "$($config.pgBin)/createdb.exe" @('--maintenance-db=postgres','--owner',$config.dbUser,$config.database) $demoRoot (Pg-Environment)
        $verify = "SELECT current_database(), current_user, inet_server_addr(), inet_server_port(); SELECT count(*) AS user_tables FROM information_schema.tables WHERE table_schema='public';"
        Invoke-DemoProcess "$($config.pgBin)/psql.exe" @('-X','-v','ON_ERROR_STOP=1','-d',$config.database,'-c',$verify) $demoRoot (Pg-Environment)
        Assert-Database -Empty
        @{ database = $config.database; jdbc = $config.jdbc } | ConvertTo-Json | Set-Content "$demoRoot/database-created.json"
    }
    'Migrate' {
        Assert-OwnedCluster
        if (!(Test-Path "$demoRoot/database-created.json")) { throw 'Fresh database checkpoint missing' }
        if (Test-Path "$demoRoot/migrated.json") { throw 'Initial migration already recorded; use validate-only startup' }
        Assert-Database -Empty
        Write-Output "Effective JDBC target verified: $($config.jdbc)"
        Invoke-DemoProcess "$($config.javaHome)/bin/java.exe" @('-Dloader.main=com.financetracker.backend.migration.DatabaseMigrationTool','-cp',"$backend/target/backend-0.0.1-SNAPSHOT.jar",'org.springframework.boot.loader.launch.PropertiesLauncher','migrate') $backend (Backend-Environment)
        @{ database=$config.database } | ConvertTo-Json | Set-Content "$demoRoot/migrated.json"
    }
    'StartBackend' {
        Assert-OwnedCluster; Assert-FreePort $config.backendPort
        if (!(Test-Path "$demoRoot/migrated.json")) { throw 'Schema initialization not recorded' }
        Assert-Database
        Write-Output "Effective JDBC target verified: $($config.jdbc); migration mode: validate"
        Invoke-DemoProcess "$($config.javaHome)/bin/java.exe" @('-jar',"$backend/target/backend-0.0.1-SNAPSHOT.jar") $backend (Backend-Environment) 'backend'
    }
    'StartFrontend' {
        Assert-FreePort $config.frontendPort
        Invoke-DemoProcess 'C:/Program Files/nodejs/node.exe' @("$frontend/node_modules/next/dist/bin/next",'dev','--hostname','localhost','--port',[string]$config.frontendPort) $frontend @{ NEXT_PUBLIC_API_BASE_URL = "http://localhost:$($config.backendPort)" } 'frontend'
    }
    'Stop' {
        foreach ($name in @('frontend','backend')) {
            $record = "$demoRoot/$name.process.json"
            if (Test-Path $record) {
                $saved = Get-Content $record -Raw | ConvertFrom-Json
                $running = Get-CimInstance Win32_Process -Filter "ProcessId=$($saved.pid)"
                if ($running -and $running.CommandLine -like "*$demoRoot*") { Stop-OwnedProcessTree ([int]$saved.pid) }
            }
        }
        if (Test-Path "$demoRoot/pgdata/postmaster.pid") {
            Assert-OwnedCluster
            Invoke-DemoProcess "$($config.pgBin)/pg_ctl.exe" @('-D',$config.dataDirectory,'-m','fast','-w','stop') $demoRoot
        }
    }
}
