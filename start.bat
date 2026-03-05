@echo off
title Agency OS

echo.
echo   ============================================
echo    AGENCY OS — Starting up...
echo   ============================================
echo.

:: Check for updates
echo   Checking for updates...
git fetch origin main --quiet 2>nul
if %errorlevel% == 0 (
    for /f %%i in ('git rev-list HEAD..origin/main --count 2^>nul') do set COMMITS=%%i
    if defined COMMITS if not "%COMMITS%"=="0" (
        echo.
        echo   [UPDATE AVAILABLE] %COMMITS% new commit(s) on GitHub.
        echo.
        set /p DOUPDATE="   Apply update now? (y/n): "
        if /i "%DOUPDATE%"=="y" (
            echo   Pulling latest code...
            git pull origin main
            echo   Installing dependencies...
            npm install --silent
            echo   Update complete! Restarting...
            echo.
        )
    ) else (
        echo   Agency OS is up to date.
    )
) else (
    echo   (Could not check for updates — offline or git not configured)
)

echo.
echo   Starting Agency OS...
echo   Open: http://localhost:5173
echo.
npm run dev
