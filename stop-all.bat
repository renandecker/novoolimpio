@echo off
REM Para todos os containers. Use -v para tambem apagar os dados do banco (volume).
setlocal enabledelayedexpansion

cd /d "%~dp0"
set "LOGFILE=%~dp0error.log"

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker nao encontrado.
    exit /b 1
)

docker compose version >nul 2>&1
if %errorlevel% equ 0 (
    set "DC=docker compose"
) else (
    docker-compose version >nul 2>&1
    if %errorlevel% equ 0 (
        set "DC=docker-compose"
    ) else (
        echo [ERRO] docker compose ou docker-compose nao encontrado.
        exit /b 1
    )
)

if "%1"=="-v" (
    echo Parando tudo, apagando as imagens e os dados do banco...
    %DC% down --rmi all -v --remove-orphans 2> "%LOGFILE%"
    set "DOWN_RESULT=!errorlevel!"
    docker network rm olimpio_default >nul 2>&1
    if "!DOWN_RESULT!" equ "0" (
        echo [SUCESSO] Containers removidos, imagens e dados do banco apagados.
    ) else (
        echo [ERRO] Falha ao parar os containers. Detalhes em error.log:
        type "%LOGFILE%"
        exit /b 1
    )
) else (
    echo Parando tudo e apagando as imagens (dados do banco preservados)...
    %DC% down --rmi all --remove-orphans 2> "%LOGFILE%"
    set "DOWN_RESULT=!errorlevel!"
    docker network rm olimpio_default >nul 2>&1
    if "!DOWN_RESULT!" equ "0" (
        echo [SUCESSO] Containers removidos e imagens apagadas. Dados do banco preservados.
    ) else (
        echo [ERRO] Falha ao parar os containers. Detalhes em error.log:
        type "%LOGFILE%"
        exit /b 1
    )
)

endlocal
