@echo off

::Place this file in the root folder of the project
::Change the following paths to match your local installation
::Remember to change the pahs at the bottom of the file as well

::Check if conda is system installation or user installation

set condapath=C:\%homepath%\miniconda3\Scripts\activate.bat
set envname=Text2Map
set repopath=.
set test=false

if exist %condapath% (
    set test=true
    echo Conda found in user directory
) else if exist C:\programdata\miniconda3 (
    set condapath=C:\programdata\miniconda3\Scripts\activate.bat
    echo Conda found in system directory
) else (
    echo Conda not found
    exit /b
)

rem Check if front and backend folders exists
if not exist %repopath%\frontend (
    echo Frontend folder not found
    exit /b
)

rem Check if .env.local file exists
if not exist %repopath%\frontend\.env.local (
    call boot_utilities\create_env.bat
)

rem Check if Conda environment exists
call conda info --envs | findstr /i "\<%envname%\>" > nul
if %errorlevel% equ 0 (
    rem Environment exists, activate it
    echo Activating existing Conda environment: %envname%
    call %condapath% %envname%
) else (
    rem Environment doesn't exist, create and activate it
    echo Creating and activating new Conda environment: %envname%
    call conda create --name %envname% python=3.8
    call conda activate %envname%
    call conda install yarn
    call conda install pip
)
echo Conda environment %envname% is now active.

:: Enter path to local installation 
start cmd /k "cd %repopath%\frontend && yarn install && start "" https://localhost:3000 && yarn dev"
start cmd /k "cd %repopath%\backend && pip install -r requirements.txt && uvicorn main:app --reload"