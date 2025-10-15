@echo off
setlocal enabledelayedexpansion
echo Building the project...

REM Navigate to server directory and build the executable
pushd server
call uv sync --locked
call uv run pyinstaller --onefile --noconsole --specpath build_specs --name nd-forez-app src/run.py
if errorlevel 1 (
    echo PyInstaller build failed!
    popd
    exit /b 1
)
popd

REM Navigate to client directory and build the frontend
pushd client
call pnpm install --frozen-lockfile
call pnpm build
if errorlevel 1 (
    echo Frontend build failed!
    popd
    exit /b 1
)
popd

REM Create release directory
if exist releases\Windows rmdir /s /q releases\Windows
mkdir releases\Windows

REM Copy the executable
copy server\dist\nd-forez-app.exe releases\Windows\
if errorlevel 1 (
    echo Failed to copy executable!
    exit /b 1
)

REM Copy frontend build contents (index.html and assets) to public directory
xcopy /E /I client\dist\* releases\Windows\public\
if errorlevel 1 (
    echo Failed to copy frontend assets!
    exit /b 1
)

REM Create empty database folder
mkdir releases\Windows\database

echo Build complete! Check the 'releases\Windows' directory for the executable and assets.
exit /b 0
