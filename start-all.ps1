# start-all.ps1 - Wrapper PowerShell para start-all.bat
# Uso:
#   .\start-all.ps1          # builda e sobe tudo
#   .\start-all.ps1 -d       # sobe tudo em background

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$batFile = Join-Path $scriptDir "start-all.bat"

if ($args.Count -gt 0 -and $args[0] -eq "-d") {
    Start-Process cmd.exe -ArgumentList "/c `"$batFile`" -d" -NoNewWindow -Wait
} else {
    Start-Process cmd.exe -ArgumentList "/c `"$batFile`"" -NoNewWindow -Wait
}
