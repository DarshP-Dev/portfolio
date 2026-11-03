$ErrorActionPreference = 'Stop'
$demoRoot = Join-Path (Split-Path $PSScriptRoot) '.cache/finance-demo'
$sourceRoot = 'C:\Users\Darsh\finance-tracker'
New-Item -ItemType Directory -Force "$demoRoot/source", "$demoRoot/tools", "$demoRoot/downloads", "$demoRoot/private", "$demoRoot/logs" | Out-Null
$copyManifest = @()
$tracked = & git -C $sourceRoot ls-files
if ($LASTEXITCODE -ne 0) { throw 'Cannot enumerate tracked source files.' }
foreach ($relative in $tracked) {
    if ($relative -notmatch '^(frontend/finance-tracker-frontend|backend/backend)/') { continue }
    if ($relative -match '(^|/)(\.env[^/]*|\.local|node_modules|target|\.next|\.git)(/|$)|application-(local|prod|production)[^/]*|\.(backup|dump|sql\.gz)$') { continue }
    $origin = Join-Path $sourceRoot $relative
    $target = Join-Path "$demoRoot/source" $relative
    New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
    Copy-Item -LiteralPath $origin -Destination $target
    $copyManifest += @{ path = $relative; sha256 = (Get-FileHash -LiteralPath $origin).Hash }
}
$copyManifest | ConvertTo-Json | Set-Content "$demoRoot/source-manifest.json"
$release = Get-Content "$demoRoot/downloads/jdk-release.json" -Raw | ConvertFrom-Json
$jdkZip = "$demoRoot/downloads/$($release.name)"
if (!(Test-Path $jdkZip)) { & curl.exe -fL --silent --show-error $release.link -o $jdkZip; if ($LASTEXITCODE -ne 0) { throw 'JDK download failed' } }
if ((Get-FileHash $jdkZip).Hash -ne $release.checksum) { throw 'JDK checksum mismatch' }
if (!(Test-Path "$demoRoot/tools/jdk")) { Expand-Archive -LiteralPath $jdkZip -DestinationPath "$demoRoot/tools/jdk" }
$jdkHome = (Get-ChildItem "$demoRoot/tools/jdk" -Directory | Select-Object -First 1).FullName
& "$jdkHome/bin/java.exe" -version
$pgUrl = 'https://get.enterprisedb.com/postgresql/postgresql-17.11-1-windows-x64-binaries.zip'
$pgZip = "$demoRoot/downloads/postgresql-17.11.zip"
if (!(Test-Path $pgZip)) { & curl.exe -fL --silent --show-error $pgUrl -o $pgZip; if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL binary download failed' } }
if (!(Test-Path "$demoRoot/tools/pgsql")) { Expand-Archive -LiteralPath $pgZip -DestinationPath "$demoRoot/tools" }
& "$demoRoot/tools/pgsql/bin/postgres.exe" --version
$mavenUrl = 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.15/apache-maven-3.9.15-bin.zip'
$mavenZip = "$demoRoot/downloads/apache-maven-3.9.15-bin.zip"
if (!(Test-Path $mavenZip)) { & curl.exe -fL --silent --show-error $mavenUrl -o $mavenZip; if ($LASTEXITCODE -ne 0) { throw 'Maven download failed' } }
$mavenChecksum = (Invoke-WebRequest "$mavenUrl.sha512").Content.Trim().Split(' ')[0]
if ((Get-FileHash $mavenZip -Algorithm SHA512).Hash -ne $mavenChecksum) { throw 'Maven checksum mismatch' }
if (!(Test-Path "$demoRoot/tools/apache-maven-3.9.15")) { Expand-Archive -LiteralPath $mavenZip -DestinationPath "$demoRoot/tools" }
$id = [guid]::NewGuid().ToString('N').Substring(0,8)
$config = @{
    workspace = $demoRoot; source = $sourceRoot; javaHome = $jdkHome
    pgBin = "$demoRoot/tools/pgsql/bin"; dataDirectory = "$demoRoot/pgdata"
    host = '127.0.0.1'; pgPort = 15432; backendPort = 18080; frontendPort = 13000
    database = "portfolio_finance_demo_$id"; dbUser = "finance_demo_$id"
    jdbc = "jdbc:postgresql://127.0.0.1:15432/portfolio_finance_demo_$id"
    postgresArchive = $pgUrl; postgresArchiveSha256 = (Get-FileHash $pgZip).Hash
    javaArchiveSha256 = $release.checksum
}
if (Test-Path "$demoRoot/config.json") { $config = Get-Content "$demoRoot/config.json" -Raw | ConvertFrom-Json } else {
    $config | ConvertTo-Json | Set-Content "$demoRoot/config.json"
    $secrets = @{
        password = (ConvertTo-SecureString ([Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))) -AsPlainText -Force)
        jwt = (ConvertTo-SecureString ([Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))) -AsPlainText -Force)
    }
    $secrets | Export-Clixml "$demoRoot/private/secrets.clixml"
}
Write-Output 'Portable tools and tracked-source copy staged. No initdb, database server, migrations or application launch executed.'
