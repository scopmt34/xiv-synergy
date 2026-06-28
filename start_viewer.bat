@echo off
cd /d %~dp0
start "FFLogs Viewer Server" cmd /k python -m http.server 8765
timeout /t 1 /nobreak >nul
start http://localhost:8765/viewer.html
