# ================================================================
# Smart Study Planner — Backend Startup Script
# Run this from the backend-repo folder:
#   PowerShell> .\run.ps1
# ================================================================

Write-Host "`n[Smart Study Planner] Loading environment variables..." -ForegroundColor Cyan

# Read .env file and set environment variables
Get-Content ".env" | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' } | ForEach-Object {
    $parts = $_ -split '=', 2
    $key   = $parts[0].Trim()
    $value = $parts[1].Trim()
    [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
    Write-Host "  SET $key" -ForegroundColor DarkGray
}

Write-Host "`n[Smart Study Planner] Starting Spring Boot on port 8080..." -ForegroundColor Green
Write-Host "  Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Yellow
Write-Host "  API Base  : http://localhost:8080/api/v1" -ForegroundColor Yellow
Write-Host ""

./mvnw.cmd spring-boot:run
