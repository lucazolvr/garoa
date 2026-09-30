// Diário do caso: cada evento vira uma linha "@autor verbo objeto".
import type { Caso } from '../casos/esquema';
import type { EstadoCaso } from './estado';
import { idDe, tipoDe } from './quadro';

export interface LinhaDiario {
  id: string;
  casoId: string;
  autor: string;
  em: number;
  verbo: string;
  obj?: string;
}

/** Nome curto de um item do quadro, para frases como "ligou X → Y". */
export function rotuloItem(caso: Caso, estado: EstadoCaso, ref: string): string {
  const id = idDe(ref);
  switch (tipoDe(ref)) {
    case 'vitima':
      return caso.vitima.curto;
    case 'suspeito':
      return caso.suspeitos.find((s) => s.id === id)?.curto ?? id;
    case 'pista':
      return caso.pistas.find((p) => p.id === id)?.nome ?? id;
    case 'cena':
      return estado.itens.get(ref)?.legenda ?? 'foto da cena';
    case 'recorte':
      return 'recorte de jornal';
    case 'nota': {
      const texto = estado.itens.get(ref)?.texto ?? '';
      if (texto.length <= 24) return `“${texto}”`;
      const espaco = texto.slice(0, 24).lastIndexOf(' ');
      return `“${texto.slice(0, espaco > 10 ? espaco : 22).trimEnd()}…”`;
    }
  }
}

export function diario(caso: Caso, estado: EstadoCaso): LinhaDiario[] {
  const linhas: LinhaDiario[] = [];
  const nomePista = (id: string) => caso.pistas.find((p) => p.id === id)?.nome ?? id;
  const curto = (id: string) => caso.suspeitos.find((s) => s.id === id)?.curto ?? id;
  const feitas = new Map<string, number>();

  if (caso.coopSimulado.abertoPor && estado.eventos.length) {
    linhas.push({ id: `abertura-${caso.id}`, casoId: caso.id, autor: caso.coopSimulado.abertoPor, em: estado.eventos[0].em - 60_000, verbo: 'abriu o caso' });
  }

  for (const e of estado.eventos) {
    const base = { id: e.id, casoId: caso.id, autor: e.autor, em: e.em };
    const add = (verbo: string, obj?: string) => linhas.push({ ...base, verbo, obj });
    switch (e.tipo) {
      case 'examinou': {
        const pista = caso.cena.pontos.find((p) => p.ancora === e.ancora)?.pista;
        if (pista) add('achou na cena:', nomePista(pista));
        else add('examinou a cena do crime');
        break;
      }
      case 'perguntou': {
        const n = (feitas.get(e.suspeito) ?? 0) + 1;
        feitas.set(e.suspeito, n);
        const revela = caso.suspeitos.find((s) => s.id === e.suspeito)?.perguntas.find((p) => p.id === e.pergunta)?.revela ?? [];
        const nova = revela.find((id) => {
          const o = estado.pistas.get(id)?.origem;
          return o?.tipo === 'depoimento' && o.suspeito === e.suspeito && o.pergunta === e.pergunta;
        });
        if (nova) add(`interrogou ${curto(e.suspeito)} e descobriu:`, nomePista(nova));
        else add(`interrogou ${curto(e.suspeito)}`, `pergunta ${n}`);
        break;
      }
      case 'marcou-trecho':
        add('marcou um trecho do depoimento de', curto(e.suspeito));
        break;
      case 'pausou':
        add(`pausou o interrogatório de ${curto(e.suspeito)} na`, `pergunta ${(feitas.get(e.suspeito) ?? 0) + 1}`);
        break;
      case 'nota':
        add('deixou uma nota no quadro:', `“${e.texto}”`);
        break;
      case 'pista-no-quadro':
        add('prendeu no quadro:', nomePista(e.pista));
        break;
      case 'foto-cena':
        add('prendeu uma foto da cena:', e.legenda);
        break;
      case 'recorte':
        add('prendeu um recorte de jornal no quadro');
        break;
      case 'fio':
        add('ligou', `${rotuloItem(caso, estado, e.de)} → ${rotuloItem(caso, estado, e.para)}`);
        break;
      case 'teoria':
        add('propôs a teoria', e.titulo);
        break;
    }
  }
  return linhas;
}
