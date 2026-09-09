@echo off
setlocal
set "PROJECT_DIR=%~dp0"
set "NODE_EXE=%PROJECT_DIR%.runtime\node-v24.16.0-win-x64\node.exe"
set "VITE_JS=%PROJECT_DIR%node_modules\vite\bin\vite.js"

if not exist "%NODE_EXE%" (
  echo Portable Node was not found: %NODE_EXE%
  pause
  exit /b 1
)

start "Yuequn Figma Homepage" /min "%NODE_EXE%" "%VITE_JS%" --config "%PROJECT_DIR%vite.high-fi.config.ts" --host 127.0.0.1 --port 4174
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4174/high-fi/figma-homepage.html"
endlocal
