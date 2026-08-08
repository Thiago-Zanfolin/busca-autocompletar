// O schema é o "contrato" entre o front e o servidor.
// [String!]! significa: uma lista (nunca nula) de strings (nunca nulas).
const typeDefs = `#graphql
  type Query {
    """Retorna até 20 sugestões que começam com o termo informado."""
    suggestions(term: String!): [String!]!
  }
`;

// O resolver não conhece o dataset. Ele só sabe chamar o backend por HTTP.
// Essa separação é proposital: o GraphQL é um gateway, a regra de negócio
// mora no backend.
function createResolvers(fetchSuggestions) {
  return {
    Query: {
      suggestions: async (_parent, { term }) => fetchSuggestions(term),
    },
  };
}

function createBackendClient(baseUrl) {
  return async function fetchSuggestions(term) {
    const url = `${baseUrl}/suggestions?q=${encodeURIComponent(term)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Backend respondeu ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  };
}

module.exports = { typeDefs, createResolvers, createBackendClient };
