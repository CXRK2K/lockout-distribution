$ErrorActionPreference = "Stop"

$repo = "CXRK2K/lockout-distribution"
# The stable manifest decides which Windows installer is current and which
# checksum it must match before PowerShell starts it.
$manifest = Invoke-RestMethod -Uri "https://raw.githubusercontent.com/$repo/main/docs/stable.json"
$asset = $manifest.assets.windows.primary

if (-not $asset) {
  $asset = $manifest.assets.windows.fallback
}

if (-not $asset) {
  throw "No Windows installer asset was found in the LOCKOUT! stable manifest."
}

$target = Join-Path $env:TEMP $asset.name
Invoke-WebRequest -Uri $asset.url -OutFile $target
$actualHash = (Get-FileHash -Algorithm SHA256 -Path $target).Hash.ToLowerInvariant()
$expectedHash = $asset.sha256.ToLowerInvariant()

if ($actualHash -ne $expectedHash) {
  throw "Checksum verification failed for $($asset.name)."
}

# Only launch the installer after the downloaded binary matches the published
# SHA-256 from the public manifest.
Start-Process -FilePath $target
