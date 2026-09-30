// Carrega os casos de src/casos/dados. Caso inválido fica fora do mapa, com o motivo no console.
import type { Caso } from './esquema';
import { validarCaso, validarConjunto } from './validar';

const arquivos = import.meta.glob('./dados/*.json', { eager: true, import: 'default' });

export function carregarCasos(): Caso[] {
  const casos: Caso[] = [];
  for (const [arquivo, dados] of Object.entries(arquivos)) {
    const { caso, erros, avisos } = validarCaso(dados);
    if (caso && casos.some((c) => c.id === caso.id)) console.warn(`[GAROA] Caso ignorado (${arquivo}): #${caso.id} já existe`);
    else if (caso) casos.push(caso);
    else console.warn(`[GAROA] Caso ignorado (${arquivo}):\n  ${erros.join('\n  ')}`);
    if (avisos.length) console.info(`[GAROA] Avisos em ${arquivo}:\n  ${avisos.join('\n  ')}`);
  }
  const conjunto = validarConjunto(casos);
  [...conjunto.erros, ...conjunto.avisos].forEach((m) => console.warn(`[GAROA] ${m}`));
  return casos.sort((a, b) => a.id.localeCompare(b.id));
}
