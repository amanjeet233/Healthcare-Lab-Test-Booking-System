(@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "RUN_BACKEND_SCRIPT=%~dp0run-backend.bat"
set "WINDOW_TITLE=LabTestBooking Backend"

if not exist "%RUN_BACKEND_SCRIPT%" (
  echo ERROR: run-backend.bat not found at "%RUN_BACKEND_SCRIPT%"
  exit /b 1
)

echo Starting backend in a new window...
start "%WINDOW_TITLE%" "%RUN_BACKEND_SCRIPT%"

echo Backend launch command sent.
echo Close this window if not needed.

endlocal
