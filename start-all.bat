@echo off
setlocal enabledelayedexpansion

rem ================================================================
rem Reexecuta a partir de uma copia em %TEMP%.
rem A pasta do projeto fica dentro do OneDrive e o sincronizador
rem trava a leitura do proprio .bat durante os saltos (goto/call),
rem o que causa "nao e possivel localizar o rotulo em lote" e logs
rem corrompidos. Rodando fora do OneDrive isso nao acontece.
rem A pasta real do projeto e gravada num arquivo marcador em %TEMP%.
rem ================================================================
set "MARKER=%TEMP%\olimpio-workdir.txt"
if /i not "%OLIMPIO_FROM_TEMP%"=="1" (
    > "%MARKER%" echo(%~dp0
    copy /y "%~f0" "%TEMP%\olimpio-start-all.bat" >nul 2>&1
    if exist "%TEMP%\olimpio-start-all.bat" (
        endlocal & set "OLIMPIO_FROM_TEMP=1"
        cmd /c "%TEMP%\olimpio-start-all.bat" %*
        set RC=%errorlevel%
        exit /b %RC%
    )
    echo [AVISO] Nao foi possivel copiar para TEMP. Executando da pasta original...
)

set "OLIMPIO_WORKDIR="
if exist "%MARKER%" set /p OLIMPIO_WORKDIR=<"%MARKER%"
if not defined OLIMPIO_WORKDIR set "OLIMPIO_WORKDIR=%~dp0"
cd /d "%OLIMPIO_WORKDIR%"
if %errorlevel% neq 0 (
    echo [ERRO] Nao foi possivel entrar na pasta do projeto: %OLIMPIO_WORKDIR%
    exit /b 1
)
set COMPILE_LOG=%OLIMPIO_WORKDIR%compile-errors.log
set DOCKER_LOG=%OLIMPIO_WORKDIR%docker-compose.log

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker nao encontrado.
    exit /b 1
)

where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Maven ^(mvn^) nao encontrado no PATH.
    exit /b 1
)

echo Verificando se o Docker Desktop esta pronto...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
        echo   Daemon do Docker parado. Iniciando Docker Desktop...
        start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    ) else (
        echo   [AVISO] Docker Desktop nao encontrado em %ProgramFiles%. Aguardando o daemon mesmo assim...
    )
)

set ATTEMPT=0
:check_docker
docker info >nul 2>&1
if %errorlevel% equ 0 goto docker_ok
set /a ATTEMPT+=1
if !ATTEMPT! geq 90 (
    echo.
    echo [ERRO] Docker Desktop nao respondeu apos 180 segundos.
    exit /b 1
)
echo   Aguardando Docker Desktop iniciar... (!ATTEMPT!/90)
timeout /t 2 /nobreak >nul
goto check_docker

:docker_ok
echo Docker Desktop pronto.

docker compose version >nul 2>&1
if !errorlevel! equ 0 (
    set DC=docker compose
) else (
    docker-compose version >nul 2>&1
    if !errorlevel! equ 0 (
        set DC=docker-compose
    ) else (
        echo [ERRO] docker compose nao encontrado.
        exit /b 1
    )
)

echo ============================================
echo  Verificando servicos ja em execucao...
echo ============================================

set HAS_CONTAINERS=
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
echo  Removendo containers web-react e gateway...
echo ============================================

docker rm -f olimpio-web olimpio-web-react olimpio-gateway >nul 2>&1
echo  Containers web-react e gateway removidos (serao recriados no up).

echo ============================================
echo  Limpando logs anteriores...
echo ============================================

rem break> trunca sem apagar/recriar o arquivo (mais seguro com OneDrive).
break> "%COMPILE_LOG%" 2>nul
break> "%DOCKER_LOG%" 2>nul

