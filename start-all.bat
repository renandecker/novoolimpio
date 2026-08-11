@echo off
REM Sobe o Postgres, o broker Kafka, os 11 microsservicos (cada um na sua porta), o gateway e o app React.
REM Uso:
REM   start-all.bat          # builda (se preciso) e sobe tudo, acompanhando os logs
REM   start-all.bat -d       # sobe tudo em background
setlocal enabledelayedexpansion

cd /d "%~dp0"
set "LOGFILE=%~dp0error.log"

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker nao encontrado. Instale o Docker Desktop antes de continuar: https://www.docker.com/products/docker-desktop/
    exit /b 1
)

echo Verificando se o Docker Desktop esta pronto...
set ATTEMPT=0
:check_docker
docker info >nul 2>&1
if %errorlevel% equ 0 goto :docker_ok
set /a ATTEMPT+=1
if !ATTEMPT! geq 30 goto :docker_timeout
echo   Aguardando Docker Desktop iniciar... ^(!ATTEMPT!/30^)
timeout /t 2 /nobreak >nul
goto :check_docker

:docker_timeout
echo.
echo [ERRO] Docker Desktop nao respondeu apos 60 segundos.
echo   1. Abra o Docker Desktop e aguarde ate ficar verde
echo   2. Verifique se o Linux engine esta rodando
echo   3. Reinicie o Docker Desktop se necessario
echo   4. Execute novamente: start-all.bat
exit /b 1

:docker_ok
echo Docker Desktop pronto.

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

echo ============================================
echo  Verificando servicos ja em execucao...
echo ============================================

%DC% ps -q >nul 2>&1
if %errorlevel% equ 0 (
    for /f %%i in ('%DC% ps -q') do set HAS_CONTAINERS=1
    if defined HAS_CONTAINERS (
        echo  Encontrados containers em execucao. Derrubando antes de subir novamente...
        %DC% down 2> "%LOGFILE%"
        if %errorlevel% neq 0 (
            echo.
            echo [ERRO] Falha ao derrubar os containers existentes. Detalhes em error.log:
            type "%LOGFILE%"
            exit /b 1
        )
        echo  Containers existentes derrubados. Dados do banco preservados.
    )
)

echo ============================================
echo  Subindo Postgres, Kafka, 11 microsservicos, gateway e app React...
echo ============================================

if "%1"=="-d" (
    %DC% up --build -d 2> "%LOGFILE%"
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha ao subir os containers. Detalhes em error.log:
        type "%LOGFILE%"
        exit /b 1
    )
    echo.
    echo [SUCESSO] Todos os containers subiram em background.
    echo.
    echo Enderecos:
    echo   App React:  http://localhost:3000
    echo   Gateway:    http://localhost:8080/api/^<modulo^>/...
    echo   Kafka:      http://localhost:9092
    echo   basico:     http://localhost:8081
    echo   central:    http://localhost:8083
    echo   comercial:  http://localhost:8084
    echo   educacao:   http://localhost:8085
    echo   estoque:    http://localhost:8086
    echo   financeiro: http://localhost:8087
    echo   login:      http://localhost:8090
    echo   professor:  http://localhost:8091
    echo   relatorios: http://localhost:8088
    echo   schedule:   http://localhost:8089
    echo.
    echo Use "%DC% logs -f ^<servico^>" para acompanhar logs de um servico.
    echo Use "stop-all.bat" para parar todos os containers.
) else (
    %DC% up --build 2> "%LOGFILE%"
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha ao subir os containers. Detalhes em error.log:
        type "%LOGFILE%"
        exit /b 1
    )
    echo.
    echo [SUCESSO] Todos os containers estao rodando.
    echo   App React: http://localhost:3000
    echo   Gateway:   http://localhost:8080
    echo   Login:     http://localhost:8090
    echo.
    echo Pressione Ctrl+C para parar todos os containers.
)

endlocal