# Optional Windows asset-preparation helper. Originals stay intact for the viewer.
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$previewInputs = @('argus/hub', 'deenstudio/verse-selection')
foreach ($inputName in $previewInputs) {
  $sourcePath = Join-Path $projectRoot "public/images/projects/$inputName.png"
  $outputPath = Join-Path $projectRoot "public/images/projects/$inputName-preview.jpg"
  $image = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $width = [Math]::Min(960, $image.Width)
    $height = [int][Math]::Round($image.Height * $width / $image.Width)
    $preview = [System.Drawing.Bitmap]::new($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($preview)
    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.DrawImage($image, 0, 0, $width, $height)
      $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
      $options = [System.Drawing.Imaging.EncoderParameters]::new(1)
      try {
        $options.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]88)
        $preview.Save($outputPath, $encoder, $options)
      } finally { $options.Dispose() }
    } finally { $graphics.Dispose(); $preview.Dispose() }
    Get-Item -LiteralPath $outputPath | Select-Object Name, Length
  } finally { $image.Dispose() }
}
