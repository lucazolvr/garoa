// Estado compartilhado de um caso = dobra (fold) dos eventos sobre o arquivo do caso.
// Os mesmos eventos vão virar linhas numa tabela do Supabase no marco 2.
import type { Caso, DadosEvento, Evento } from '../casos/esquema';
import { exigencias } from '../casos/validar';
import { POS_VITIMA, VAGAS_SUSPEITOS, chaveFio, type TipoItem } from './quadro';

export interface Registro {
  autor: string;
  em: number;
}

export type Origem = { tipo: 'cena'; ancora: string } | { tipo: 'depoimento'; suspeito: string; pergunta: string };

export interface ItemQuadro {
  ref: string;
  tipo: TipoItem;
  x: number;
  y: number;
  /** Ausente nos cartões fixos (vítima e suspeitos). */
  autor?: string;
  em?: number;
  /** Última vez que foi criado ou movido: quem mexeu por último fica por cima. */
  ordem?: number;
  texto?: string;
  legenda?: string;
  fonte?: string;
  titulo?: string;
}

export interface Fio extends Registro {
  de: string;
  para: string;
}

export interface Teoria extends Registro {
  id: string;
  titulo: string;
  texto: string;
  suspeito?: string;
  votosBase: number;
  votos: Record<string, -1 | 0 | 1>;
}

export interface EstadoCaso {
  examinados: Map<string, Registro>;
  pistas: Map<string, Registro & { origem: Origem }>;
  /** chave "suspeito/pergunta" */
  perguntas: Map<string, Registro>;
  /** chave "suspeito/pergunta/trecho" */
  trechos: Map<string, Registro>;
  /** suspeito → última pausa (some quando alguém volta a perguntar) */
  pausas: Map<string, Registro>;
  itens: Map<string, ItemQuadro>;
  fios: Map<string, Fio>;
  teorias: Map<string, Teoria>;
  /** Eventos aceitos, em ordem cronológica. */
  eventos: Evento[];
}

export const chaveTrecho = (suspeito: string, pergunta: string, trecho: number) => `${suspeito}/${pergunta}/${trecho}`;

export const totalVotos = (t: Teoria) => t.votosBase + Object.values(t.votos).reduce<number>((s, v) => s + v, 0);

export function estadoInicial(caso: Caso): EstadoCaso {
  const itens = new Map<string, ItemQuadro>();
  itens.set('vitima', { ref: 'vitima', tipo: 'vitima', ...POS_VITIMA });
  caso.suspeitos.forEach((s, i) => {
    const ref = `suspeito:${s.id}`;
    itens.set(ref, { ref, tipo: 'suspeito', ...VAGAS_SUSPEITOS[i % VAGAS_SUSPEITOS.length] });
  });
  return {
    examinados: new Map(),
    pistas: new Map(),
    perguntas: new Map(),
    trechos: new Map(),
    pausas: new Map(),
    itens,
    fios: new Map(),
    teorias: new Map(),
    eventos: [],
  };
}

const acharPergunta = (caso: Caso, suspeito: string, pergunta: string) =>
  caso.suspeitos.find((s) => s.id === suspeito)?.perguntas.find((p) => p.id === pergunta);

/** Por que este evento não pode acontecer agora (ou null, se pode). */
export function checarEvento(caso: Caso, estado: EstadoCaso, e: DadosEvento, autor: string): string | null {
  switch (e.tipo) {
    case 'examinou': {
      if (!caso.cena.pontos.some((p) => p.ancora === e.ancora)) return 'Esse ponto não existe na cena.';
      return estado.examinados.has(e.ancora) ? 'Esse ponto já foi examinado.' : null;
    }
    case 'perguntou': {
      const p = acharPergunta(caso, e.suspeito, e.pergunta);
      if (!p) return 'Essa pergunta não existe.';
      if (estado.perguntas.has(`${e.suspeito}/${e.pergunta}`)) return 'Essa pergunta já foi feita.';
      return exigencias(p).every((id) => estado.pistas.has(id)) ? null : 'Falta uma pista para fazer essa pergunta.';
    }
    case 'marcou-trecho': {
      const p = acharPergunta(caso, e.suspeito, e.pergunta);
      if (!p || !estado.perguntas.has(`${e.suspeito}/${e.pergunta}`)) return 'Essa resposta ainda não foi ouvida.';
      if (e.trecho >= p.resposta.length) return 'Esse trecho não existe.';
      return estado.trechos.has(chaveTrecho(e.suspeito, e.pergunta, e.trecho)) ? 'Esse trecho já foi marcado.' : null;
    }
    case 'pausou':
      return caso.suspeitos.some((s) => s.id === e.suspeito) ? null : 'Esse suspeito não existe.';
    case 'nota':
      return estado.itens.has(`nota:${e.nota}`) ? 'Essa nota já existe.' : null;
    case 'pista-no-quadro':
      if (!estado.pistas.has(e.pista)) return 'Essa pista ainda não foi encontrada.';
      return estado.itens.has(`pista:${e.pista}`) ? 'Essa pista já está no quadro.' : null;
    case 'foto-cena':
      if (!estado.examinados.has(e.ancora)) return 'Esse ponto da cena ainda não foi examinado.';
      return estado.itens.has(`cena:${e.ancora}`) ? 'Essa foto já está no quadro.' : null;
    case 'recorte':
      return estado.itens.has(`recorte:${e.recorte}`) ? 'Esse recorte já está no quadro.' : null;
    case 'item-movido':
      return estado.itens.has(e.item) ? null : 'Esse item não está no quadro.';
    case 'item-removido': {
      const item = estado.itens.get(e.item);
      if (!item) return 'Esse item não está no quadro.';
      if (!item.autor) return 'A vítima e os suspeitos ficam sempre no quadro.';
      return item.autor === autor ? null : 'Só quem prendeu o item pode tirá-lo.';
    }
    case 'fio':
      if (e.de === e.para) return 'Escolha dois itens diferentes.';
      if (!estado.itens.has(e.de) || !estado.itens.has(e.para)) return 'Esse item não está no quadro.';
      return estado.fios.has(chaveFio(e.de, e.para)) ? 'Esses itens já estão ligados.' : null;
    case 'fio-removido': {
      const fio = estado.fios.get(chaveFio(e.de, e.para));
      if (!fio) return 'Esse fio não existe.';
      return fio.autor === autor ? null : 'Só quem ligou o fio pode desfazê-lo.';
    }
    case 'teoria':
      if (estado.teorias.has(e.teoria)) return 'Essa teoria já existe.';
      return !e.suspeito || caso.suspeitos.some((s) => s.id === e.suspeito) ? null : 'Esse suspeito não existe.';
    case 'voto': {
      const t = estado.teorias.get(e.teoria);
      if (!t) return 'Essa teoria não existe.';
      return t.autor === autor ? 'Você não pode votar na sua própria teoria.' : null;
    }
  }
}

