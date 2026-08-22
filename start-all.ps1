# start-all.ps1 - Wrapper PowerShell para start-all.bat
# Uso:
#   .\start-all.ps1          # builda e sobe tudo
#   .\start-all.ps1 -d       # sobe tudo em background

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$batFile = Join-Path $scriptDir "start-all.bat"

$arguments = @("/c", "`"$batFile`"") + $args

$process = Start-Process cmd.exe -ArgumentList $arguments -NoNewWindow -Wait -PassThru
exit $process.ExitCode