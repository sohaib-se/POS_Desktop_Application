# Laimsoft POS Installer Verification Script
param(
  [string]$UserFile,
  [string]$PassFile,
  [string]$StatusFile,
  [string]$ApiUrl = "https://laimsoft.laimsoftofficial.workers.dev/api/pos/verify-installer"
)

$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

try {
  if (-not (Test-Path $UserFile) -or -not (Test-Path $PassFile)) {
    [System.IO.File]::WriteAllText($StatusFile, "Credentials could not be read from installer.")
    exit 1
  }

  $username = [System.IO.File]::ReadAllText($UserFile).Trim()
  $password = [System.IO.File]::ReadAllText($PassFile).Trim()

  $body = @{
    username = $username
    password = $password
  } | ConvertTo-Json

  $resp = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 15

  if ($resp.success -eq $true) {
    [System.IO.File]::WriteAllText($StatusFile, "OK")
    exit 0
  } else {
    $msg = if ($resp.message) { $resp.message } else { "Credentials rejected." }
    [System.IO.File]::WriteAllText($StatusFile, $msg)
    exit 1
  }
} catch {
  if ($_.Exception.Response) {
    try {
      $stream = $_.Exception.Response.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $errJson = $reader.ReadToEnd() | ConvertFrom-Json
      $errMsg = if ($errJson.message) { $errJson.message } else { "Authentication rejected by server." }
      [System.IO.File]::WriteAllText($StatusFile, $errMsg)
    } catch {
      [System.IO.File]::WriteAllText($StatusFile, "Authentication rejected by server.")
    }
  } else {
    [System.IO.File]::WriteAllText($StatusFile, "Unable to connect to verification server. Please check your internet connection and try again.")
  }
  exit 1
}
