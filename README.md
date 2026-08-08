# Busca com Autocompletar

Página única de busca com sugestões em tempo real.

## Arquitetura

    Navegador (React)  →  GraphQL (Apollo Server)  →  Backend (Express)  →  terms.json
       :5173                    :4000                      :8000

O front **nunca** fala com o backend diretamente — apenas com a camada GraphQL,
conforme o diagrama do desafio.

## Como rodar

Requisito: Docker instalado.

    docker compose up --build

Abra http://localhost:5173

Outras portas:
- GraphQL playground: http://localhost:4000
- Backend: http://localhost:8000/suggestions\?q\=direito

## Rodar sem Docker

Em três terminais:

    cd apps/api      && npm install && npm start
    cd apps/graphql  && npm install && npm start
    cd apps/web      && npm install && npm run dev

## Testes

    cd apps/api && npm test
    cd apps/graphql && npm test
    cd apps/web && npm test

## Regenerar o dataset

    cd apps/api && npm run seed

## Documentos

- [TASKS.md](./TASKS.md) — planejamento em microtasks
- [COMMENTS.md](./COMMENTS.md) — decisões, trade-offs e uso de IA