/** Aplica um evento já checado (muta o estado). */
function aplicar(caso: Caso, s: EstadoCaso, e: Evento) {
  const reg = { autor: e.autor, em: e.em };
  switch (e.tipo) {
    case 'examinou': {
      s.examinados.set(e.ancora, reg);
      const pista = caso.cena.pontos.find((p) => p.ancora === e.ancora)?.pista;
      if (pista && !s.pistas.has(pista)) s.pistas.set(pista, { ...reg, origem: { tipo: 'cena', ancora: e.ancora } });
      return;
    }
    case 'perguntou': {
      s.perguntas.set(`${e.suspeito}/${e.pergunta}`, reg);
      s.pausas.delete(e.suspeito);
      for (const id of acharPergunta(caso, e.suspeito, e.pergunta)!.revela) {
        if (!s.pistas.has(id)) s.pistas.set(id, { ...reg, origem: { tipo: 'depoimento', suspeito: e.suspeito, pergunta: e.pergunta } });
      }
      return;
    }
    case 'marcou-trecho':
      s.trechos.set(chaveTrecho(e.suspeito, e.pergunta, e.trecho), reg);
      return;
    case 'pausou':
      s.pausas.set(e.suspeito, reg);
      return;
    case 'nota':
      s.itens.set(`nota:${e.nota}`, { ref: `nota:${e.nota}`, tipo: 'nota', x: e.x, y: e.y, texto: e.texto, ...reg });
      return;
    case 'pista-no-quadro':
      s.itens.set(`pista:${e.pista}`, { ref: `pista:${e.pista}`, tipo: 'pista', x: e.x, y: e.y, ...reg });
      return;
    case 'foto-cena':
      s.itens.set(`cena:${e.ancora}`, { ref: `cena:${e.ancora}`, tipo: 'cena', x: e.x, y: e.y, legenda: e.legenda, ...reg });
      return;
    case 'recorte':
      s.itens.set(`recorte:${e.recorte}`, { ref: `recorte:${e.recorte}`, tipo: 'recorte', x: e.x, y: e.y, fonte: e.fonte, titulo: e.titulo, texto: e.texto, ...reg });
      return;
    case 'item-movido': {
      const item = s.itens.get(e.item)!;
      s.itens.set(e.item, { ...item, x: e.x, y: e.y, ordem: e.em });
      return;
    }
    case 'item-removido':
      s.itens.delete(e.item);
      for (const [k, f] of s.fios) if (f.de === e.item || f.para === e.item) s.fios.delete(k);
      return;
    case 'fio':
      s.fios.set(chaveFio(e.de, e.para), { de: e.de, para: e.para, ...reg });
      return;
    case 'fio-removido':
      s.fios.delete(chaveFio(e.de, e.para));
      return;
    case 'teoria':
      s.teorias.set(e.teoria, { id: e.teoria, titulo: e.titulo, texto: e.texto, suspeito: e.suspeito, votosBase: e.votosBase, votos: {}, ...reg });
      return;
    case 'voto': {
      const t = s.teorias.get(e.teoria)!;
      s.teorias.set(e.teoria, { ...t, votos: { ...t.votos, [e.autor]: e.valor } });
      return;
    }
  }
}

/** Refaz o estado do caso a partir dos eventos. Eventos impossíveis são ignorados. */
export function derivarEstado(caso: Caso, eventos: readonly Evento[]): EstadoCaso {
  const s = estadoInicial(caso);
  const ordenados = [...eventos].sort((a, b) => a.em - b.em);
  for (const e of ordenados) {
    if (checarEvento(caso, s, e, e.autor)) continue;
    aplicar(caso, s, e);
    s.eventos.push(e);
  }
  return s;
}

