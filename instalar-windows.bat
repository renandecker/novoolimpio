@echo off
title Instalador - Olimpio Microservices - Windows
setlocal enabledelayedexpansion

echo ============================================
echo  Instalador de recursos para Olimpio
echo ============================================
echo.

:: Verificar se Java ja esta instalado
java -version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Java ja esta instalado.
    for /f %%i in ('java -version 2^>^|find "version"') do (
        echo Version: %%i
    )
) else (
    echo [ERRO] Java nao encontrado.
    echo Por favor, instale o Java 17 ou superior manualmente.
    echo Download: https://adoptium.net/
    pause
    exit /b 1
)

:: Verificar se Maven ja esta instalado
mvn -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Maven ja esta instalado.
    mvn -v | find "Apache Maven"
) else (
    echo [INFO] Instalando Maven...
    if exist "%ProgramFiles%\Apache\Maven" (
        set MAVEN_HOME="%ProgramFiles%\Apache\Maven"
        set PATH=%PATH%;%ProgramFiles%\Apache\Maven\bin
        echo [OK] Maven encontrado em %ProgramFiles%\Apache\Maven
    ) else (
        echo [ERRO] Maven nao encontrado automaticamente.
        echo Baixe o Maven em: https://maven.apache.org/download.cgi
        pause
        exit /b 1
    )
)

:: Verificar se Docker Desktop esta instalado
where docker >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker encontrado no PATH.
    docker version --format "Client: {{.Client.Version}}" 2>nul
) else (
    echo [INFO] Verificando Docker Desktop...
    where "Docker Desktop" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Docker Desktop encontrado.
    ) else (
        echo [ERRO] Docker Desktop nao encontrado.
        echo Por favor, instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
        pause
        exit /b 1
    )
)

:: Verificar se git esta instalado
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git encontrado.
) else (
    echo [ERRO] Git nao encontrado.
    echo Por favor, instale o Git: https://git-scm.com/
    pause
    exit /b 1
)

:: Verificar se a pasta recursos existe
set PASTA=recursos-ferramenta
if not exist "%PASTA%" (
    echo.
    echo [INFO] Criando pasta de recursos...
    mkdir "%PASTA%"
    echo [OK] Pasta "%PASTA%" criada.
)

:: Verificar se .env existe
if not exist "%PASTA%\%.env" (
    echo [INFO] Criando arquivo .env...
    echo # .env - configuracao para a ferramenta Olimpio > "%PASTA%\%.env"
    echo >> "%PASTA%\%.env"
    echo # Banco de dados >> "%PASTA%\%.env"
    echo DATABASE_URL=postgresql://localhost:5454/olimpio >> "%PASTA%\%.env"
    echo DATABASE_JDBC_URL=jdbc:postgresql://localhost:5454/olimpio >> "%PASTA%\%.env"
    echo DATABASE_USER=postgres >> "%PASTA%\%.env"
    echo DATABASE_PASSWORD=postgres >> "%PASTA%\%.env"
    echo >> "%PASTA%\%.env"
    echo # JWT >> "%PASTA%\%.env"
    echo JWT_SECRET=troque-esta-chave-em-producao-olimpio >> "%PASTA%\%.env"
    echo >> "%PASTA%\%.env"
    echo # Kafka >> "%PASTA%\%.env"
    echo KAFKA_BOOTSTRAP_SERVERS=localhost:9092 >> "%PASTA%\%.env"
    echo [OK] Arquivo .env criado.
) else (
    echo [OK] Arquivo .env ja existe.
)

echo.
echo ============================================
echo  Instalacao concluida!
echo ============================================
echo.
echo Recursos instalados:
echo   - Java: %java_version%
echo   - Maven: %maven_version%
echo   - Docker: %docker_version%
echo   - .env: %PASTA%\%.env
echo.
echo Para levantar a ferramenta, execute:
echo   start-all.bat           # modo foreground
echo   start-all.bat -d        # modo background
echo.
pause