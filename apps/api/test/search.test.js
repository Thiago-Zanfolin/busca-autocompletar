const test = require("node:test");
const assert = require("node:assert");
const { createSearcher, normalize } = require("../src/search");

const amostra = [
  "direito do consumidor",
  "direito do trabalho",
  "direito do consumidor dano moral",
  "direito de familia",
  "obrigação de fazer",
  "acao de despejo",
];

const search = createSearcher(amostra);

test("retorna vazio com menos de 4 caracteres", () => {
  assert.deepStrictEqual(search("dir"), []);
  assert.deepStrictEqual(search(""), []);
});

test("casa por prefixo", () => {
  const r = search("direito do");
  assert.ok(r.includes("direito do consumidor"));
  assert.ok(r.includes("direito do trabalho"));
  assert.ok(!r.includes("acao de despejo"));
});

test("ignora acentos e caixa", () => {
  assert.ok(search("OBRIGACAO").includes("obrigação de fazer"));
  assert.ok(search("obrigaçao").includes("obrigação de fazer"));
});

test("retorna vazio quando nada casa", () => {
  assert.deepStrictEqual(search("xyzabc"), []);
});

test("nunca retorna mais de 20 resultados", () => {
  const muitos = Array.from({ length: 100 }, (_, i) => `direito item ${i}`);
  assert.strictEqual(createSearcher(muitos)("direito").length, 20);
});

test("ordena do termo mais curto para o mais longo", () => {
  const r = search("direito do");
  assert.strictEqual(r[0], "direito do trabalho");
});

test("normalize remove acentos", () => {
  assert.strictEqual(normalize("  Ação Rescisória "), "acao rescisoria");
});
