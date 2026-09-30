// npm run catalogo → imprime tudo que um caso pode referenciar (cenários e âncoras,
// ícones, cores, bairros, detetives simulados) e os números já usados.
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { BAIRROS, CENARIOS, CORES, DETETIVES_SIMULADOS, ICONES } from '../src/casos/catalogo';

const PASTA = resolve(import.meta.dirname, '../src/casos/dados');
const existentes = readdirSync(PASTA)
  .filter((f) => f.endsWith('.json'))
  .map((f) => {
    const c = JSON.parse(readFileSync(join(PASTA, f), 'utf8'));
    return { id: c.id, titulo: c.titulo, bairro: c.bairro, mapa: c.mapa, arquivo: f };
  });

const catalogo = {
  cenarios: Object.fromEntries(
    Object.entries(CENARIOS).map(([id, c]) => [id, { nome: c.nome, descricao: c.descricao, ancoras: Object.fromEntries(Object.entries(c.ancoras).map(([a, v]) => [a, v.descricao])) }]),
  ),
  icones: ICONES,
  cores: CORES,
  bairros: Object.fromEntries(Object.entries(BAIRROS).map(([b, [x, y, w, h]]) => [b, { x: [x, x + w - 48], y: [y, y + h - 72], obs: 'faixa válida para mapa.x e mapa.y' }])),
  detetivesSimulados: Object.keys(DETETIVES_SIMULADOS),
  casosExistentes: existentes,
};
console.log(JSON.stringify(catalogo, null, 2));
