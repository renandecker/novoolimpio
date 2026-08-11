# Consolidate Flyway migration files for version 1.2.1
# This script will:
# 1. Create V1_2_1.sql with all migration files
# 2. Move legacy files to the consolidated file
# 3. Remove original files and legacy folder

$sourcePath = 'C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices\login\src\main\resources\db\migration\login'
$legacyPath = 'C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices\login\src\main\resources\db\legacy\login'
$outputPath = "$sourcePath\V1_2_1.sql"

Write-Host "=== FLYWAY MIGRATION CONSOLIDATION ===" -ForegroundColor Yellow
Write-Host "Output file: $outputPath"

# Create header
$header = @"
-- V1_2_1 - Consolidated migration file for version 1.2.1
-- This file consolidates the following versions:
-- V1_2__InsertPadrao
-- V1_2_1__InsertPadrao Comercial

'@

# Write header to output file
$header | Out-File -FilePath $outputPath -Encoding UTF8 -NoNewline

# Files to consolidate
$filesToInclude = @(
    'V1_2__InsertPadrao.sql',
    'V1_2_1__InsertPadrao Comercial.sql'
)

Write-Host 'Adding main migration files...'

# Add each file to the consolidated output
foreach ($file in $filesToInclude) {
    $sourceFile = "$sourcePath\\$file"
    if (Test-Path $sourceFile) {
        Get-Content -Path $sourceFile -Raw | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
        "`n" | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Added: $file"
    } else {
        Write-Host "  ✗ ERROR: File not found: $sourceFile" -ForegroundColor Red
    }
}

# Add legacy files with references
$legacyFiles = Get-ChildItem -Path $legacyPath -Filter "*.sql" | Sort-Object Name

Write-Host 'Adding legacy files...'

foreach ($file in $legacyFiles) {
    $sourceFile = "$legacyPath\\$($file.Name)"
    "-- $($file.Name)`n" | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
    Get-Content -Path $sourceFile -Raw | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
    "`n`n" | Out-File -FilePath $outputPath -Append -Encoding UTF8 -NoNewline
    Write-Host "  ✓ Added legacy: $($file.Name)"
}

# Remove original files to be consolidated
Write-Host 'Cleaning up original files...'

foreach ($file in $filesToInclude) {
    $sourceFile = "$sourcePath\\$file"
    if (Test-Path $sourceFile) {
        Remove-Item -Path $sourceFile -Force
        Write-Host "  ✓ Removed: $file"
    }
}

# Remove legacy folder
if (Test-Path $legacyPath) {
    Remove-Item -Path $legacyPath -Recurse -Force
    Write-Host "  ✓ Removed legacy folder: $legacyPath"
}

Write-Host ''
Write-Host '=== CONSOLIDATION COMPLETE ===' -ForegroundColor Green
Write-Host "Output file: $outputPath"
Write-Host '======================================='
