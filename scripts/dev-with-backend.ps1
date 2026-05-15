# Start local Go API + Expo for mobile testing.
# Usage (from repo root): .\scripts\dev-with-backend.ps1
$ErrorActionPreference = "Stop"

$backendRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\property-survey-backend")
$appRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

function Test-ApiHealth {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 2
        return $r.StatusCode -eq 200
    } catch { return $false }
}

Write-Host "=== Property Survey — dev stack ===" -ForegroundColor Cyan

if (-not (Test-ApiHealth)) {
    Write-Host "Starting Docker infra (postgres, redis, minio)..." -ForegroundColor Yellow
    Push-Location $backendRoot
    docker compose up -d postgres redis minio | Out-Null
    Pop-Location

    Write-Host "Starting Go API on :8080 in a new window..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendRoot'; .\scripts\run.ps1"
    $deadline = (Get-Date).AddSeconds(25)
    while ((Get-Date) -lt $deadline) {
        if (Test-ApiHealth) { break }
        Start-Sleep -Seconds 1
    }
    if (-not (Test-ApiHealth)) {
        Write-Error "API did not become healthy on http://localhost:8080/health"
    }
} else {
    Write-Host "API already running at http://localhost:8080" -ForegroundColor Green
}

$lan = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.254.*'
} | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "API (host):     http://localhost:8080/v1" -ForegroundColor Green
Write-Host "API (emulator): http://10.0.2.2:8080/v1" -ForegroundColor Green
if ($lan) {
    Write-Host "API (phone):    http://${lan}:8080/v1  -> set app.json extra.apiBaseUrlDev if needed" -ForegroundColor Green
}
Write-Host ""
Write-Host "Login: rajesh.surveyor@sdvedutech.in / Admin@12345" -ForegroundColor Cyan
Write-Host "Starting Expo Metro..." -ForegroundColor Yellow

Push-Location $appRoot
bun expo start
