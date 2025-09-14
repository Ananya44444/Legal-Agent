@echo off
REM Run local development environment

REM Check if virtual environment exists and activate it
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Please run setup first.
    exit /b 1
)
call venv\Scripts\activate.bat

REM Set environment variables (these will need to be configured)
set GOOGLE_APPLICATION_CREDENTIALS=config/gcloud_config.json
set FLASK_APP=ai/ai_service.py
set FLASK_ENV=development

REM Start Flask server in background
start cmd /c "python -m flask run --port=8080"

REM Start Firebase emulators
cd functions
call npm install
cd ..
call firebase emulators:start --only functions,hosting

REM Keep window open
pause