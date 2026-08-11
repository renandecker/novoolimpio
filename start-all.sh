#!/bin/bash
# Sobe o Postgres, o broker Kafka, os 11 microsservicos (cada um na sua porta), o gateway e o app React.
# Uso:
#   ./start-all.sh          # builda (se preciso) e sobe tudo, acompanhando os logs
#   ./start-all.sh -d       # sobe tudo em background
set -e
cd "$(dirname "$0")"

LOGFILE="$(dirname "$0")/error.log"

if ! command -v docker &> /dev/null; then
    echo "[ERRO] Docker nao encontrado. Instale o Docker antes de continuar: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "Verificando se o Docker Desktop esta pronto..."
ATTEMPT=0
while ! docker info > /dev/null 2>&1; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ "$ATTEMPT" -ge 30 ]; then
        echo ""
        echo "[ERRO] Docker Desktop nao respondeu apos 60 segundos."
        echo "  1. Abra o Docker Desktop e aguarde ate ficar verde"
        echo "  2. Verifique se o Linux engine esta rodando"
        echo "  3. Reinicie o Docker Desktop se necessario"
        echo "  4. Execute novamente: ./start-all.sh"
        exit 1
    fi
    echo "  Aguardando Docker Desktop iniciar... ($ATTEMPT/30)"
    sleep 2
done
echo "Docker Desktop pronto."

if docker compose version &> /dev/null; then
    DC="docker compose"
elif command -v docker-compose &> /dev/null; then
    DC="docker-compose"
else
    echo "[ERRO] docker compose ou docker-compose nao encontrado."
    exit 1
fi

echo "============================================"
echo " Verificando servicos ja em execucao..."
echo "============================================"

if $DC ps -q > /dev/null 2>&1; then
    RUNNING=$($DC ps -q 2> /dev/null | wc -l)
    if [ "$RUNNING" -gt 0 ]; then
        echo " Encontrados containers em execucao. Derrubando antes de subir novamente..."
        if ! $DC down 2> "$LOGFILE"; then
            echo ""
            echo "[ERRO] Falha ao derrubar os containers existentes. Detalhes em error.log:"
            cat "$LOGFILE"
            exit 1
        fi
        echo " Containers existentes derrubados. Dados do banco preservados."
    fi
fi

echo "============================================"
echo " Subindo Postgres, Kafka, 11 microsservicos, gateway e app React..."
echo "============================================"

if [ "$1" == "-d" ]; then
    if ! $DC up --build -d 2> "$LOGFILE"; then
        echo ""
        echo "[ERRO] Falha ao subir os containers. Detalhes em error.log:"
        cat "$LOGFILE"
        exit 1
    fi
    echo ""
    echo "[SUCESSO] Todos os containers subiram em background."
    echo ""
    echo "Enderecos:"
    echo "  App React:  http://localhost:3000"
    echo "  Gateway:    http://localhost:8080/api/<modulo>/..."
    echo "  Kafka:      http://localhost:9092"
    echo "  basico:     http://localhost:8081"
    echo "  central:    http://localhost:8083"
    echo "  comercial:  http://localhost:8084"
    echo "  educacao:   http://localhost:8085"
    echo "  estoque:    http://localhost:8086"
    echo "  financeiro: http://localhost:8087"
    echo "  login:      http://localhost:8090"
    echo "  professor:  http://localhost:8091"
    echo "  relatorios: http://localhost:8088"
    echo "  schedule:   http://localhost:8089"
    echo ""
    echo "Use '$DC logs -f <servico>' para acompanhar logs de um servico."
    echo "Use './stop-all.sh' para parar todos os containers."
else
    if ! $DC up --build 2> "$LOGFILE"; then
        echo ""
        echo "[ERRO] Falha ao subir os containers. Detalhes em error.log:"
        cat "$LOGFILE"
        exit 1
    fi
    echo ""
    echo "[SUCESSO] Todos os containers estao rodando."
    echo "  App React: http://localhost:3000"
    echo "  Gateway:   http://localhost:8080"
    echo "  Login:     http://localhost:8090"
    echo ""
    echo "Pressione Ctrl+C para parar todos os containers."
fi