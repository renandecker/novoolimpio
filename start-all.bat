@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"
set LOGFILE=%~dp0error.log

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker nao encontrado.
    exit /b 1
)

echo Verificando se o Docker Desktop esta pronto...
set ATTEMPT=0
:check_docker
docker info >nul 2>&1
if %errorlevel% equ 0 goto docker_ok
set /a ATTEMPT+=1
if !ATTEMPT! geq 30 (
    echo.
    echo [ERRO] Docker Desktop nao respondeu apos 60 segundos.
    exit /b 1
)
echo   Aguardando Docker Desktop iniciar... (!ATTEMPT!/30)
timeout /t 2 /nobreak >nul
goto check_docker

:docker_ok
echo Docker Desktop pronto.

docker compose version >nul 2>&1
if %errorlevel% equ 0 (
    set DC=docker compose
) else (
    docker-compose version >nul 2>&1
    if %errorlevel% equ 0 (
        set DC=docker-compose
    ) else (
        echo [ERRO] docker compose nao encontrado.
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
        echo  Encontrados containers. Derrubando antes de subir novamente...
        %DC% down --remove-orphans 2> "%LOGFILE%"
        if !errorlevel! neq 0 (
            echo [ERRO] Falha ao derrubar containers. Detalhes em error.log
            exit /b 1
        )
        docker network rm olimpio_default >nul 2>&1
        echo  Containers derrubados.
    )
)

echo ============================================
echo  Verificando compilacao dos microsservicos...
echo ============================================

if exist "%LOGFILE%" del "%LOGFILE%"
set COMPILE_ERRORS=0
for %%s in (aluno asaas basico central comercial curriculo educacao estoque financeiro fiserv login notificacoes professor relatorios schedule) do (
    call :do_compile %%s
)

if "!COMPILE_ERRORS!" neq "0" (
    echo.
    echo [ERRO] Nem todos os microsservicos compilaram.
    echo   Detalhes em error.log
    exit /b 1
)

echo Todos os microsservicos compilaram com sucesso.

echo ============================================
echo  Subindo containers...
echo ============================================

if "%1"=="-d" goto start_bg
goto start_fg

:do_compile
set SVC=%~1
if not exist "microservices\%SVC%\pom.xml" goto :eof
mvn -B -f "microservices\%SVC%\pom.xml" compile -DskipTests > "%LOGFILE%.mvn" 2>&1
if !errorlevel! neq 0 (
    echo ======================================== >> "%LOGFILE%"
    echo  ERRO: %SVC% >> "%LOGFILE%"
    echo ======================================== >> "%LOGFILE%"
    type "%LOGFILE%.mvn" >> "%LOGFILE%"
    del "%LOGFILE%.mvn" >nul 2>&1
    echo   [ERRO] %SVC%
    set COMPILE_ERRORS=1
) else (
    del "%LOGFILE%.mvn" >nul 2>&1
    echo   [OK] %SVC%
)
goto :eof

:start_bg
%DC% up --build -d 2> "%LOGFILE%"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao subir containers. Detalhes em error.log
    exit /b 1
)
echo.
echo [SUCESSO] Todos os containers subiram em background.
echo.
echo Enderecos:
echo   App React:    http://localhost:3000
echo   Gateway:      http://localhost:8080
echo   Kafka:        http://localhost:9092
echo   Postgres:     http://localhost:5454
echo   aluno:        http://localhost:8092
echo   asaas:        http://localhost:8094
echo   basico:       http://localhost:8081
echo   central:      http://localhost:8083
echo   comercial:    http://localhost:8084
echo   curriculo:    http://localhost:8095
echo   educacao:     http://localhost:8085
echo   estoque:      http://localhost:8086
echo   financeiro:   http://localhost:8087
echo   login:        http://localhost:8090
echo   notificacoes: http://localhost:8082
echo   fiserv:       http://localhost:8096
echo   professor:    http://localhost:8091
echo   relatorios:   http://localhost:8088
echo   schedule:     http://localhost:8089
echo.
echo Use "%DC% logs -f [servico]" para acompanhar logs.
echo Use "stop-all.bat" para parar.
goto :eof

:start_fg
%DC% up --build 2> "%LOGFILE%"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao subir containers. Detalhes em error.log
    exit /b 1
)
echo.
echo [SUCESSO] Todos os containers estao rodando.
echo   App React: http://localhost:3000
echo   Gateway:   http://localhost:8080
echo   Login:     http://localhost:8090
echo.
echo Pressione Ctrl+C para parar.

endlocal
