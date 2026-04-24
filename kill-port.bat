@echo off
setlocal ENABLEDELAYEDEXPANSION

set "PORT=%~1"
if "%PORT%"=="" set "PORT=8080"

echo Checking for process on port %PORT%...

set "FOUND=0"
set "SEEN=,"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    echo !SEEN! | find ",%%P," >nul
    if errorlevel 1 (
        set "FOUND=1"
        set "SEEN=!SEEN!%%P,"
        echo Killing PID %%P on port %PORT%...
        taskkill /PID %%P /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo Successfully killed PID %%P
        ) else (
            echo Failed to kill PID %%P
        )
    )
)

if "%FOUND%"=="0" (
    echo No process is listening on port %PORT%.
)

echo.
echo Current status for port %PORT%:
netstat -ano | findstr /R /C:":%PORT% " >nul
if errorlevel 1 (
    echo No active entries found for port %PORT%.
) else (
    netstat -ano | findstr /R /C:":%PORT% "
)

endlocal
exit /b 0