echo ============================================
echo  Limpando cache do React (Vite)...
echo ============================================
if exist "web-react\node_modules\.vite" (
    rmdir /s /q "web-react\node_modules\.vite" 2>nul
    echo   Cache Vite removido.
) else (
    echo   Nenhum cache Vite encontrado.
)
if exist "web-react\dist" (
    rmdir /s /q "web-react\dist" 2>nul
    echo   Pasta dist removida.
)

echo ============================================
echo  Verificando compilacao dos microsservicos...
echo ============================================

set SVC_LIST=aluno asaas basico central comercial curriculo educacao estoque financeiro fiserv login notificacoes professor relatorios schedule

set EXPECTED=0
for %%s in (%SVC_LIST%) do (
    if exist "microservices\%%s\pom.xml" set /a EXPECTED+=1
)

if !EXPECTED! equ 0 (
    echo [ERRO] Nenhum pom.xml encontrado em microservices\.
    echo   Pasta do projeto: %OLIMPIO_WORKDIR%
    exit /b 1
)

set COMPILE_ERRORS=0
set OK_COUNT=0
for %%s in (%SVC_LIST%) do (
    if exist "microservices\%%s\pom.xml" (
        rem call e obrigatorio: mvn e um .cmd e sem call o contexto do script quebra.
        call mvn -B -f "microservices\%%s\pom.xml" compile -DskipTests >> "%COMPILE_LOG%" 2>&1
        if !errorlevel! equ 0 (
            echo   [OK] %%s
            set /a OK_COUNT+=1
        ) else (
            echo   [ERRO] %%s ^(Detalhes no arquivo unico: %COMPILE_LOG%^)
            set COMPILE_ERRORS=1
        )
    )
)

if !OK_COUNT! neq !EXPECTED! set COMPILE_ERRORS=1

if "!COMPILE_ERRORS!" neq "0" (
    echo.
    echo [ERRO] Nem todos os microsservicos compilaram ^(!OK_COUNT!/!EXPECTED! ok^).
    echo   Detalhes em: %COMPILE_LOG%
    exit /b 1
)

echo Todos os !EXPECTED! microsservicos compilaram com sucesso.

echo ============================================
echo  Subindo containers com acompanhamento em tempo real...
echo ============================================

if "%1"=="-d" goto start_bg_with_progress
goto start_fg_with_progress

:start_bg_with_progress
echo.
echo Iniciando containers em background com monitoramento de saude...
echo.

%DC% up --build -d 2> "%DOCKER_LOG%"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao subir containers. Detalhes em: %DOCKER_LOG%
    echo.
    echo Ultimas linhas do log:
    powershell -NoProfile -Command "Get-Content -LiteralPath \"%DOCKER_LOG%\" -Tail 20" 2>nul
    exit /b 1
)

echo.
echo Containers iniciados. Aguardando servicos ficarem saudaveis...
echo.

set SERVICES=login:8090 basico:8081 notificacoes:8082 central:8083 comercial:8084 educacao:8085 estoque:8086 financeiro:8087 relatorios:8088 schedule:8089 professor:8091 aluno:8092 asaas:8094 curriculo:8095 fiserv:8097 gateway:8080 web:3000
set TOTAL=0
for %%s in (%SERVICES%) do set /a TOTAL+=1

set HEALTHY=0
set MAX_WAIT=300
set WAITED=0

:wait_loop
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

curl -sL -f "http://localhost:%SVC_PORT%%HEALTH_PATH%" >nul 2>&1
if !errorlevel! equ 0 (
    set /a HEALTHY+=1
) else (
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
copy /y "%OLIMPIO_WORKDIR%\health-monitor.bat" "%TEMP%\olimpio-health-monitor.bat" >nul 2>&1
if exist "%TEMP%\olimpio-health-monitor.bat" (
    start "Health Monitor" cmd /k ""%TEMP%\olimpio-health-monitor.bat""
) else (
    start "Health Monitor" cmd /k ""%OLIMPIO_WORKDIR%\health-monitor.bat""
)

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
