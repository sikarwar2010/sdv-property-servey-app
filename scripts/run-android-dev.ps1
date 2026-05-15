# Full Android dev loop: emulator → Go API check → build/install dev client → Metro.
# Usage: .\scripts\run-android-dev.ps1
$ErrorActionPreference = "Stop"
$appRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendRoot = Resolve-Path (Join-Path $appRoot "..\property-survey-backend")

function Test-ApiHealth {
    try {
        return (Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200
    } catch { return $false }
}

Write-Host "=== SDV Property Survey — Android dev ===" -ForegroundColor Cyan

& (Join-Path $PSScriptRoot "start-emulator.ps1")

if (-not (Test-ApiHealth)) {
    Write-Host "Go API not running — starting in a new window..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendRoot'; .\scripts\run.ps1"
    $deadline = (Get-Date).AddSeconds(30)
    while ((Get-Date) -lt $deadline) {
        if (Test-ApiHealth) { break }
        Start-Sleep -Seconds 1
    }
    if (-not (Test-ApiHealth)) {
        Write-Error "Start the API manually: cd property-survey-backend; .\scripts\run.ps1"
    }
}

Write-Host "API OK at http://localhost:8080 (emulator uses http://10.0.2.2:8080/v1)" -ForegroundColor Green
Write-Host "Building & installing dev client (first run may take several minutes)..." -ForegroundColor Yellow

Push-Location $appRoot
try {
    bun expo run:android
    Write-Host "Launching Metro..." -ForegroundColor Cyan
    bun expo start --dev-client
} finally {
    Pop-Location
}
