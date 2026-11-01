@echo off
title Fifty Music Server
cd /d "c:\Users\bakaz\OneDrive\Desktop\new\Fifty"
echo ========================================================
echo         Fifty - High-Fidelity Streaming Server
echo ========================================================
echo.
echo Starting Fifty Backend Server on http://localhost:5173 ...
echo Local Wi-Fi Access: http://192.168.18.182:5173
echo.
start /b node server.js
timeout /t 2 /nobreak >nul
echo.
echo Starting Cloudflare Public Tunnel for Mobile / Worldwide Access ...
echo.
cloudflared.exe tunnel --url http://localhost:5173
pause
