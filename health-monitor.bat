@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

set SERVICES=login:8090 basico:8081 notificacoes:8082 central:8083 comercial:8084 educacao:8085 estoque:8086 financeiro:8087 relatorios:8088 schedule:8089 professor:8091 aluno:8092 asaas:8094 curriculo:8095 fiserv:8097 gateway:8080 web:3000

set TOTAL=0
for %%s in (%SERVICES%) do set /a TOTAL+=1

set MAX_WAIT=180
set WAITED=0

echo ============================================
echo  Monitorando Saude dos Servicos %TOTAL% servicos
echo ============================================
echo.

:wait_loop
set CHECKED=0
set HEALTHY=0
set FAIL_LIST=

for %%s in (%SERVICES%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        call :check_health %%a %%b
    )
)

echo.
echo --------------------------------------------
echo  Rodada: !WAITED!s / %MAX_WAIT%s  ^|  Saudaveis: !HEALTHY!/%TOTAL%
echo --------------------------------------------
if defined FAIL_LIST echo  Aguardando: !FAIL_LIST!
if not defined FAIL_LIST echo  Todos os servicos estao operacionais.
echo --------------------------------------------

if !HEALTHY! equ !TOTAL! goto all_healthy
if !WAITED! geq !MAX_WAIT! goto timeout_reached

set /a WAITED+=5
timeout /t 5 /nobreak >nul
goto wait_loop

:all_healthy
echo.
echo ============================================
echo  [SUCESSO] Todos os %TOTAL% servicos estao saudaveis!
echo ============================================
timeout /t 10 >nul
exit /b 0

:timeout_reached
echo.
echo ============================================
echo  [AVISO] Tempo limite de %MAX_WAIT%s atingido.
echo  Servicos operacionais: !HEALTHY!/%TOTAL%
echo  Servicos com problema: !FAIL_LIST!
echo ============================================
timeout /t 10 >nul
exit /b 1

:check_health
set SVC_NAME=%1
set SVC_PORT=%2

set HEALTH_PATH=/q/health
if "%SVC_PORT%"=="3000" set HEALTH_PATH=/

curl -sL -f http://localhost:%SVC_PORT%%HEALTH_PATH% >nul 2>&1
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
