// npm run validar-caso [arquivo.json ...]
// Sem argumentos, valida todos os casos em src/casos/dados. Sai com código 1 se houver erro.
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { validarCaso, validarConjunto } from '../src/casos/validar';
import type { Caso } from '../src/casos/esquema';

const PASTA = resolve(import.meta.dirname, '../src/casos/dados');
const arquivos = process.argv.slice(2).length
  ? process.argv.slice(2).map((a) => resolve(a))
  : readdirSync(PASTA).filter((f) => f.endsWith('.json')).map((f) => join(PASTA, f));

let falhou = false;
const validos = new Map<string, Caso>();

for (const arquivo of arquivos) {
  let dados: unknown;
  try {
    dados = JSON.parse(readFileSync(arquivo, 'utf8'));
  } catch (e) {
    console.log(`\n✗ ${arquivo}\n  JSON inválido: ${(e as Error).message}`);
    falhou = true;
    continue;
  }
  const { caso, erros, avisos } = validarCaso(dados);
  console.log(`\n${erros.length ? '✗' : '✓'} ${arquivo}`);
  erros.forEach((e) => console.log(`  ERRO  ${e}`));
  avisos.forEach((a) => console.log(`  aviso ${a}`));
  if (caso) validos.set(arquivo, caso);
  else falhou = true;
}

// Regras entre casos: os informados contra todos os casos válidos da pasta.
for (const f of readdirSync(PASTA).filter((f) => f.endsWith('.json'))) {
  const arquivo = join(PASTA, f);
  if (validos.has(arquivo)) continue;
  const r = validarCaso(JSON.parse(readFileSync(arquivo, 'utf8')));
  if (r.caso) validos.set(arquivo, r.caso);
}
const conjunto = validarConjunto([...validos.values()]);
if (conjunto.erros.length || conjunto.avisos.length) console.log('\nEntre casos:');
conjunto.erros.forEach((e) => console.log(`  ERRO  ${e}`));
conjunto.avisos.forEach((a) => console.log(`  aviso ${a}`));
if (conjunto.erros.length) falhou = true;

console.log(falhou ? '\nFalhou.' : '\nTudo certo.');
process.exit(falhou ? 1 : 0);
