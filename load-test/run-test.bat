@echo off
REM Load Test Runner Script for JMeter
REM This script runs the JMeter test plan and generates HTML reports

setlocal enabledelayedexpansion

REM Set variables
set JMETER_HOME=C:\apache-jmeter-5.5
set TEST_PLAN=LabTestAPI.jmx
set RESULTS_FILE=results.jtl
set REPORT_DIR=report
set TIMESTAMP=%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%

REM Check if JMeter is installed
if not exist "%JMETER_HOME%\bin\jmeter.bat" (
    echo Error: JMeter not found at %JMETER_HOME%
    echo Please install JMeter or update JMETER_HOME variable
    pause
    exit /b 1
)

echo.
echo ============================================
echo Lab Test Booking API - Load Test
echo ============================================
echo Test Plan: %TEST_PLAN%
echo Results File: %RESULTS_FILE%
echo Report Directory: %REPORT_DIR%
echo.

REM Create report directory if it doesn't exist
if not exist "%REPORT_DIR%" mkdir "%REPORT_DIR%"

REM Run JMeter in non-GUI mode
echo Starting JMeter test run...
echo.

call "%JMETER_HOME%\bin\jmeter.bat" ^
  -n ^
  -t "%TEST_PLAN%" ^
  -l "%RESULTS_FILE%" ^
  -j jmeter.log ^
  -e ^
  -o "%REPORT_DIR%\report_%TIMESTAMP%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: JMeter test failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo Test Completed Successfully!
echo ============================================
echo.
echo Results Summary:
echo - Results file: %RESULTS_FILE%
echo - Report location: %REPORT_DIR%\report_%TIMESTAMP%
echo.
echo To view the HTML report, open:
echo %REPORT_DIR%\report_%TIMESTAMP%\index.html
echo.
pause
