@echo off
REM Script to consolidate Flyway migration files for version 1.2.1

setlocal enabledelayedexpansion

set "sourcePath=C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices\login\src\main\resources\db\migration\login"
set "legacyPath=C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices\login\src\main\resources\db\legacy\login"
set "outputPath=%sourcePath%\V1_2_1.sql"

echo Starting consolidation...
echo Source: %sourcePath%
echo Legacy: %legacyPath%
echo Output: %outputPath%

REM Create output file with header
echo -- V1_2_1 - Consolidated migration file for version 1.2.1 > "%outputPath%"
echo -- This file consolidates the following versions: >> "%outputPath%"
echo -- V1_2__InsertPadrao >> "%outputPath%"
echo -- V1_2_1__InsertPadrao Comercial >> "%outputPath%"
echo -- V1_3__Nova tabela TipoCanal >> "%outputPath%"
echo -- V1_3_1__InsertPadrao TipoCanal >> "%outputPath%"
echo -- V1_3_2__Nova tabela Estrategia >> "%outputPath%"
echo -- V1_3_3__Nova tabela Filtro >> "%outputPath%"
echo -- V1_3_4__Novas tabelas Pacote Campanha Acao de Campanha >> "%outputPath%"
echo -- V1_4_0__Melhoria_Query_Radar >> "%outputPath%"
echo. >> "%outputPath%"
echo -- Legacy files included: >> "%outputPath%"
echo -- V1_4_452__ajustes_chamada_assinada.sql >> "%outputPath%"
echo -- V1_4_453__ajustes_chamada_assinada.sql >> "%outputPath%"
echo -- V1_4_454__ajustes_contrato.sql >> "%outputPath%"
echo -- V1_4_455__oferecimento_grupo.sql >> "%outputPath%"
echo -- V1_4_456__etapas_regras.sql >> "%outputPath%"
echo -- V1_4_457__ajustes_digitalizacao_chamada.sql >> "%outputPath%"
echo -- V1_4_458__ajustes_logradouro.sql >> "%outputPath%"
echo -- V1_4_459__ajustes_regras_etapas.sql >> "%outputPath%"
echo -- V1_4_460__ajustes_estoque.sql >> "%outputPath%"
echo -- V1_4_461__ajustes_oferecimento.sql >> "%outputPath%"
echo -- V1_4_462__ajustes_juridica_custo_servico.sql >> "%outputPath%"
echo -- V1_4_463__ajustes_caderno.sql >> "%outputPath%"
echo -- V1_4_464__ajustes_coonf_parcela.sql >> "%outputPath%"
echo -- V1_4_465__ajustes_matricula.sql >> "%outputPath%"
echo -- V1_4_466__ajuste_parcela.sql >> "%outputPath%"
echo -- V1_4_467__ajustes_email.sql >> "%outputPath%"
echo -- V1_4_468__ajustes_oferecimento.sql >> "%outputPath%"
echo -- V1_4_469__ajustes_usuario_hierarquia.sql >> "%outputPath%"
echo -- V1_4_470__ajustes_email.sql >> "%outputPath%"
echo -- V1_4_471__ajustes_conf_impressora.sql >> "%outputPath%"
echo -- V1_4_472__criacao_rede_franquia.sql >> "%outputPath%"
echo -- V1_4_473__whatsap_telegram.sql >> "%outputPath%"
echo -- V1_4_574__ajuste_cancelamento.sql >> "%outputPath%"
echo -- V1_4_575__ajuste_oferecimento_salas.sql >> "%outputPath%"
echo -- V1_4_576__relatorios.sql >> "%outputPath%"
echo -- V1_4_577__importador.sql >> "%outputPath%"
echo -- V1_4_578__documento_aluno.sql >> "%outputPath%"
echo -- V1_4_579__IndicesDasTabelas.sql >> "%outputPath%"
echo. >> "%outputPath%"
echo. >> "%outputPath%"

REM Files to include in consolidation
set "files=V1_2__InsertPadrao.sql|V1_2_1__InsertPadrao Comercial.sql|V1_3__Nova tabela TipoCanal.sql|V1_3_1__InsertPadrao TipoCanal.sql|V1_3_2__Nova tabela Estrategia.sql|V1_3_3__Nova tabela Filtro.sql|V1_3_4__Novas tabelas Pacote Campanha Acao de Campanha.sql|V1_4_0__Melhoria_Query_Radar.sql"

for %%f in (%files%) do (
    set "filePath=%sourcePath%\%%f"
    if exist "!filePath!" (
        type "!filePath!" >> "%outputPath%"
        echo. >> "%outputPath%"
        echo Consolidated: %%f
    ) else (
        echo ERROR: File not found: !filePath!
    )
)

echo.
echo Adding legacy files...
for /r "!legacyPath!" %%f in (sql) do (
    set "relFile=%%f"
    set "relFileName=!relFile:~!legacyPath!="
    echo -- !relFileName! >> "%outputPath%"
    type "!relFile!" >> "%outputPath%"
    echo. >> "%outputPath%"
    echo. >> "%outputPath%"
    echo Legacy file added: !relFileName!
)

echo.
REM Remove the original files to be consolidated
for %%f in (%files%) do (
    set "filePath=%sourcePath%\%%f"
    if exist "!filePath!" (
        del "!filePath!"
        echo Removed: %%f
    )
)

REM Remove the legacy folder
if exist "!legacyPath!" (
    rmdir "!legacyPath!" /s /q
    echo Removed legacy folder: !legacyPath!
)

echo.
echo Consolidation complete!
echo Output file: %outputPath%
