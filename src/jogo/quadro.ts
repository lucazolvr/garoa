// Geometria do quadro de investigação (1008×800).

export type TipoItem = 'vitima' | 'suspeito' | 'pista' | 'nota' | 'cena' | 'recorte';

/** Largura de cada tipo de cartão, em px do quadro. */
export const LARGURA: Record<TipoItem, number> = {
  vitima: 160,
  suspeito: 160,
  pista: 192,
  nota: 168,
  cena: 224,
  recorte: 312,
};

export const POS_VITIMA = { x: 424, y: 32 };
/** Vagas dos suspeitos, na ordem do arquivo do caso: cantos do quadro. */
export const VAGAS_SUSPEITOS = [
  { x: 64, y: 56 },
  { x: 64, y: 452 },
  { x: 784, y: 56 },
  { x: 784, y: 452 },
];

export const tipoDe = (ref: string): TipoItem => (ref === 'vitima' ? 'vitima' : (ref.split(':')[0] as TipoItem));
export const idDe = (ref: string) => ref.slice(ref.indexOf(':') + 1);

/** Onde fica o alfinete (e onde os fios se prendem). */
export const alfinete = (ref: string, x: number, y: number): [number, number] => [x + LARGURA[tipoDe(ref)] / 2, y + 10];

/** Chave de um fio: a ordem das pontas não importa. */
export const chaveFio = (a: string, b: string) => [a, b].sort().join('|');

/** Altura aproximada de cada cartão (o texto das notas varia). */
export const ALTURA: Record<TipoItem, number> = {
  vitima: 172,
  suspeito: 172,
  pista: 72,
  nota: 140,
  cena: 176,
  recorte: 190,
};

/** Posição livre para um item novo: espiral a partir do centro, sem sobrepor cartões. */
export function posicaoLivre(ocupados: { x: number; y: number; tipo: TipoItem }[], tipo: TipoItem): { x: number; y: number } {
  const w = LARGURA[tipo];
  const h = ALTURA[tipo];
  const folga = 16;
  const livre = (x: number, y: number) =>
    ocupados.every((o) => x + w + folga <= o.x || o.x + LARGURA[o.tipo] + folga <= x || y + h + folga <= o.y || o.y + ALTURA[o.tipo] + folga <= y);
  for (let r = 0; r < 20; r++) {
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const x = Math.round(420 + Math.cos(a) * r * 36);
      const y = Math.round(320 + Math.sin(a) * r * 28);
      if (x >= 16 && y >= 16 && x + w <= 992 && y + h <= 784 && livre(x, y)) return { x, y };
    }
  }
  return { x: 420, y: 320 };
}
