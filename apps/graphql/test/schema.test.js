const test = require("node:test");
const assert = require("node:assert");
const { createResolvers } = require("../src/schema");

test("resolver repassa o termo para o backend", async () => {
  let recebido = null;
  const fake = async (term) => {
    recebido = term;
    return ["direito do consumidor"];
  };

  const resolvers = createResolvers(fake);
  const r = await resolvers.Query.suggestions(null, { term: "direito" });

  assert.strictEqual(recebido, "direito");
  assert.deepStrictEqual(r, ["direito do consumidor"]);
});

test("propaga erro quando o backend falha", async () => {
  const fake = async () => {
    throw new Error("Backend fora do ar");
  };
  const resolvers = createResolvers(fake);

  await assert.rejects(() => resolvers.Query.suggestions(null, { term: "abcd" }));
});
