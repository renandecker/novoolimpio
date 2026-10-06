#!/bin/bash
# Instalador de recursos para Olimpio - Ubuntu
set -e

echo "============================================"
echo "  Instalador de recursos para Olimpio"
echo "============================================"
echo

# Atualizar pacotes
echo "Atualizando lista de pacotes..."
sudo apt-get update -y

# Instalar Java (OpenJDK 17)
echo "Verificando Java..."
if ! command -v java &> /dev/null; then
    echo "Instalando OpenJDK 17..."
    sudo apt-get install -y openjdk-17-jdk
else
    echo "Java ja esta instalado:"
    java -version 2>&1 | head -1
fi

# Instalar Maven
echo "Verificando Maven..."
if ! command -v mvn &> /dev/null; then
    echo "Instalando Maven..."
    sudo apt-get install -y maven
else
    echo "Maven ja esta instalado:"
    mvn -v | head -1
fi

# Verificar e instalar Docker
echo "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "Docker nao encontrado. Instalando..."
    # Remove old Docker versions
    sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Install prerequisites
    sudo apt-get install -y ca-certificates curl gnupg
    
    # Add Docker's official GPG key
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update and install Docker
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Install Docker Compose plugin if not included
    sudo docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD":/installer -w /installer \
      jgswain/docker-compose-installer:latest 2>/dev/null || \
      sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
      sudo chmod +x /usr/local/bin/docker-compose
    
    echo "Docker instalado com sucesso!"
else
    echo "Docker ja esta instalado:"
    docker --version
fi

# Verificar Git
echo "Verificando Git..."
if ! command -v git &> /dev/null; then
    echo "Instalando Git..."
    sudo apt-get install -y git
else
    echo "Git ja esta instalado:"
    git --version
fi

# Criar pasta de recursos
PASTA="recursos-ferramenta"
if [ ! -d "$PASTA" ]; then
    echo "Criando pasta $PASTA..."
    mkdir "$PASTA"
fi

# Criar arquivo .env se nao existir
ENV_FILE="$PASTA/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Criando arquivo $ENV_FILE..."
    echo "# .env - configuracao para a ferramenta Olimpio" > "$ENV_FILE"
    echo "" >> "$ENV_FILE"
    echo "# Banco de dados" >> "$ENV_FILE"
    echo "DATABASE_URL=postgresql://localhost:5454/olimpio" >> "$ENV_FILE"
    echo "DATABASE_JDBC_URL=jdbc:postgresql://localhost:5454/olimpio" >> "$ENV_FILE"
    echo "DATABASE_USER=postgres" >> "$ENV_FILE"
    echo "DATABASE_PASSWORD=postgres" >> "$ENV_FILE"
    echo "" >> "$ENV_FILE"
    echo "# JWT" >> "$ENV_FILE"
    if command -v openssl &> /dev/null; then
        echo "JWT_SECRET=$(openssl rand -hex 48)" >> "$ENV_FILE"
    else
        echo "JWT_SECRET=$(head -c 48 /dev/urandom | od -An -tx1 | tr -d ' \n')" >> "$ENV_FILE"
    fi
    echo "[OK] JWT_SECRET gerado. Use o mesmo valor em todos os servicos."
    echo "" >> "$ENV_FILE"
    echo "# Kafka" >> "$ENV_FILE"
    echo "KAFKA_BOOTSTRAP_SERVERS=localhost:9092" >> "$ENV_FILE"
    echo "[OK] Arquivo $ENV_FILE criado."
else
    echo "[OK] Arquivo $ENV_FILE ja existe."
fi

echo
echo "============================================"
echo "  Instalacao concluida!"
echo "============================================"
echo
echo "Recursos instalados:"
echo "  - Java: $(java -version 2>&1 | head -1)"
echo "  - Maven: $(mvn -v | head -1)"
echo "  - Docker: $(docker --version)"
echo "  - Git: $(git --version)"
echo "  - .env: $ENV_FILE"
echo
echo "Para levantar a ferramenta:"
echo "  ./start-all.sh          # modo foreground"
echo "  ./start-all.sh -d       # modo background"
echo