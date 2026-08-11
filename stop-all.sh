#!/bin/bash
# Para todos os containers. Use -v para tambem apagar os dados do banco (volume).
set -e
cd "$(dirname "$0")"

LOGFILE="$(dirname "$0")/error.log"

if ! command -v docker &> /dev/null; then
    echo "[ERRO] Docker nao encontrado."
    exit 1
fi

if docker compose version &> /dev/null; then
    DC="docker compose"
else
    DC="docker-compose"
fi

if [ "$1" == "-v" ]; then
    echo "Parando tudo, apagando as imagens e os dados do banco..."
    if $DC down --rmi all -v 2> "$LOGFILE"; then
        echo "[SUCESSO] Containers removidos, imagens apagadas e dados do banco apagados."
    else
        echo "[ERRO] Falha ao parar os containers. Detalhes em error.log:"
        cat "$LOGFILE"
        exit 1
    fi
else
    echo "Parando tudo e apagando as imagens (dados do banco preservados)..."
    if $DC down --rmi all 2> "$LOGFILE"; then
        echo "[SUCESSO] Containers removidos e imagens apagadas. Dados do banco preservados."
    else
        echo "[ERRO] Falha ao parar os containers. Detalhes em error.log:"
        cat "$LOGFILE"
        exit 1
    fi
fi