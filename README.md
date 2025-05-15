# Teste Técnico - Tokio (Frontend)

Aplicação frontend desenvolvida com Angular para o sistema de gestão de usuários e endereços, com autenticação e autorização.

## Tecnologias Utilizadas

- Angular 19
- TypeScript
- RxJS
- Docker

## Funcionalidades

- Autenticação e autorização de usuários com JWT
- CRUD completo de usuários
- CRUD completo de endereços vinculados a usuários
- Validação de dados e formulários
- Paginação e ordenação de resultados
- Interface responsiva e amigável

## Pré-requisitos

Para executar este projeto sem Docker, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (v9+)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

Com Docker, você só precisa ter:
- [Docker](https://www.docker.com/products/docker-desktop/) (v20.10+)

## Executando a Aplicação

### Usando Docker:

```bash
# Clone o repositório
git clone https://github.com/LeonardoGomesCBP/tokio-frontend-angular
cd tokio-frontend-angular

# Execute com Docker
docker-compose up
```


### Sem Docker (desenvolvimento local):

```bash
# Clone o repositório
git clone https://github.com/LeonardoGomesCBP/tokio-frontend-angular
cd tokio-frontend-angular

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
ng serve
```

A aplicação estará disponível em http://localhost:4200

## Usuário Admin Inicial

Ao iniciar a aplicação pela primeira vez, você pode acessar usando:

- Email: admin@example.com
- Senha: admin123

## Backend Necessário

Esta aplicação frontend se comunica com uma API backend. Certifique-se de que o backend está executando em:
- http://localhost:8080

O código-fonte da API backend está disponível em: https://github.com/LeonardoGomesCBP/tokio-backend-java

## Demo Video

Confira a demonstração do projeto em vídeo: [Demonstração no YouTube](https://www.youtube.com/watch?v=6pjl9KzFiCU)
