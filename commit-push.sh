#!/bin/bash

# Script para commit e push de microservices (um repo por microservice) e frontend
# Uso: ./commit-push.sh ["mensagem do commit"] [base_url_microservices] [base_url_frontend]
# Default mensagem: "Ajustes"
# Default base URL: https://github.com/renandecker/

set -e

COMMIT_MSG="${1:-Ajustes}"
MICRO_BASE_URL="${2:-https://github.com/renandecker}"
FRONT_BASE_URL="${3:-https://github.com/renandecker}"

echo "=========================================="
echo "Iniciando commit e push do projeto"
echo "Mensagem: \"$COMMIT_MSG\""
echo "=========================================="

# Função para processar um repositório
process_repo() {
    local folder="$1"
    local remote_url="$2"
    local repo_name="$3"
    
    echo ""
    echo "----------------------------------------"
    echo "Processando: $repo_name ($folder)"
    echo "----------------------------------------"
    
    if [[ ! -d "$folder" ]]; then
        echo "Pasta $folder não encontrada, pulando..."
        return 0
    fi
    
    cd "$folder"
    
    if [[ ! -d ".git" ]]; then
        echo "Inicializando repositório git em $folder..."
        git init
        git branch -M main
        
        echo "Configurando remote origin: $remote_url"
        git remote add origin "$remote_url"
    else
        echo "Repositório git já existe em $folder"
        if ! git remote get-url origin >/dev/null 2>&1; then
            echo "Adicionando remote origin: $remote_url"
            git remote add origin "$remote_url"
        else
            echo "Remote origin já configurado"
        fi
    fi
    
    if [[ -z "$(git status --porcelain)" ]]; then
        echo "Nenhuma mudança para commit em $repo_name"
        cd ..
        return 0
    fi
    
    echo "Adicionando arquivos..."
    git add -A
    
    echo "Commitando com mensagem: \"$COMMIT_MSG\""
    git commit -m "$COMMIT_MSG"
    
    if git remote get-url origin >/dev/null 2>&1; then
        echo "Fazendo push para origin/main..."
        git push -u origin main
    else
        echo "AVISO: Nenhum remote configurado para $repo_name. Push ignorado."
    fi
    
    cd ..
}

# Processa frontend
FRONT_REPO="school-react-web"
front_url="${FRONT_BASE_URL}/${FRONT_REPO}.git"
process_repo "web-react" "$front_url" "$FRONT_REPO"

# Processa cada microservice como repo separado
echo ""
echo "=========================================="
echo "Processando microservices (um repo cada)..."
echo "=========================================="

for micro_folder in microservices/*/; do
    if [[ -d "$micro_folder" ]]; then
        micro_name=$(basename "$micro_folder")
        repo_name="school-${micro_name}-micro-service"
        full_url="${MICRO_BASE_URL}/${repo_name}.git"
        process_repo "$micro_folder" "$full_url" "$repo_name"
    fi
done

echo ""
echo "=========================================="
echo "Processo concluído!"
echo "=========================================="