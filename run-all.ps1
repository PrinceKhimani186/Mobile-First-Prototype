# App Squad Full Project Local Dev Runner

# 1. Resolve DATABASE_URL
$DbUrl = [System.Environment]::GetEnvironmentVariable("DATABASE_URL")
$Password = ""

if (-not $DbUrl -and (Test-Path ".env")) {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^DATABASE_URL=(.+)$") {
            $DbUrl = $Matches[1].Trim()
        }
    }
}

if (-not $DbUrl) {
    Write-Host "DATABASE_URL is not set." -ForegroundColor Yellow
    $Password = Read-Host "Enter your local PostgreSQL password for user 'postgres' (press Enter for none)"
    $DbUrl = "postgresql://postgres:$Password@localhost:5432/app_squad_dev"
    
    # Save it to root .env
    if (-not (Test-Path ".env")) {
        New-Item -Path ".env" -ItemType File -Force | Out-Null
    }
    Add-Content -Path ".env" -Value "DATABASE_URL=$DbUrl"
    Write-Host "Saved DATABASE_URL to root .env file." -ForegroundColor Green
} else {
    # Extract password from DATABASE_URL if possible for DB creation check
    if ($DbUrl -match "postgresql://[^:]+:([^@]+)@") {
        $Password = $Matches[1]
    }
}

$env:DATABASE_URL = $DbUrl

# 2. Ensure Database exists
if ($Password) {
    $env:PGPASSWORD = $Password
}
Write-Host "Checking/Creating database 'app_squad_dev'..." -ForegroundColor Cyan
& psql -U postgres -h localhost -d postgres -c "CREATE DATABASE app_squad_dev;" 2>&1 | Out-Null

# Clear PGPASSWORD so it doesn't leak unnecessarily
$env:PGPASSWORD = $null

# 3. Load ALL environment variables from root .env (single source of truth).
#    Empty values are skipped so they don't unset anything.
if (Test-Path ".env") {
    Write-Host "Loading environment variables from root .env..." -ForegroundColor Cyan
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.+)$") {
            $name = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            if ($value) {
                [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
            }
        }
    }
}

# 3b. Optional per-app overrides for the API server
if (Test-Path "artifacts/api-server/.env") {
    Write-Host "Loading environment variables from artifacts/api-server/.env..." -ForegroundColor Cyan
    Get-Content "artifacts/api-server/.env" | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)$") {
            $name = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
        }
    }
}

# Ensure base path and ports are set
$env:PORT = "5173"  # Frontend Vite Port
$env:API_SERVER_PORT = "8080" # Backend Port
$env:BASE_PATH = "/"
$env:NODE_ENV = "development"

# 4. Run Drizzle Push to update schema
Write-Host "Running Drizzle schema push..." -ForegroundColor Cyan
pnpm --filter @workspace/db run push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Drizzle push failed. Please check database connection or credentials." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 5. Start dev processes in separate windows
Write-Host "Starting API Server on port 8080..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory "$PSScriptRoot" -ArgumentList "-NoExit", "-Command", "`$env:PORT='8080'; `$env:DATABASE_URL='$DbUrl'; cd artifacts/api-server; pnpm run dev"

Write-Host "Starting Frontend (App Squad) on port 5173..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory "$PSScriptRoot" -ArgumentList "-NoExit", "-Command", "`$env:PORT='5173'; `$env:API_SERVER_PORT='8080'; `$env:BASE_PATH='/'; `$env:NODE_ENV='development'; cd artifacts/app-squad; pnpm run dev"

Write-Host "Starting Frontend (Closer Presentation) on port 5174..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory "$PSScriptRoot" -ArgumentList "-NoExit", "-Command", "`$env:PORT='5174'; `$env:API_SERVER_PORT='8080'; `$env:BASE_PATH='/'; `$env:NODE_ENV='development'; cd artifacts/closer-presentation; pnpm run dev"

Write-Host "Starting Frontend (DB AI Marketing) on port 5175..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory "$PSScriptRoot" -ArgumentList "-NoExit", "-Command", "`$env:PORT='5175'; `$env:API_SERVER_PORT='8080'; `$env:BASE_PATH='/'; `$env:NODE_ENV='development'; cd artifacts/db-ai-marketing; pnpm run dev"

Write-Host "Starting Frontend (Mockup Sandbox) on port 5176..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory "$PSScriptRoot" -ArgumentList "-NoExit", "-Command", "`$env:PORT='5176'; `$env:BASE_PATH='/'; `$env:NODE_ENV='development'; cd artifacts/mockup-sandbox; pnpm run dev"

Write-Host "Full development environment started! Check the newly opened windows for logs." -ForegroundColor Green
Write-Host "API Server is running at http://localhost:8080" -ForegroundColor Green
Write-Host "App Squad is running at http://localhost:5173" -ForegroundColor Green
Write-Host "Closer Presentation is running at http://localhost:5174" -ForegroundColor Green
Write-Host "DB AI Marketing is running at http://localhost:5175" -ForegroundColor Green
Write-Host "Mockup Sandbox is running at http://localhost:5176" -ForegroundColor Green
