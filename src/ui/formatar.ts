const MIN = 60_000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;

/** "AGORA", "HÁ 4 MIN", "HÁ 2 H", "ONTEM", "HÁ 3 DIAS". */
export function tempoRelativo(em: number, agora = Date.now()): string {
  const d = Math.max(0, agora - em);
  if (d < MIN) return 'AGORA';
  if (d < HORA) return `HÁ ${Math.floor(d / MIN)} MIN`;
  if (d < DIA) return `HÁ ${Math.floor(d / HORA)} H`;
  if (d < 2 * DIA) return 'ONTEM';
  return `HÁ ${Math.floor(d / DIA)} DIAS`;
}

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
/** "30 · SET · 2026" */
export function dataCarimbo(em: number): string {
  const d = new Date(em);
  return `${d.getDate()} · ${MESES[d.getMonth()]} · ${d.getFullYear()}`;
}
/** "set/2026" */
export const mesAno = (em: number) => `${MESES[new Date(em).getMonth()].toLowerCase()}/${new Date(em).getFullYear()}`;

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
export const fmtNumero = (n: number) => n.toLocaleString('pt-BR');
