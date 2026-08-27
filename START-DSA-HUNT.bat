@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo DSA Hunt - Production Starter
echo ========================================
cd backend
call npm install
if errorlevel 1 goto :error
call npm run seed
if errorlevel 1 goto :error
start "DSA Hunt Backend" cmd /k "npm run dev"
cd ..\frontend
call npm install
if errorlevel 1 goto :error
start "DSA Hunt Frontend" cmd /k "npm run dev"
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
exit /b 0
:error
echo.
echo Something went wrong. Check the message above.
pause
exit /b 1
