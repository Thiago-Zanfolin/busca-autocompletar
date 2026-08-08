const express = require("express");
const { search } = require("./search");

const app = express();
const PORT = process.env.PORT || 8000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/suggestions", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  res.json({ suggestions: search(q) });
});

app.listen(PORT, () => {
  console.log(`[api] rodando em http://localhost:${PORT}`);
});
