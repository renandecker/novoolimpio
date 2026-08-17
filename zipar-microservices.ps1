$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$microservicesPath = Join-Path $root 'microservices'
$zipadosPath = Join-Path $root 'zipados'

if (-not (Test-Path -LiteralPath $microservicesPath)) {
    Write-Error "Pasta 'microservices' nao encontrada em $root"
    exit 1
}

New-Item -ItemType Directory -Path $zipadosPath -Force | Out-Null

$services = Get-ChildItem -Path $microservicesPath -Directory

if ($services.Count -eq 0) {
    Write-Warning "Nenhum microservico encontrado em $microservicesPath"
    exit 0
}

$tempBase = Join-Path $env:TEMP "zipar-microservices"
if (Test-Path -LiteralPath $tempBase) {
    Remove-Item -LiteralPath $tempBase -Recurse -Force
}
New-Item -ItemType Directory -Path $tempBase -Force | Out-Null

foreach ($service in $services) {
    $name = $service.Name
    $srcPath = Join-Path $service.FullName 'src'
    $pomPath = Join-Path $service.FullName 'pom.xml'
    $zipFile = Join-Path $zipadosPath "$name.zip"

    if (-not (Test-Path -LiteralPath $srcPath)) {
        Write-Warning "Pulando '$name': pasta 'src' nao encontrada"
        continue
    }
    if (-not (Test-Path -LiteralPath $pomPath)) {
        Write-Warning "Pulando '$name': arquivo 'pom.xml' nao encontrado"
        continue
    }

    $tempDir = Join-Path $tempBase $name
    Copy-Item -LiteralPath $srcPath -Destination $tempDir -Recurse -Force
    Copy-Item -LiteralPath $pomPath -Destination $tempDir -Force

    Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $zipFile -Force

    Remove-Item -LiteralPath $tempDir -Recurse -Force
    Write-Host "Zipado: $zipFile"
}

Remove-Item -LiteralPath $tempBase -Recurse -Force
Write-Host ""
Write-Host "Concluido! Arquivos em: $zipadosPath"
