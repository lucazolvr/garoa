// Tipos de pixel.js (JS gerado no Claude Design, mantido sem tipagem interna).
export const P: Record<string, string>;

/** Parâmetros de retrato no formato interno de pixel.js (ver CH em pixel.js). */
export interface ParamsRetrato {
  skin: string;
  hair: 'short' | 'long' | 'bun' | 'bald';
  hairC: string;
  coat: string;
  shirt: string;
  tie?: string;
  hat?: string;
  band?: string;
  glasses?: 1;
  glassC?: string;
  stache?: 1;
  earring?: 1;
  mouth?: string;
  brow?: string;
  bg?: false;
  bgC?: string;
}

export interface Arte {
  icons: Record<string, string>;
  mk: Record<'novo' | 'andamento' | 'resolvido' | 'alerta', string>;
  pt: Record<string, string>;
  pt64: Record<string, string>;
  ch: Record<'det' | 'detWalk' | 'detLupa' | 'detBrown' | 'detAna' | 'pol' | 'polWalk' | 'ban' | 'banDark' | 'civ' | 'civ2', string>;
  city: string;
  scene: string;
  cinema: string;
  cork: string;
  cone: string;
  wear: string;
  dNight: string;
  dPaper: string;
}

export function get(): Arte;
export function portrait(o: ParamsRetrato, N: number): string;
export function marker(sym: '!' | '?' | 'v', c: string, L: string, D: string, s: string): string;
/** Fios vermelhos em pixel: segmentos [x0, y0, x1, y1] numa tela W×H. */
export function strings(W: number, H: number, segs: [number, number, number, number][]): string;
/** Anima o mapa sobre o canvas; devolve a função que para a animação. */
export function live(canvas: HTMLCanvasElement | null, o: { src: string; map: unknown }): () => void;
export function rain(canvas: HTMLCanvasElement | null, W: number, H: number, n: number): () => void;
