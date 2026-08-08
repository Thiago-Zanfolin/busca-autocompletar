import { useState, useEffect } from "react";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/";
const MIN_CHARS = 4;
const DEBOUNCE_MS = 150;

const QUERY = `
  query Suggestions($term: String!) {
    suggestions(term: $term)
  }
`;

export function useSuggestions(term) {
  // Guardo o termo JUNTO com os itens. Assim sei a qual busca eles pertencem
  // e consigo descartar resultado velho sem precisar limpar estado no efeito.
  const [result, setResult] = useState({ term: "", items: [], error: null });

  const query = term.trim();
  const enabled = query.length >= MIN_CHARS;

  useEffect(() => {
    if (!enabled) return;

    // Cancela a requisição anterior quando o usuário continua digitando.
    // Sem isso, uma resposta lenta de um termo antigo pode chegar DEPOIS da
    // resposta atual e sobrescrever a lista (race condition).
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ query: QUERY, variables: { term: query } }),
        });

        // fetch NÃO rejeita em 4xx/5xx — precisa checar na mão.
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const json = await response.json();
        // GraphQL devolve 200 mesmo com erro; o erro vem em json.errors.
        if (json.errors?.length) throw new Error(json.errors[0].message);

        setResult({ term: query, items: json.data?.suggestions ?? [], error: null });
      } catch (err) {
        if (err.name === "AbortError") return; // cancelamento normal
        setResult({ term: query, items: [], error: "Não foi possível buscar sugestões." });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, enabled]);

  // Derivado no render: só exibo o resultado se ele for do termo atual.
  // Isso substitui o setState síncrono no efeito e ainda evita o "flash"
  // de sugestões antigas enquanto a nova requisição está em voo.
  const current = enabled && result.term === query;

  return {
    suggestions: current ? result.items : [],
    error: current ? result.error : null,
  };
}
