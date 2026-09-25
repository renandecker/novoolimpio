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
        endlocal & set "OLIMPIO_FROM_TEMP=1" & setlocal enabledelayedexpansion
        cmd /c "%TEMP%\olimpio-start-all.bat" %*
        set "RC=!errorlevel!"
        echo.
        if not "!RC!"=="0" (
            echo [ERRO] O script terminou com erro ^(codigo !RC!^).
            echo   Detalhes em: compile-errors.log
            echo   Detalhes em: docker-compose.log
        ) else (
            echo [SUCESSO] Script finalizado.
        )
        echo.
        pause
        exit /b !RC!
    )
    echo [AVISO] Nao foi possivel copiar para TEMP. Executando da pasta original...
)

set "EXIT_CODE=0"
set "OLIMPIO_WORKDIR="
if exist "%MARKER%" set /p OLIMPIO_WORKDIR=<"%MARKER%"
if not defined OLIMPIO_WORKDIR set "OLIMPIO_WORKDIR=%~dp0"
set COMPILE_LOG=%OLIMPIO_WORKDIR%compile-errors.log
set DOCKER_LOG=%OLIMPIO_WORKDIR%docker-compose.log

cd /d "%OLIMPIO_WORKDIR%"
if %errorlevel% neq 0 (
    echo [ERRO] Nao foi possivel entrar na pasta do projeto: %OLIMPIO_WORKDIR%
    call :log_error "%DOCKER_LOG%" "Nao foi possivel entrar na pasta do projeto."
    set "EXIT_CODE=1"
    goto :finish
)

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker nao encontrado.
    call :log_error "%DOCKER_LOG%" "Docker nao encontrado no PATH."
    set "EXIT_CODE=1"
    goto :finish
)

where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Maven ^(mvn^) nao encontrado no PATH.
    call :log_error "%COMPILE_LOG%" "Maven nao encontrado no PATH."
    set "EXIT_CODE=1"
    goto :finish
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
    call :log_error "%DOCKER_LOG%" "Docker Desktop nao respondeu apos 180 segundos."
    set "EXIT_CODE=1"
    goto :finish
)
echo   Aguardando Docker Desktop iniciar... (!ATTEMPT!/90)
ping -n 3 127.0.0.1 >nul
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
        call :log_error "%DOCKER_LOG%" "docker compose nao encontrado."
        set "EXIT_CODE=1"
        goto :finish
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
        %DC% down --remove-orphans 2>> "%DOCKER_LOG%"
        if !errorlevel! neq 0 (
            echo [ERRO] Falha ao derrubar containers. Detalhes em docker-compose.log
            call :log_error "%DOCKER_LOG%" "Falha ao derrubar containers."
            set "EXIT_CODE=1"
            goto :finish
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
    call :log_error "%COMPILE_LOG%" "Nenhum pom.xml encontrado em microservices."
    set "EXIT_CODE=1"
    goto :finish
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
            call :log_error "%COMPILE_LOG%" "Falha na compilacao do microsservico %%s."
            set COMPILE_ERRORS=1
        )
    )
)

if !OK_COUNT! neq !EXPECTED! set COMPILE_ERRORS=1

if "!COMPILE_ERRORS!" neq "0" (
    echo.
    echo [ERRO] Nem todos os microsservicos compilaram ^(!OK_COUNT!/!EXPECTED! ok^).
    echo   Detalhes em: %COMPILE_LOG%
    set "EXIT_CODE=1"
    goto :finish
)

echo Todos os !EXPECTED! microsservicos compilaram com sucesso.

echo ============================================
echo  Subindo containers...
echo ============================================

set COMPOSE_SVC=postgres rabbitmq restore basico notificacoes central comercial educacao estoque financeiro relatorios schedule professor login aluno curriculo asaas fiserv

%DC% up --build -d %COMPOSE_SVC% 2>> "%DOCKER_LOG%"
if !errorlevel! neq 0 (
    echo.
    echo [ERRO] Falha ao subir containers.
    echo   Detalhes em: %DOCKER_LOG%
    powershell -NoProfile -Command "Get-Content -LiteralPath '%DOCKER_LOG%' -Tail 20" 2>nul
    call :log_error "%DOCKER_LOG%" "Falha ao subir containers."
    set "EXIT_CODE=1"
    goto :finish
)

%DC% up -d --build --no-deps gateway web-react 2>> "%DOCKER_LOG%"
if !errorlevel! neq 0 (
    echo.
    echo [ERRO] Falha ao subir gateway e web-react.
    echo   Detalhes em: %DOCKER_LOG%
    powershell -NoProfile -Command "Get-Content -LiteralPath '%DOCKER_LOG%' -Tail 20" 2>nul
    call :log_error "%DOCKER_LOG%" "Falha ao subir gateway e web-react."
    set "EXIT_CODE=1"
    goto :finish
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

if !HEALTHY! equ !TOTAL! goto all_healthy
if !WAITED! geq !MAX_WAIT! goto wait_timeout

set /a WAITED+=5
echo [AGUARDANDO] !HEALTHY!/!TOTAL! servicos saudaveis... !WAITED!s/!MAX_WAIT!s
if defined FAIL_LIST echo   Aguardando: !FAIL_LIST!
ping -n 6 127.0.0.1 >nul
goto wait_loop

:wait_timeout
echo.
echo ============================================
echo  [AVISO] Tempo maximo atingido %MAX_WAIT% seg.
echo  Servicos operacionais: !HEALTHY!/%TOTAL%
echo  Servicos com problema: !FAIL_LIST!
echo.
echo  Verifique os logs com: docker compose logs -f [servico]
echo ============================================
call :log_error "%DOCKER_LOG%" "Timeout ao aguardar servicos saudaveis: !HEALTHY!/!TOTAL! - !FAIL_LIST!"
goto show_endpoints

:all_healthy
echo.
echo ============================================
echo  [SUCESSO] Todos os %TOTAL% servicos estao saudaveis!
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

curl -sL -f "http://localhost:3000/" >nul 2>&1
if !errorlevel! equ 0 (
    echo.
    echo Abrindo o app no navegador...
    start "" "http://localhost:3000"
) else (
    echo.
    echo [AVISO] App React nao respondeu em http://localhost:3000
    call :log_error "%DOCKER_LOG%" "App React nao respondeu em http://localhost:3000."
)
goto :keep_alive

:keep_alive
echo.
echo ============================================
echo  Os containers continuam rodando no Docker.
echo  Esta janela pode ser fechada com segurar CTRL+C.
echo ============================================

:keep_loop
set HEALTHY=0
set FAIL_LIST=
for %%s in (%SERVICES%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        call :check_health %%a %%b
    )
)
echo [%TIME%] Servicos saudaveis: !HEALTHY!/!TOTAL!
if defined FAIL_LIST echo   Com problema: !FAIL_LIST!
ping -n 31 127.0.0.1 >nul
goto keep_loop

:log_error
>> "%~1" echo [%DATE% %TIME%] [ERRO] %~2
goto :eof

:finish
echo.
echo ============================================
echo  Os containers continuam rodando no Docker.
echo  Para verificar: docker compose ps
echo  Para parar: stop-all.bat
echo  Logs: %COMPILE_LOG%
echo        %DOCKER_LOG%
echo ============================================
if not defined OLIMPIO_FROM_TEMP pause
endlocal & exit /b %EXIT_CODE%
