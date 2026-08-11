# Migracao Olimpio

Pacote gerado a partir do sistema JSF fornecido.

- microservices/: 10 servicos Quarkus Java 21, separados pelos modulos originais.
- web-react/: aplicacao React TypeScript com rotas para as telas XHTML.
- mobile-react-native/: Expo/React Native TypeScript com telas correspondentes.

Cada servico contem legacy-source/ com todos os Java originais do modulo como referencia de migracao e implementacoes REST CRUD geradas para cada controller do modulo. Os CRUDs usam Panache, DTOs, service, RESTEasy Reactive e ExceptionMapper.

## Execucao

### Com Docker (Windows/Linux/Mac)
```bash
start-all.bat          # builda e sobe tudo, com logs no terminal (Windows)
start-all.bat -d       # mesma coisa, mas em background (Windows)
./start-all.sh         # Linux/Mac
./start-all.sh -d      # Linux/Mac em background
```

### Parar tudo
```bash
stop-all.bat           # Windows
./stop-all.sh          # Linux/Mac
```

### Sem Docker (modo dev local)
```bash
cd microservices\basico && mvn quarkus:dev
cd microservices\central && mvn quarkus:dev
cd microservices\comercial && mvn quarkus:dev
cd microservices\educacao && mvn quarkus:dev
cd microservices\estoque && mvn quarkus:dev
cd microservices\financeiro && mvn quarkus:dev
cd microservices\login && mvn quarkus:dev
cd microservices\relatorios && mvn quarkus:dev
cd microservices\schedule && mvn quarkus:dev
cd web-react && npm install && npm run dev
cd mobile-react-native && npm install && npm start
```

Configure VITE_API_URL (web) e EXPO_PUBLIC_API_URL (mobile) para o gateway/API desejado.

## Windows - Teste Local

No Windows, use os arquivos `.bat` para subir todos os servicos com Docker:

```batch
start-all.bat          # Sobe tudo em foreground (logs no terminal)
start-all.bat -d       # Sobe tudo em background
stop-all.bat           # Para todos os containers
stop-all.bat -v        # Para e apaga os dados do banco
```

Ou rode cada servico individualmente com Maven:

```batch
cd microservices\basico && mvnw quarkus:dev
cd microservices\login && mvnw quarkus:dev
cd microservices\central && mvnw quarkus:dev
cd microservices\comercial && mvnw quarkus:dev
cd microservices\educacao && mvnw quarkus:dev
cd microservices\estoque && mvnw quarkus:dev
cd microservices\financeiro && mvnw quarkus:dev
cd microservices\relatorios && mvnw quarkus:dev
cd microservices\schedule && mvnw quarkus:dev
cd web-react && npm install && npm run dev
```

O app React fica em `http://localhost:3000` e o gateway em `http://localhost:8080`.

Se os servicos nao subirem, um arquivo `error.log` sera criado na raiz do projeto com os detalhes do erro.