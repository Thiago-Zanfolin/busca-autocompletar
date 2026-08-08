import test from "node:test";
import assert from "node:assert";
import { splitMatch } from "../src/highlight.js";

test("separa prefixo que casa", () => {
  assert.deepStrictEqual(
    splitMatch("direito do consumidor", "direito"),
    ["direito", " do consumidor"]
  );
});

test("nao destaca quando nao ha match no inicio", () => {
  assert.deepStrictEqual(splitMatch("acao de despejo", "direito"), ["", "acao de despejo"]);
});

test("funciona com acento e caixa diferente", () => {
  const [match, rest] = splitMatch("Obrigação de fazer", "obrigacao");
  assert.strictEqual(match, "Obrigação");
  assert.strictEqual(rest, " de fazer");
});
