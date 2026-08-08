# COMMENTS

## 1. Decisões de arquitetura

**Três serviços separados.** O diagrama do desafio é literal. Seria mais rápido
embutir o Apollo no próprio Express, mas isso apagaria a fronteira que o
exercício quer exercitar. O GraphQL aqui é um gateway: não conhece o dataset,
só sabe chamar o backend por HTTP. Custo: um salto de rede extra. Se paga
quando o gateway agrega várias fontes; com fonte única, é custo consciente.

**Dataset em memória, não banco.** `terms.json` carregado num índice no boot.
Para ~600 termos o `filter` linear resolve em microssegundos e mantém o projeto
rodando com um comando só. É O(n) por requisição: com milhões de termos eu
iria para Postgres com `pg_trgm` e índice GIN. `createSearcher(terms)` recebe a
lista por parâmetro justamente para que trocar a fonte não exija reescrever a
lógica. O dataset é gerado por script (`npm run seed`).

**`fetch` em vez de Apollo Client.** A aplicação tem uma query. Apollo traria
cache normalizado e ~30kb de bundle para um problema que eu não tenho.
Reavaliaria se surgissem mais queries ou cache compartilhado.

**Validação dos 4 caracteres no front e no backend.** Duplicação intencional:
o front evita requisição inútil, o backend não confia no cliente.

## 2. Problemas que precisei tratar

**Race condition.** Digitar "dire" → "direi" → "direit" dispara requisições
concorrentes; se a primeira responder por último, sobrescreve a lista correta.
Resolvi com `AbortController` no cleanup do `useEffect`. É invisível em rede
local e evidente em rede real.

**"20 no backend, 10 exibidas".** O backend limita a 20, o front renderiza os
20, o CSS mostra 10 (`max-height` + `overflow-y: auto`). Cortar com
`.slice(0, 10)` no cliente tornaria impossível o scroll que o requisito pede.

**Negrito com acentos.** A busca é normalizada, a exibição usa o texto
original. Verifiquei que a normalização NFD preserva o número de caracteres,
então o recorte por índice continua correto. Coberto por teste — e foi
justamente esse teste que veio errado na primeira versão (seção 4). Não usei
`dangerouslySetInnerHTML`: o `<strong>` é nó React, sem superfície de XSS.

**Debounce de 150ms.** 300ms ficou perceptivelmente lento, 0ms dispara uma
requisição por tecla.

**`onMouseDown` em vez de `onClick` na sugestão.** O `blur` do input dispara
antes do `click` e fecharia a lista antes da seleção acontecer.

## 3. Análise do `starter/suggestions.js`

**O que eu manteria:** o early-return abaixo de 4 caracteres *limpando* o
estado — se só desse `return`, sugestões antigas ficariam na tela ao apagar. E
a intenção de isolar o I/O fora do componente.

**O que eu mudaria:**

1. **Não é uma requisição GraphQL.** `fetch("/graphql?q=...", {method:"GET"})`
   é REST. GraphQL espera POST com `{ query, variables }` e responde em
   `{ data, errors }`, não em `data.suggestions`. Do jeito que está, não funciona.
2. **Sem tratamento de erro.** `fetch` não rejeita em 4xx/5xx. Sem checar
   `response.ok`, um erro 500 vira `undefined` e quebra no `.slice()`. E
   GraphQL devolve 200 mesmo com erro de resolver — `json.errors` também
   precisa ser checado.
3. **Sem cancelamento** → a race condition da seção 2. É o que eu mais mudaria
   antes de produção, porque falha de forma silenciosa e intermitente.
4. **`.slice(0, 10)` no cliente** contradiz o próprio requisito de scroll.
5. **Falta `encodeURIComponent`** — um termo com `&` quebra a URL.
6. **Receber `setSuggestions` como argumento** acopla a função ao React e
   dificulta testar. Preferi um hook que devolve os dados.

**Prioridade para produção:** (1) protocolo GraphQL, sem isso nada funciona;
(2) cancelamento; (3) erro visível ao usuário. O resto é melhoria.

## 4. Uso de IA

Usei o Claude do planejamento ao código. Registro as decisões relevantes e,
principalmente, onde o código gerado estava errado.

