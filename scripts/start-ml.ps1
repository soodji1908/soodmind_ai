$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $ProjectRoot ".env.local"
$MlFolder = Join-Path $ProjectRoot "python-ml"

if (-not (Test-Path $EnvFile)) {
  Write-Host "Missing .env.local. Copy .env.example to .env.local and configure ML_API_KEY first." -ForegroundColor Red
  exit 1
}

# Python loads the same root .env.local via python-dotenv. Validate early so
# the API does not start in a permanently unauthenticated state.
$EnvContent = Get-Content $EnvFile -Raw
if ($EnvContent -notmatch '(?m)^\s*ML_API_KEY\s*=\s*["'']?[^\s"'']{16,}') {
  Write-Host "ML_API_KEY is missing or too short in .env.local. Set a long random key (at least 16 characters)." -ForegroundColor Red
  exit 1
}

$Python = Join-Path $MlFolder ".venv\Scripts\python.exe"
if (-not (Test-Path $Python)) { $Python = "python" }

Push-Location $MlFolder
try {
  & $Python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
} finally {
  Pop-Location
}
