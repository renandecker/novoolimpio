@echo off
setlocal enabledelayedexpansion

REM Script para commit e push de microservices (um repo por microservice) e frontend
REM Uso: commit-push.bat ["mensagem do commit"] [base_url_microservices] [base_url_frontend]
REM Default mensagem: "Ajustes"
REM Default base URL: https://github.com/renandecker/

set COMMIT_MSG=%~1
set MICRO_BASE_URL=%~2
set FRONT_BASE_URL=%~3

REM Default commit message
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Ajustes

REM Default base URL
if "%MICRO_BASE_URL%"=="" set MICRO_BASE_URL=https://github.com/renandecker
if "%FRONT_BASE_URL%"=="" set FRONT_BASE_URL=https://github.com/renandecker

echo ==========================================
echo Iniciando commit e push do projeto
echo Mensagem: "%COMMIT_MSG%"
echo ==========================================

REM Processa frontend
set "FRONT_REPO=school-react-web"
set "FULL_FRONT_URL=!FRONT_BASE_URL!/!FRONT_REPO!.git"
call :processRepo "web-react" "!FULL_FRONT_URL!" "!FRONT_REPO!"

REM Processa cada microservice como repo separado
echo.
echo ==========================================
echo Processando microservices (um repo cada)...
echo ==========================================

for /d %%D in (microservices\*) do (
    set "FOLDER=%%D"
    set "NAME=%%~nxD"
    set "REPO_NAME=school-!NAME!-micro-service"
    set "FULL_URL=!MICRO_BASE_URL!/!REPO_NAME!.git"
    call :processRepo "microservices\!NAME!" "!FULL_URL!" "!REPO_NAME!"
)

echo ==========================================
echo Processo concluido!
echo ==========================================
pause
exit /b 0

:processRepo
set FOLDER=%~1
set REMOTE_URL=%~2
set REPO_NAME=%~3

echo.
echo ----------------------------------------
echo Processando: %REPO_NAME% (%FOLDER%)
echo ----------------------------------------

if not exist "%FOLDER%" (
    echo Pasta %FOLDER% nao encontrada, pulando...
    exit /b 0
)

cd "%FOLDER%"

if not exist ".git" (
    echo Inicializando repositorio git em %FOLDER%...
    git init
    git branch -M main
    
    echo Configurando remote origin: %REMOTE_URL%
    git remote add origin %REMOTE_URL%
) else (
    echo Repositorio git ja existe em %FOLDER%
    git remote get-url origin >nul 2>&1
    if errorlevel 1 (
        echo Adicionando remote origin: %REMOTE_URL%
        git remote add origin %REMOTE_URL%
    ) else (
        echo Remote origin ja configurado
    )
)

git status --porcelain | findstr /r "^" >nul
if errorlevel 1 (
    echo Nenhuma mudanca para commit em %REPO_NAME%
    cd ..
    exit /b 0
)

echo Adicionando arquivos...
git add -A

echo Commitando com mensagem: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

git remote get-url origin >nul 2>&1
if not errorlevel 1 (
    echo Fazendo push para origin/main...
    git push -u origin main
) else (
    echo AVISO: Nenhum remote configurado para %REPO_NAME%. Push ignorado.
)

cd ..
exit /b 0