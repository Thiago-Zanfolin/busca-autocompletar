# TASKS — Busca com Autocompletar

## Como decompus o problema

Quebrei em 3 camadas independentes (backend → graphql → front), na ordem
"de dentro pra fora". A lógica de busca é o núcleo: se ela estiver errada,
nada acima funciona. Por isso ela vem primeiro e com testes.

Cada bloco abaixo corresponde a um Pull Request.

---

## PR 1 — Setup do repositório e CI
- [ ] Estrutura de pastas (apps/api, apps/graphql, apps/web)
- [ ] README com instruções de execução
- [ ] ESLint configurado
- [ ] GitHub Actions rodando lint + testes a cada PR
- [ ] TASKS.md e COMMENTS.md

**Por que primeiro:** com a CI verde desde o início, todo PR seguinte já
nasce validado. Configurar CI no fim quase sempre vira dívida.

## PR 2 — Backend: dataset e lógica de busca
- [ ] Script que gera o dataset de termos (população automatizada)
- [ ] Função `search(termo)`: normaliza acento/caixa, casa por prefixo
- [ ] Regra: menos de 4 caracteres → retorna lista vazia
- [ ] Regra: no máximo 20 resultados
- [ ] Ordenação por relevância (termo mais curto primeiro)
- [ ] Testes unitários da função de busca
- [ ] Endpoint HTTP `GET /suggestions?q=`

**Por que aqui:** é o núcleo do problema. Testável isoladamente, sem
depender de browser nem de GraphQL.

## PR 3 — Camada GraphQL
- [ ] Schema: `suggestions(term: String!): [String!]!`
- [ ] Resolver que chama o backend via HTTP
- [ ] URL do backend vinda de variável de ambiente
- [ ] Tratamento de erro quando o backend está fora
- [ ] Teste do resolver

**Por que aqui:** só faz sentido depois que existe um backend pra chamar.

## PR 4 — Frontend: página e integração
- [ ] Projeto React com Vite
- [ ] Layout responsivo (mobile-first)
- [ ] Hook `useSuggestions`: debounce + cancelamento de requisições
- [ ] Lista de sugestões com prefixo em negrito
- [ ] Scroll após 10 itens
- [ ] Destaque em hover e touch
- [ ] Clique preenche o campo
- [ ] Navegação por teclado (setas, Enter, Esc)

## PR 5 — Docker e documentação final
- [ ] Dockerfile de cada serviço
- [ ] docker-compose.yml
- [ ] COMMENTS.md: decisões, análise do código de referência, log de IA

---

## O que eu faria com mais tempo

- **Trocar o índice em memória por Postgres com `pg_trgm`**, ou por
  Elasticsearch. O array em memória funciona para milhares de termos;
  para milhões, o custo de `filter` linear a cada requisição inviabiliza.
  Com `pg_trgm` eu criaria um índice GIN e usaria `ILIKE 'termo%'`.
- **Cache no GraphQL** (Redis ou LRU em memória) com TTL curto. Prefixos
  populares se repetem muito entre usuários.
- **Ranking por popularidade**, não só por tamanho: registrar quantas vezes
  cada sugestão foi clicada e ordenar por isso.
- **Testes end-to-end com Playwright**, cobrindo o fluxo completo de digitar
  e clicar numa sugestão.
- **Busca por substring além de prefixo**, com peso menor no ranking.
