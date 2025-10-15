@echo off
echo Building the project...

REM Navigate to server directory and build the executable
cd server
call uv run pyinstaller --onefile --noconsole --specpath build_specs --name nd-forez-app src/run.py
if %ERRORLEVEL% NEQ 0 (
    echo PyInstaller build failed!
    exit /b %ERRORLEVEL%
)
REM Return to project root
cd ..

REM Navigate to client directory and build the frontend
cd client
call pnpm build
if %ERRORLEVEL% NEQ 0 (
    echo Frontend build failed!
    exit /b %ERRORLEVEL%
)
REM Return to project root
cd ..

REM Create release directory
if exist releases\Windows rmdir /s /q releases\Windows
mkdir releases\Windows

REM Copy the executable
copy server\dist\nd-forez-app.exe releases\Windows\
if %ERRORLEVEL% NEQ 0 (
    echo Failed to copy executable!
    exit /b %ERRORLEVEL%
)

REM Copy frontend build contents (index.html and assets) to public directory
xcopy /E /I client\dist\* releases\Windows\public\
if %ERRORLEVEL% NEQ 0 (
    echo Failed to copy frontend assets!
    exit /b %ERRORLEVEL%
)

REM Create empty database folder
mkdir releases\Windows\database

echo Build complete! Check the 'releases\Windows' directory for the executable and assets.
