@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "COMPOSE_FILE=%ROOT_DIR%docker-compose.yml"
set "DOCKER_ENV_FILE=%ROOT_DIR%.env.docker"
set "LEGACY_ENV_FILE=%ROOT_DIR%.env"
set "ENV_FILE=%DOCKER_ENV_FILE%"
set "TEMP_ENV_FILE=%TEMP%\healthcarelab-docker.env"
set "SERVICES=mysql redis backend"

if not exist "%COMPOSE_FILE%" (
  echo ERROR: docker-compose.yml not found at "%COMPOSE_FILE%"
  exit /b 1
)

docker --version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Docker is not installed or not available in PATH.
  exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Docker Compose v2 is not available. Please install/enable Docker Compose.
  exit /b 1
)

cd /d "%ROOT_DIR%"
echo Stopping Docker services: mysql, redis, backend...

if not exist "%DOCKER_ENV_FILE%" (
  if exist "%LEGACY_ENV_FILE%" (
    set "ENV_FILE=%LEGACY_ENV_FILE%"
    echo WARNING: .env.docker not found. Falling back to .env
  )
)

if exist "%ENV_FILE%" (
  echo Preparing sanitized Docker env file...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$in='%ENV_FILE%'; $out='%TEMP_ENV_FILE%';" ^
    "$lines = Get-Content -LiteralPath $in;" ^
    "$clean = foreach ($line in $lines) {" ^
    "  if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') { '{0}={1}' -f $matches[1], $matches[2] }" ^
    "  elseif ($line -match '^\s*(#.*)?$') { $line }" ^
    "};" ^
    "Set-Content -LiteralPath $out -Value $clean"
  if errorlevel 1 (
    echo ERROR: Failed to sanitize .env file.
    exit /b 1
  )
  docker compose --env-file "%TEMP_ENV_FILE%" -f "%COMPOSE_FILE%" stop %SERVICES%
) else (
  docker compose -f "%COMPOSE_FILE%" stop %SERVICES%
)
set "EXIT_CODE=%ERRORLEVEL%"

if exist "%TEMP_ENV_FILE%" del /q "%TEMP_ENV_FILE%" >nul 2>&1

if not "%EXIT_CODE%"=="0" (
  echo.
  echo Docker stop failed with code %EXIT_CODE%.
  exit /b %EXIT_CODE%
)

echo.
echo Docker services stopped.
docker compose -f "%COMPOSE_FILE%" ps

endlocal & exit /b 0
