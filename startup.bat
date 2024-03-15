@echo off
:: Place this file in the root folder of the project

rem sends contents from logo.txt to the console
type boot_utilities\logo.txt
echo:

rem Local variables
call boot_utilities\config.bat

rem Check if conda is system installation or user installation
if exist %condapath% (
    echo Conda found in user directory
) else if exist C:\programdata\miniconda3 (
    set condapath=C:\programdata\miniconda3\Scripts\activate.bat
    echo Conda found in system directory
    :: TODO add check for pip and yarn
) else (
    echo Conda not found
    echo Please set manually the path to the conda activate.bat file in the config.bat file
    echo If Conda is not installed, please install Conda by following the instructions at https://docs.conda.io/projects/conda/en/latest/user-guide/install/
    exit /b
)

rem Check if front and backend folders exists
if not exist %repopath%\frontend (
    echo Frontend folder not found
    echo Creating frontend folder
    mkdir %repopath%\frontend
)
if not exist %repopath%\backend (
    echo Backend folder not found
    echo Creating backend folder
    mkdir %repopath%\backend
)

rem Check if .env.local file exists
if not exist %repopath%\frontend\.env.local (
    call boot_utilities\create_env.bat
)

rem try to start conda base environment
call %condapath% base
if %errorlevel% equ 0 (
    echo Conda base environment is now active.
) else (
    echo Conda base environment could not be activated/start or does not exist.
    exit /b
)

rem Check if Conda environment exists
call conda info --envs | findstr /i "\<%envname%\>" > nul
if %errorlevel% equ 0 (
    rem Environment exists, activate it
    echo Activating existing Conda environment: %envname%
    call %condapath% %envname%
) else (
    rem Environment doesn't exist, create and activate it
    echo Could not find Conda environment: %envname%
    echo Creating and activating new Conda environment
    call conda create --name %envname% %pythonver%
    call conda activate %envname%
    call conda install -q --yes yarn
    call conda install -q --yes pip
)
echo Conda environment %envname% is now active.

rem Starts the frontend and backend in separate cmd windows 
start cmd /k "title Text2Map Website && cd %repopath%\frontend && yarn install -s && yarn dev"
start cmd /k "title Text2Map API && cd %repopath%\backend && pip install --quiet -r requirements.txt && uvicorn main:app --reload"

rem check if server is running every second if not successfull after 20 seconds exit, if successfull open browser
setlocal
set /a count=0
:loop
timeout /t 1 >nul
set /a count+=1
curl -s http://localhost:3000 >nul
if %errorlevel% equ 0 (
    start "" http://localhost:8000/docs
    start "" http://localhost:3000
    exit /b
) else if %count% geq 20 (
    echo Server could not be started
    exit /b
) else (
    goto loop
)
