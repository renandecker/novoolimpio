@echo off
setlocal enabledelayedexpansion

:: Criar pasta para os recursos da ferramenta
set PASTA=recursos-ferramenta
if not exist "%PASTA%" mkdir "%PASTA%"

:: Criar arquivo .env
set ENV_FILE=%PASTA%\%.env
if not exist "%ENV_FILE%" (
    echo # .env - configuracao para a ferramenta Olimpio > "%ENV_FILE%"
    echo >> "%ENV_FILE%"
    echo # Banco de dados >> "%ENV_FILE%"
    echo DATABASE_URL=postgresql://localhost:5454/olimpio >> "%ENV_FILE%"
    echo DATABASE_JDBC_URL=jdbc:postgresql://localhost:5454/olimpio >> "%ENV_FILE%"
    echo DATABASE_USER=postgres >> "%ENV_FILE%"
    echo DATABASE_PASSWORD=postgres >> "%ENV_FILE%"
    echo >> "%ENV_FILE%"
    echo # JWT >> "%ENV_FILE%"
    for /f "delims=" %%S in ('powershell -NoProfile -Command "[guid]::NewGuid().ToString()+[guid]::NewGuid().ToString()"') do >>"%ENV_FILE%" echo JWT_SECRET=%%S
    echo >> "%ENV_FILE%"
    echo # Kafka >> "%ENV_FILE%"
    echo KAFKA_BOOTSTRAP_SERVERS=localhost:9092 >> "%ENV_FILE%"
    echo >> "%ENV_FILE%"
    echo "Arquivo .env criado em %ENV_FILE%"
)

:: Criar pasta microservices (se nao existir)
if not exist microservices mkdir microservices

:: Criar pasta docker
if not exist docker mkdir docker

:: Criar pasta docker/postgres
if not exist docker\postgres mkdir docker\postgres

:: Criar pasta docker/gateway
if not exist docker\gateway mkdir docker\gateway

echo.
echo Pasta "%PASTA%" criada com arquivos necessarios para levantar a ferramenta.
echo .
echo Arquivos criados:
echo   - %PASTA%\%.env
echo   - Estrutura de pastas: microservices, docker, docker/postgres, docker/gateway
echo.
endlocal