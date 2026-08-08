export function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Divide a sugestão em [parte que casa com o termo, resto].
// Não uso dangerouslySetInnerHTML: montar <strong> como nó React é seguro
// contra XSS e não exige escapar o texto na mão.
export function splitMatch(suggestion, term) {
  const query = term.trim();
  if (!query) return ["", suggestion];

  if (!normalize(suggestion).startsWith(normalize(query))) {
    return ["", suggestion];
  }

  // A normalização NFD preserva o número de caracteres (á -> a + acento,
  // e o acento é removido), então o índice do texto original bate.
  return [suggestion.slice(0, query.length), suggestion.slice(query.length)];
}
