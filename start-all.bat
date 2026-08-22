@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"
set COMPILE_LOG=%~dp0compile-errors.log
set DOCKER_LOG=%~dp0docker-compose.log

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
        %DC% down --remove-orphans 2> "%DOCKER_LOG%"
        if !errorlevel! neq 0 (
            echo [ERRO] Falha ao derrubar containers. Detalhes em docker-compose.log
            exit /b 1
        )
        docker network rm olimpio_default >nul 2>&1
        echo  Containers derrubados.
    )
)

echo ============================================
echo  Limpando logs anteriores...
echo ============================================

if exist "%COMPILE_LOG%" del "%COMPILE_LOG%"
if exist "%DOCKER_LOG%" del "%DOCKER_LOG%"

echo ============================================
echo  Verificando compilacao dos microsservicos...
echo ============================================

set COMPILE_ERRORS=0
for %%s in (aluno asaas basico central comercial curriculo educacao estoque financeiro fiserv login notificacoes professor relatorios schedule) do (
    call :do_compile %%s
)

if "!COMPILE_ERRORS!" neq "0" (
    echo.
    echo [ERRO] Nem todos os microsservicos compilaram.
    echo   Detalhes em: %COMPILE_LOG%
    exit /b 1
)

echo Todos os microsservicos compilaram com sucesso.

echo ============================================
echo  Subindo containers com acompanhamento em tempo real...
echo ============================================

if "%1"=="-d" goto start_bg_with_progress
goto start_fg_with_progress

:do_compile
set SVC=%~1
if not exist "microservices\%SVC%\pom.xml" goto :eof

mvn -B -f "microservices\%SVC%\pom.xml" compile -DskipTests >> "%COMPILE_LOG%" 2>&1

if !errorlevel! neq 0 (
    echo   [ERRO] %SVC% (Detalhes no arquivo unico: %COMPILE_LOG%)
    set COMPILE_ERRORS=1
) else (
    echo   [OK] %SVC%
)
goto :eof

:start_bg_with_progress
echo.
echo Iniciando containers em background com monitoramento de saude...
echo.

%DC% up --build -d 2> "%DOCKER_LOG%"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao subir containers. Detalhes em: %DOCKER_LOG%
    echo.
    echo Ultimas linhas do log:
    powershell -Command "Get-Content '%DOCKER_LOG%' -Tail 20" 2>nul
    exit /b 1
)

echo.
echo Containers iniciados. Aguardando servicos ficarem saudaveis...
echo.

set SERVICES=login:8090 basico:8081 notificacoes:8082 central:8083 comercial:8084 educacao:8085 estoque:8086 financeiro:8087 relatorios:8088 schedule:8089 professor:8091 aluno:8092 asaas:8094 curriculo:8095 fiserv:8097 gateway:8080 web:3000
set TOTAL=0
for %%s in (%SERVICES%) do set /a TOTAL+=1

set CHECKED=0
set HEALTHY=0
set MAX_WAIT=180
set WAITED=0

:wait_loop
set CHECKED=0
set HEALTHY=0
set FAIL_LIST=
for %%s in (%SERVICES%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        call :check_health %%a %%b
    )
)

if !HEALTHY! equ !TOTAL! goto bg_all_healthy
if !WAITED! geq !MAX_WAIT! goto bg_timeout

set /a WAITED+=5
echo [AGUARDANDO] !HEALTHY!/!TOTAL! servicos saudaveis... !WAITED!s/!MAX_WAIT!s
if defined FAIL_LIST echo   Aguardando: !FAIL_LIST!
timeout /t 5 /nobreak >nul
goto wait_loop

:bg_all_healthy
echo.
echo ============================================
echo  [SUCESSO] Todos os %TOTAL% servicos estao saudaveis!
echo ============================================
goto show_endpoints

:bg_timeout
echo.
echo ============================================
echo  [AVISO] Tempo maximo atingido %MAX_WAIT% seg.
echo  Servicos operacionais: !HEALTHY!/%TOTAL%
echo  Servicos com problema: !FAIL_LIST!
echo.
echo  Verifique os logs com: docker compose logs -f [servico]
echo ============================================
goto show_endpoints

:check_health
set SVC_NAME=%1
set SVC_PORT=%2

set HEALTH_PATH=/q/health
if "%SVC_PORT%"=="3000" set HEALTH_PATH=/

curl -sL -f http://localhost:%SVC_PORT%%HEALTH_PATH% >nul 2>&1
if !errorlevel! equ 0 (
    set /a CHECKED+=1
    set /a HEALTHY+=1
) else (
    set /a CHECKED+=1
    if defined FAIL_LIST (
        set "FAIL_LIST=!FAIL_LIST!, %SVC_NAME%:%SVC_PORT%"
    ) else (
        set "FAIL_LIST=%SVC_NAME%:%SVC_PORT%"
    )
)
goto :eof

:show_endpoints
echo.
echo Enderecos disponiveis:
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
echo   fiserv:       http://localhost:8097
echo   professor:    http://localhost:8091
echo   relatorios:   http://localhost:8088
echo   schedule:     http://localhost:8089
echo.
echo Logs:
echo   Compilacao:   %COMPILE_LOG%
echo   Docker:       %DOCKER_LOG%
echo.
echo Use "%DC% logs -f [servico]" para acompanhar logs.
echo Use "stop-all.bat" para parar.
goto :eof

:start_fg_with_progress
echo.
echo Iniciando servicos com logs em tempo real...
echo Pressione Ctrl+C para parar.
echo.

echo Iniciando monitoramento de saude em janela separada...
start "Health Monitor" cmd /k "%~dp0health-monitor.bat"

%DC% up --build 2> "%DOCKER_LOG%"
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao subir containers.
    echo   Detalhes em: %DOCKER_LOG%
    exit /b 1
)

echo.
echo [SUCESSO] Todos os containers estao rodando.
echo   App React: http://localhost:3000
echo   Gateway:   http://localhost:8080
echo   Login:     http://localhost:8090

endlocal