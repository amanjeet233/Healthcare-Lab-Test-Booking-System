@echo off
set "ENV_FILE=%~1"
if "%ENV_FILE%"=="" set "ENV_FILE=.env"

if not exist "%ENV_FILE%" (
  echo .env file not found at "%ENV_FILE%". Skipping env load.
  exit /b 0
)

for /f "usebackq delims=" %%L in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$path = '%ENV_FILE%'; Get-Content -LiteralPath $path | ForEach-Object { if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') { '{0}={1}' -f $matches[1], $matches[2] } }"`) do (
  for /f "tokens=1,* delims==" %%A in ("%%L") do set "%%A=%%B"
)

exit /b 0
