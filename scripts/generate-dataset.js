// Gera o dataset de sugestões combinando termos-base com complementos.
// Rode com: npm run seed  (dentro de apps/api)
//
// Escolhi o domínio jurídico por dois motivos: é o domínio do Jusbrasil,
// e é um domínio naturalmente rico em prefixos compostos ("direito do...",
// "ação de..."), o que exercita bem o autocompletar por prefixo.

const fs = require("node:fs");
const path = require("node:path");

const bases = [
  "direito do consumidor",
  "direito do trabalho",
  "direito de familia",
  "direito previdenciario",
  "direito tributario",
  "direito ambiental",
  "direito penal",
  "direito civil",
  "direito administrativo",
  "direito digital",
  "direito dos animais",
  "direito dos herdeiros",
  "direito de imagem",
  "direito de greve",
  "direito autoral",
  "acao de cobranca",
  "acao de despejo",
  "acao trabalhista",
  "acao de alimentos",
  "acao rescisoria",
  "contrato de aluguel",
  "contrato de trabalho",
  "contrato de compra e venda",
  "pensao alimenticia",
  "rescisao indireta",
  "aposentadoria por invalidez",
  "aposentadoria especial",
  "usucapiao urbano",
  "inventario extrajudicial",
  "guarda compartilhada",
];

const complementos = [
  "dano moral",
  "inversao do onus da prova",
  "jurisprudencia atualizada",
  "prazo prescricional",
  "calculo de indenizacao",
  "modelo de peticao inicial",
  "recurso especial",
  "competencia do juizado",
  "honorarios advocaticios",
  "tutela de urgencia",
  "reforma de 2017",
  "sumula do STJ",
  "custas processuais",
  "audiencia de conciliacao",
  "produção de provas",
  "insalubridade metalurgico",
  "acordo extrajudicial",
  "execucao de sentenca",
];

const termos = new Set();

for (const base of bases) {
  termos.add(base);
  for (const comp of complementos) {
    termos.add(`${base} ${comp}`);
  }
}

const lista = [...termos].sort();
const destino = path.join(__dirname, "..", "apps", "api", "data", "terms.json");

fs.writeFileSync(destino, JSON.stringify(lista, null, 2), "utf-8");
console.log(`${lista.length} termos gravados em ${destino}`);