**Arquitetura e escopo.** Pedi um plano de execução e depois, ao informar que
teria ~1 dia sem experiência prévia nas ferramentas, um caminho enxuto.
Aceitei a separação em três processos e a ordem "de dentro pra fora"
(backend testável primeiro). Rejeitei TypeScript, Apollo Client e banco de
dados: cada ferramenta a mais era superfície de erro, e eu precisaria explicar
cada linha depois.

**Ambiente WSL.** Pedi a adaptação do guia. O ponto que se mostrou crítico foi
manter o projeto em `~` e não em `/mnt/c/` — no filesystem do Windows o
hot-reload do Vite não recebe eventos de mudança de arquivo.

**Teste com valor esperado errado.** O teste gerado esperava `"Obrigaçã"`
(8 caracteres) para `splitMatch("Obrigação de fazer", "obrigacao")`. O termo
tem 9 caracteres, então o resultado correto é `"Obrigação"` inteiro. Conferi na
mão e corrigi. Era um teste sobre contagem de caracteres com acento —
exatamente o que ele deveria proteger. Aceitar sem checar me daria um teste
vermelho sem entender o motivo, ou pior: "consertar" a função para satisfazer
um teste errado.

**`setState` no `useEffect` (React 19).** A primeira versão do
`useSuggestions` chamava `setSuggestions([])` direto no corpo do efeito. O
lint falhou com `react-hooks/set-state-in-effect`. Antes de aceitar a
correção, entendi o porquê: `setState` síncrono no efeito dispara render em
cascata, e a regra empurra na direção de *derivar* durante o render. Passei a
guardar o termo junto com os resultados e decidir no render se aquele
resultado ainda pertence ao termo atual. Efeito colateral positivo que eu não
tinha previsto: some o "flash" de sugestões antigas enquanto a requisição nova
está em voo.

**Teste em CommonJS num projeto ESM.** O teste do front veio com `require`,
mas o Vite gera ESM. Rejeitei a saída rápida (relaxar a regra do ESLint) —
o problema não era o lint, era o formato do teste. Reescrevi com `import`.

**Fluxo de PR travado.** Ativei branch protection com "require approvals" e o
merge ficou bloqueado: não se aprova o próprio PR. Baixei para 0 aprovações
mas mantive a exigência de pull request — o enunciado pede o fluxo, não o
revisor externo, que seria impossível trabalhando sozinho.

**Problema de ambiente (não foi a IA).** O `url-quote-magic` do zsh escapava o
caractere seguinte a URLs coladas em heredoc, virando `"http://..."\;`. Gerou
erros de sintaxe em arquivos aparentemente idênticos ao original. Aconteceu
duas vezes antes de eu identificar o padrão. Foi o que mais custou tempo no
desafio e não estava em lugar nenhum do plano.

**O que levo disso:** as duas correções mais úteis vieram de fontes diferentes
— o lint pegou uma, a conferência manual pegou a outra. Ferramenta automática
cobre parte; o resto depende de ler o que foi gerado.

## 5. Testes executados

**Automatizados:** api (7) — limite de 4 caracteres, prefixo, acentos, teto de
20, ordenação, vazio. graphql (2) — repasse do termo, propagação de erro.
web (3) — separação do prefixo destacado.

**Manuais:** 3 caracteres não exibe nada; 4 exibe; termo sem resultado não
renderiza elemento algum; prefixo em negrito; hover e touch destacam; mais de
10 resultados acessíveis por scroll; clique preenche o campo; digitação
contínua atualiza a lista; layout responsivo; `docker compose up` sobe tudo a
partir de um clone limpo.

## 6. O que eu faria com mais tempo

- **Ranking por popularidade** em vez de por tamanho do termo — exigiria
  persistir eventos de clique.
- **Cache no gateway** (LRU ou Redis, TTL curto): prefixos populares se
  repetem muito entre usuários.
- **Build de produção do front:** hoje o container roda `vite dev`. Seria
  `vite build` + nginx, com a URL do GraphQL injetada em runtime.
- **Testes end-to-end com Playwright**, cobrindo digitar → clicar → preencher.
- **Observabilidade:** latência p95 por camada, para medir o custo real do
  salto extra do gateway.