@echo off
rem Starts a local web server for Kovai Streets and opens the game in your browser.
rem Needs Python 3 (https://www.python.org/downloads/). Close this window to stop the server.
cd /d "%~dp0"
set PORT=8000
where python >nul 2>nul
if errorlevel 1 (
  echo Python 3 was not found. Install it from https://www.python.org/downloads/ and run this file again.
  pause
  exit /b 1
)
start "" http://localhost:%PORT%/
echo Kovai Streets is running at http://localhost:%PORT%/  (close this window to stop it)
python -m http.server %PORT% --bind 127.0.0.1
