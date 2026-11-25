@echo off
rem Starts a local web server for Kovai Streets and opens the game in your browser.
rem Tries, in order: the Python launcher (py -3), Python 3.13 / 3.12 / 3.11 installed for this user, then Node.js.
rem Close this window to stop the server.
cd /d "%~dp0"
set PORT=8000
set "SERVER="

rem 1. Python launcher
py -3 -c "import http.server" >nul 2>nul && set "SERVER=py -3 -m http.server %PORT% --bind 127.0.0.1"

rem 2. Python installed for this user (skips the broken or store-redirect "python" on PATH)
if not defined SERVER for %%V in (313 312 311 310) do (
  if not defined SERVER if exist "%LOCALAPPDATA%\Programs\Python\Python%%V\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python%%V\python.exe" -c "import http.server" >nul 2>nul && set "SERVER="%LOCALAPPDATA%\Programs\Python\Python%%V\python.exe" -m http.server %PORT% --bind 127.0.0.1"
  )
)

rem 3. Node.js (a tiny built-in file server)
if not defined SERVER (
  where node >nul 2>nul && set "SERVER=node tools\serve.js . %PORT%"
)

if not defined SERVER (
  echo No working Python 3 or Node.js was found.
  echo Install Python from https://www.python.org/downloads/ ^(tick "Add python.exe to PATH"^) and run this file again.
  pause
  exit /b 1
)

start "" http://localhost:%PORT%/
echo Kovai Streets is running at http://localhost:%PORT%/  (close this window to stop it)
echo Using: %SERVER%
%SERVER%
