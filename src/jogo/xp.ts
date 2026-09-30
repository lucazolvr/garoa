// XP, nível e rank: sempre calculados a partir do que o jogador fez, nunca guardados.
import type { Caso } from '../casos/esquema';
import type { EstadoCaso } from './estado';
import type { CasoPrivado } from './privado';

const XP_EVENTO: Record<string, number> = {
  examinou: 5,
  perguntou: 5,
  'marcou-trecho': 5,
  nota: 10,
  'pista-no-quadro': 5,
  'foto-cena': 5,
  recorte: 5,
  fio: 5,
  teoria: 15,
  voto: 1,
};
export const XP_PISTA = 15;

/** XP de um detetive num caso: ações no caso + pistas que ele encontrou primeiro. */
export function xpNoCaso(estado: EstadoCaso, handle: string): number {
  let xp = 0;
  for (const e of estado.eventos) if (e.autor === handle) xp += XP_EVENTO[e.tipo] ?? 0;
  for (const p of estado.pistas.values()) if (p.autor === handle) xp += XP_PISTA;
  return xp;
}

/** Bônus por fechar o caso: cai 40 por tentativa errada; encerrar sem acertar não rende nada. */
export function xpResolucao(caso: Caso, cp?: CasoPrivado): number {
  if (!cp || cp.status !== 'resolvido') return 0;
  return Math.max(50, 100 + 50 * caso.dificuldade - 40 * (cp.tentativas.length - 1));
}

const RANKS: [number, string][] = [
  [1, 'RECRUTA'],
  [3, 'AGENTE'],
  [6, 'DETETIVE'],
  [10, 'DETETIVE SÊNIOR'],
  [15, 'CHEFE DE INVESTIGAÇÃO'],
];

/** XP necessário para chegar ao nível L: 0, 100, 300, 600, 1000… */
const inicioDoNivel = (L: number) => 50 * L * (L - 1);

export function nivel(xp: number) {
  let L = 1;
  while (inicioDoNivel(L + 1) <= xp) L++;
  const rank = [...RANKS].reverse().find(([n]) => L >= n)![1];
  const proximo = RANKS.find(([n]) => n > L);
  return {
    nivel: L,
    xp,
    inicio: inicioDoNivel(L),
    proximo: inicioDoNivel(L + 1),
    rank,
    proximoRank: proximo ? { nome: proximo[1], nivel: proximo[0] } : null,
  };
}
