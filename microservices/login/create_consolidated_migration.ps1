powershell -ExecutionPolicy Bypass -Command $
# Define the source and output paths
$sourcePath = 'C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices\login\src\main\resources\db\migration\login'
$legacyPath = 'C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices\login\src\main\resources\db\legacy\login'
$outputPath = 'C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices\login\src\main\resources\db\migration\login\V1_2_1.sql'

# Create output directory if it doesn't exist
if (-not (Test-Path (Split-Path $outputPath -Parent))) {
    New-Item -ItemType Directory -Path (Split-Path $outputPath -Parent) -Force
}

# Header content
$header = @"
-- V1_2_1 - Consolidated migration file for version 1.2.1
-- This file consolidates the following versions:
-- V1_2__InsertPadrao
-- V1_2_1__InsertPadrao Comercial
-- V1_3__Nova tabela TipoCanal
-- V1_3_1__InsertPadrao TipoCanal
-- V1_3_2__Nova tabela Estrategia
-- V1_3_3__Nova tabela Filtro
-- V1_3_4__Novas tabelas Pacote Campanha Acao de Campanha
-- V1_4_0__Melhoria_Query_Radar

-- Legacy files included:
-- V1_4_452__ajustes_chamada_assinada.sql
-- V1_4_453__ajustes_chamada_assinada.sql
-- V1_4_454__ajustes_contrato.sql
-- V1_4_455__oferecimento_grupo.sql
-- V1_4_456__etapas_regras.sql
-- V1_4_457__ajustes_digitalizacao_chamada.sql
-- V1_4_458__ajustes_logradouro.sql
-- V1_4_459__ajustes_regras_etapas.sql
-- V1_4_460__ajustes_estoque.sql
-- V1_4_461__ajustes_oferecimento.sql
-- V1_4_462__ajustes_juridica_custo_servico.sql
-- V1_4_463__ajustes_caderno.sql
-- V1_4_464__ajustes_coonf_parcela.sql
-- V1_4_465__ajustes_matricula.sql
-- V1_4_466__ajuste_parcela.sql
-- V1_4_467__ajustes_email.sql
-- V1_4_468__ajustes_oferecimento.sql
-- V1_4_469__ajustes_usuario_hierarquia.sql
-- V1_4_470__ajustes_email.sql
-- V1_4_471__ajustes_conf_impressora.sql
-- V1_4_472__criacao_rede_franquia.sql
-- V1_4_473__whatsap_telegram.sql
-- V1_4_574__ajuste_cancelamento.sql
-- V1_4_575__ajuste_oferecimento_salas.sql
-- V1_4_576__relatorios.sql
-- V1_4_577__importador.sql
-- V1_4_578__documento_aluno.sql
-- V1_4_579__IndicesDasTabelas.sql

"@

# Write the header to the output file
$header | Out-File -FilePath $outputPath -Encoding UTF8 -NoNewline

# Files to include
$filesToInclude = @(
    'V1_2__InsertPadrao.sql',
    'V1_2_1__InsertPadrao Comercial.sql',
    'V1_3__Nova tabela TipoCanal.sql',
    'V1_3_1__InsertPadrao TipoCanal.sql',
    'V1_3_2__Nova tabela Estrategia.sql',
    'V1_3_3__Nova tabela Filtro.sql',
    'V1_3_4__Novas tabelas Pacote Campanha Acao de Campanha.sql',
    'V1_4_0__Melhoria_Query_Radar.sql'
)

# Add each file to the consolidated output
foreach ($file in $filesToInclude) {
    $filePath = Join-Path $sourcePath $file
    if (Test-Path $filePath) {
        Get-Content -Path $filePath -Raw | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
        "`n" | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
    }
}

# Add legacy files (with references)
$legacyFiles = Get-ChildItem -Path $legacyPath -Filter "*.sql" | Sort-Object Name
foreach ($file in $legacyFiles) {
    $filePath = Join-Path $legacyPath $file.Name
    "-- $($file.Name)`n" | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
    Get-Content -Path $filePath -Raw | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
    "`n`n" | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
}

Write-Host "Consolidated V1_2_1.sql file created successfully at: $outputPath"
