@echo off
setlocal enabledelayedexpansion

title Monitor de Saude - Olimpio Microservicos
mode con: cols=110 lines=40

set SERVICES=login:8090 basico:8081 notificacoes:8082 central:8083 comercial:8084 educacao:8085 estoque:8086 financeiro:8087 relatorios:8088 schedule:8089 professor:8091 aluno:8092 asaas:8094 curriculo:8095 fiserv:8096 gateway:8080 web-react:3000
set TOTAL=0
for %%s in (%SERVICES%) do set /a TOTAL+=1

echo ========================================================================================
echo   MONITOR DE SAUDE EM TEMPO REAL - OLIMPIO MICROSERVICOS
echo ========================================================================================
echo.
echo   Aguardando containers subirem...
echo.

:loop
cls
echo ========================================================================================
echo   MONITOR DE SAUDE EM TEMPO REAL - OLIMPIO MICROSERVICOS
echo ========================================================================================
echo.
echo   Legenda: [OK] = Saudavel  [--] = Iniciando  [ER] = Erro  [NA] = N/A
echo ----------------------------------------------------------------------------------------
echo   SERVICO                       PORTA      STATUS     HTTP       TEMPO      DETALHES
echo ----------------------------------------------------------------------------------------

set HEALTHY=0
set CHECKED=0

for %%s in (%SERVICES%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        set SVC_NAME=%%a
        set SVC_PORT=%%b
        
        set STATUS=--
        set HTTP_CODE=000
        set RESP_TIME=0
        set DETAILS=Aguardando...
        
        for /f "tokens=1,2,3 delims= " %%x in ('curl -s -o nul -w "%%{http_code} %%{time_total} %%{url_effective}" --max-time 3 http://localhost:%%b/q/health 2^>nul') do (
            set HTTP_CODE=%%x
            set RESP_TIME=%%y
            if "%%x"=="200" (
                set STATUS=OK
                set DETAILS=Saudavel
                set /a HEALTHY+=1
            ) else (
                set STATUS=ER
                set DETAILS=HTTP %%x
            )
        )
        
        if "!HTTP_CODE!"=="000" (
            set STATUS=--
            set DETAILS=Iniciando...
        )
        
        set /a CHECKED+=1
        call :print_row "!SVC_NAME!" "!SVC_PORT!" "!STATUS!" "!HTTP_CODE!" "!RESP_TIME!" "!DETAILS!"
    )
)

echo ----------------------------------------------------------------------------------------
echo   Resumo: !HEALTHY! de !TOTAL! servicos saudaveis  ^|  Verificados: !CHECKED!  ^|  Atualizado: %TIME%
echo.
echo   Pressione Ctrl+C para parar o monitoramento
echo ========================================================================================

if !HEALTHY! equ !TOTAL! (
    echo.
    echo   *** TODOS OS SERVICOS ESTAO SAUDAVEIS! ***
    echo.
    timeout /t 10 /nobreak >nul
    goto loop
)

timeout /t 3 /nobreak >nul
goto loop

:print_row
set "NAME=%~1"
set "PORT=%~2"
set "STAT=%~3"
set "HTTP=%~4"
set "TIME=%~5"
set "DETL=%~6"

REM Padronizar larguras
set "NAME_PAD=!NAME!                    "
set "PORT_PAD=!PORT!          "
set "STAT_PAD=!STAT!          "
set "HTTP_PAD=!HTTP!          "
set "TIME_PAD=!TIME!          "
set "DETL_PAD=!DETL!          "

echo   !NAME_PAD:~0,30! !PORT_PAD:~0,10! !STAT_PAD:~0,10! !HTTP_PAD:~0,10! !TIME_PAD:~0,10!s !DETL_PAD:~0,30!
goto :eof