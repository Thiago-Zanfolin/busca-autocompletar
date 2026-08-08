const fs = require("node:fs");
const path = require("node:path");

const MIN_CHARS = 4;
const MAX_RESULTS = 20;

// Remove acentos e normaliza caixa, para que "obrigacao" ache "obrigação"
// e "DIREITO" ache "direito".
function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Índice construído uma única vez, no boot do processo.
// Guardo o texto original e a versão normalizada lado a lado para não
// pagar o custo de normalizar tudo a cada requisição.
function buildIndex(terms) {
  return terms.map((text) => ({ text, norm: normalize(text) }));
}

function loadTerms() {
  const file = path.join(__dirname, "..", "data", "terms.json");
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function createSearcher(terms) {
  const index = buildIndex(terms);

  return function search(rawQuery) {
    const query = normalize(rawQuery || "");

    // Regra do desafio: nada abaixo de 4 caracteres.
    // A validação vive aqui, no domínio, e não só no front — o front pode
    // ser burlado, o backend não deve confiar nele.
    if (query.length < MIN_CHARS) return [];

    return index
      .filter((item) => item.norm.startsWith(query))
      .sort((a, b) => a.text.length - b.text.length || a.text.localeCompare(b.text))
      .slice(0, MAX_RESULTS)
      .map((item) => item.text);
  };
}

module.exports = {
  normalize,
  createSearcher,
  search: createSearcher(loadTerms()),
  MIN_CHARS,
  MAX_RESULTS,
};
