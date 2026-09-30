// Acesso tipado e memorizado à arte gerada por pixel.js.
import { P, get, portrait, strings } from './pixel.js';
import type { ParamsRetrato } from './pixel.js';
import type { Aparencia, Icone } from '../casos/catalogo';

export { P, strings };

let arte: ReturnType<typeof get> | undefined;
/** Gera toda a arte fixa na primeira chamada (canvas → data URL). */
export const arteFixa = () => (arte ??= get());

export const icone = (nome: Icone | string) => arteFixa().icons[nome];
export const marcador = (status: 'novo' | 'andamento' | 'resolvido' | 'alerta') => arteFixa().mk[status];
export const cenaImagem = (cenario: string) => (cenario === 'sala-cinema' ? arteFixa().cinema : arteFixa().scene);

const PELE = { clara: P.skin1, media: P.skin2, escura: P.skin3 } as const;
const CABELO = { curto: 'short', longo: 'long', coque: 'bun', careca: 'bald' } as const;

function paraParams(a: Aparencia): ParamsRetrato {
  const c = (nome?: string) => (nome ? P[nome] : undefined);
  const o: ParamsRetrato = {
    skin: PELE[a.pele],
    hair: CABELO[a.cabelo],
    hairC: P[a.corCabelo],
    coat: P[a.casaco],
    shirt: P[a.camisa],
  };
  if (a.gravata) o.tie = c(a.gravata);
  if (a.chapeu) o.hat = c(a.chapeu);
  if (a.faixaChapeu) o.band = c(a.faixaChapeu);
  if (a.oculos) o.glasses = 1;
  if (a.bigode) o.stache = 1;
  if (a.brinco) o.earring = 1;
  if (a.labios) o.mouth = c(a.labios);
  if (a.sobrancelha) o.brow = c(a.sobrancelha);
  return o;
}

const cacheRetratos = new Map<string, string>();
/** Retrato 32×32 (tamanho 32) ou 64×64 (tamanho 64) a partir da aparência. */
export function retrato(a: Aparencia, tamanho: 32 | 64 = 32): string {
  const chave = tamanho + JSON.stringify(a);
  let url = cacheRetratos.get(chave);
  if (!url) {
    url = portrait(paraParams(a), tamanho);
    cacheRetratos.set(chave, url);
  }
  return url;
}
