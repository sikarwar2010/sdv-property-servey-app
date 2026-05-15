# Start the Android emulator and wait until adb sees a device.
#
# Windows "UpdateLayeredWindowIndirect / device not functioning" → use software GPU (default below).
# Usage:
#   .\scripts\start-emulator.ps1
#   .\scripts\start-emulator.ps1 -AvdName Medium_Phone -Gpu swiftshader
param(
    [string]$AvdName = "Medium_Phone",
    [ValidateSet('swiftshader', 'angle', 'host', 'auto')]
    [string]$Gpu = 'swiftshader'
)

$ErrorActionPreference = "Stop"
$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = "$env:LOCALAPPDATA\Android\Sdk" }
$adb = Join-Path $sdk "platform-tools\adb.exe"
$emulator = Join-Path $sdk "emulator\emulator.exe"

if (-not (Test-Path $emulator)) {
    Write-Error "Android emulator not found at $emulator. Install Android Studio SDK."
}

$devices = & $adb devices | Select-String "device$"
if ($devices) {
    Write-Host "Emulator already running:" -ForegroundColor Green
    & $adb devices
    exit 0
}

$avds = & $emulator -list-avds
if ($avds -notcontains $AvdName) {
    Write-Host "Available AVDs: $($avds -join ', ')"
    if ($avds.Count -gt 0) { $AvdName = $avds[0] }
    else { Write-Error "No AVDs found. Create one in Android Studio → Device Manager." }
}

$gpuMode = switch ($Gpu) {
    'swiftshader' { 'swiftshader_indirect' }  # software GLES — best fix on Windows GPU glitches
    'angle'       { 'angle_indirect' }
    'host'        { 'host' }
    'auto'        { 'auto' }
}

$emuArgs = @(
    "-avd", $AvdName,
    "-gpu", $gpuMode,
    "-no-snapshot-load",
    "-no-audio"
)

Write-Host "Starting AVD: $AvdName (gpu=$gpuMode) ..." -ForegroundColor Cyan
Write-Host "If the window is black or crashes, set AVD Graphics to Software in Android Studio." -ForegroundColor DarkGray
Start-Process -FilePath $emulator -ArgumentList $emuArgs -WindowStyle Normal

$deadline = (Get-Date).AddMinutes(3)
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 3
    $booted = ""
    try {
        $booted = (& $adb shell getprop sys.boot_completed 2>$null | Out-String).Trim()
    } catch {
        # emulator still booting / offline
    }
    if ($booted -match "1") {
        Write-Host "Emulator ready." -ForegroundColor Green
        & $adb devices
        exit 0
    }
    Write-Host "Waiting for boot..."
}

Write-Error "Emulator did not finish booting within 3 minutes."
