@echo off
echo Starting Alzheimer Detection Backend...
cd backend
call venv\Scripts\activate.bat
python app.py
pause
