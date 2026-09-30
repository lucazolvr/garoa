// Validador de casos: além do formato (Zod), confere se o caso TEM SOLUÇÃO,
// simulando o jogo: examina a cena, libera perguntas cujas exigências já foram
// cumpridas e repete até não haver nada novo.
import { Caso, type Pergunta } from './esquema';
import { CENARIOS, BAIRROS, MAPA } from './catalogo';

export interface Resultado {
  caso?: Caso;
  erros: string[];
  avisos: string[];
}

export interface Alcance {
  pistas: Set<string>;
  /** "suspeito/pergunta" */
  perguntas: Set<string>;
}

export const chavePergunta = (suspeito: string, pergunta: string) => `${suspeito}/${pergunta}`;

/** Pistas exigidas por uma pergunta ("mostra" conta como exigida). */
export function exigencias(p: Pergunta): string[] {
  return p.mostra && !p.requer.includes(p.mostra) ? [...p.requer, p.mostra] : p.requer;
}

/** Tudo que um detetive consegue alcançar partindo do zero. */
export function simularAlcance(caso: Caso, inicial: Iterable<string> = []): Alcance {
  const pistas = new Set<string>(inicial);
  const perguntas = new Set<string>();
  for (const ponto of caso.cena.pontos) if (ponto.pista) pistas.add(ponto.pista);
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const s of caso.suspeitos) {
      for (const p of s.perguntas) {
        const k = chavePergunta(s.id, p.id);
        if (perguntas.has(k) || !exigencias(p).every((id) => pistas.has(id))) continue;
        perguntas.add(k);
        p.revela.forEach((id) => pistas.add(id));
        mudou = true;
      }
    }
  }
  return { pistas, perguntas };
}

function duplicados(ids: string[]): string[] {
  const vistos = new Set<string>();
  return [...new Set(ids.filter((id) => (vistos.has(id) ? true : (vistos.add(id), false))))];
}

export function validarCaso(dados: unknown): Resultado {
  const erros: string[] = [];
  const avisos: string[] = [];
  const r = Caso.safeParse(dados);
  if (!r.success) {
    for (const issue of r.error.issues) erros.push(`${issue.path.join('.') || '(raiz)'}: ${issue.message}`);
    return { erros, avisos };
  }
  const caso = r.data;
  const pistas = new Set(caso.pistas.map((p) => p.id));
  const suspeitos = new Map(caso.suspeitos.map((s) => [s.id, s]));
  const motivos = new Set(caso.motivos.map((m) => m.id));
  const cenario = CENARIOS[caso.cena.cenario];

  // ---------- ids únicos e referências ----------
  for (const [nome, ids] of [
    ['pistas', caso.pistas.map((p) => p.id)],
    ['suspeitos', caso.suspeitos.map((s) => s.id)],
    ['motivos', caso.motivos.map((m) => m.id)],
    ['pontos da cena', caso.cena.pontos.map((p) => p.ancora)],
  ] as const) {
    for (const id of duplicados([...ids])) erros.push(`${nome}: id repetido "${id}"`);
  }

  const pistaExiste = (id: string, onde: string) => {
    if (!pistas.has(id)) erros.push(`${onde}: pista "${id}" não existe`);
  };

  caso.cena.pontos.forEach((ponto, i) => {
    if (!cenario.ancoras[ponto.ancora]) {
      erros.push(`cena.pontos.${i}: âncora "${ponto.ancora}" não existe no cenário "${caso.cena.cenario}" (use: ${Object.keys(cenario.ancoras).join(', ')})`);
    }
    if (ponto.pista) pistaExiste(ponto.pista, `cena.pontos.${i}`);
  });

  for (const s of caso.suspeitos) {
    for (const id of duplicados(s.perguntas.map((p) => p.id))) erros.push(`suspeito "${s.id}": pergunta repetida "${id}"`);
    for (const p of s.perguntas) {
      const onde = `suspeito "${s.id}", pergunta "${p.id}"`;
      p.requer.forEach((id) => pistaExiste(id, `${onde} (requer)`));
      p.revela.forEach((id) => pistaExiste(id, `${onde} (revela)`));
      if (p.mostra) pistaExiste(p.mostra, `${onde} (mostra)`);
      const circular = p.revela.filter((id) => exigencias(p).includes(id));
      if (circular.length) erros.push(`${onde}: revela uma pista que ela mesma exige (${circular.join(', ')})`);
    }
    if (!s.perguntas.some((p) => exigencias(p).length === 0)) {
      avisos.push(`suspeito "${s.id}": nenhuma pergunta está liberada desde o início`);
    }
  }

  if (!suspeitos.has(caso.solucao.culpado)) erros.push(`solucao.culpado: suspeito "${caso.solucao.culpado}" não existe`);
  if (!motivos.has(caso.solucao.motivo)) erros.push(`solucao.motivo: motivo "${caso.solucao.motivo}" não está entre as opções`);
  caso.solucao.evidencias.forEach((id) => pistaExiste(id, 'solucao.evidencias'));

  if (erros.length) return { erros, avisos };

  // ---------- solubilidade ----------
  const alcance = simularAlcance(caso);
  for (const p of caso.pistas) {
    if (!alcance.pistas.has(p.id)) erros.push(`pista "${p.id}" nunca pode ser encontrada (nenhum ponto da cena nem pergunta alcançável a revela)`);
  }
  for (const s of caso.suspeitos) {
    for (const p of s.perguntas) {
      if (!alcance.perguntas.has(chavePergunta(s.id, p.id))) {
        const faltam = exigencias(p).filter((id) => !alcance.pistas.has(id));
        erros.push(`suspeito "${s.id}", pergunta "${p.id}" nunca fica liberada (faltam: ${faltam.join(', ')})`);
      }
    }
  }
  for (const id of caso.solucao.evidencias) {
    if (!alcance.pistas.has(id)) erros.push(`solucao.evidencias: "${id}" não pode ser obtida`);
  }
  if (!caso.pistas.some((p) => p.importante)) avisos.push('nenhuma pista marcada como importante');
  const direto = caso.solucao.evidencias.every((id) => caso.cena.pontos.some((p) => p.pista === id));
  if (direto) avisos.push('todas as evidências aceitas estão na cena: o caso pode ser resolvido sem interrogar ninguém');

  const area = BAIRROS[caso.bairro];
  const { x, y } = caso.mapa;
  if (x < area[0] || y < area[1] || x + MAPA.marcador.largura > area[0] + area[2] || y + MAPA.marcador.altura > area[1] + area[3]) {
    avisos.push(`mapa: o marcador (${x}, ${y}) está fora da área do bairro ${caso.bairro} [${area.join(', ')}]`);
  }

  validarCoop(caso, erros, avisos);
  return erros.length ? { erros, avisos } : { caso, erros, avisos };
}

/** Os eventos simulados precisam ser jogadas possíveis, na ordem em que aconteceram. */
function validarCoop(caso: Caso, erros: string[], avisos: string[]) {
  const eventos = [...caso.coopSimulado.eventos].sort((a, b) => b.minutosAtras - a.minutosAtras);
  const pontos = new Map(caso.cena.pontos.map((p) => [p.ancora, p]));
  const suspeitos = new Map(caso.suspeitos.map((s) => [s.id, s]));
  const conhecidas = new Set<string>();
  const examinadas = new Set<string>();
  const perguntadas = new Set<string>();
  const itens = new Set<string>(['vitima', ...caso.suspeitos.map((s) => `suspeito:${s.id}`)]);
  const teorias = new Set<string>();

  eventos.forEach((e) => {
    const onde = `coopSimulado (${e.tipo} de @${e.autor}, ${e.minutosAtras} min)`;
    switch (e.tipo) {
      case 'examinou': {
        const ponto = pontos.get(e.ancora);
        if (!ponto) return erros.push(`${onde}: ponto "${e.ancora}" não está na cena`);
        examinadas.add(e.ancora);
        if (ponto.pista) conhecidas.add(ponto.pista);
        return;
      }
      case 'perguntou':
      case 'marcou-trecho': {
        const p = suspeitos.get(e.suspeito)?.perguntas.find((q) => q.id === e.pergunta);
        if (!p) return erros.push(`${onde}: pergunta "${e.suspeito}/${e.pergunta}" não existe`);
        if (e.tipo === 'marcou-trecho') {
          if (!perguntadas.has(chavePergunta(e.suspeito, e.pergunta))) erros.push(`${onde}: trecho marcado antes de a pergunta ser feita`);
          if (e.trecho >= p.resposta.length) erros.push(`${onde}: a resposta só tem ${p.resposta.length} frases`);
          return;
        }
        const faltam = exigencias(p).filter((id) => !conhecidas.has(id));
        if (faltam.length) erros.push(`${onde}: pergunta feita antes de encontrar ${faltam.join(', ')}`);
        perguntadas.add(chavePergunta(e.suspeito, e.pergunta));
        p.revela.forEach((id) => conhecidas.add(id));
        return;
      }
      case 'pausou':
        if (!suspeitos.has(e.suspeito)) erros.push(`${onde}: suspeito "${e.suspeito}" não existe`);
        return;
      case 'nota':
        if (itens.has(`nota:${e.nota}`)) erros.push(`${onde}: nota "${e.nota}" repetida`);
        itens.add(`nota:${e.nota}`);
        return;
      case 'pista-no-quadro':
        if (!conhecidas.has(e.pista)) erros.push(`${onde}: pista "${e.pista}" ainda não foi encontrada`);
        itens.add(`pista:${e.pista}`);
        return;
      case 'foto-cena':
        if (!examinadas.has(e.ancora)) erros.push(`${onde}: ponto "${e.ancora}" ainda não foi examinado`);
        itens.add(`cena:${e.ancora}`);
        return;
      case 'recorte':
        itens.add(`recorte:${e.recorte}`);
        return;
      case 'item-movido':
      case 'item-removido':
        if (!itens.has(e.item)) erros.push(`${onde}: item "${e.item}" não está no quadro`);
        if (e.tipo === 'item-removido') itens.delete(e.item);
        return;
      case 'fio':
      case 'fio-removido':
        for (const ref of [e.de, e.para]) if (!itens.has(ref)) erros.push(`${onde}: item "${ref}" não está no quadro`);
        if (e.de === e.para) erros.push(`${onde}: fio ligando um item a ele mesmo`);
        return;
      case 'teoria':
        if (teorias.has(e.teoria)) erros.push(`${onde}: teoria "${e.teoria}" repetida`);
        if (e.suspeito && !suspeitos.has(e.suspeito)) erros.push(`${onde}: suspeito "${e.suspeito}" não existe`);
        teorias.add(e.teoria);
        return;
      case 'voto':
        if (!teorias.has(e.teoria)) erros.push(`${onde}: teoria "${e.teoria}" não existe`);
        return;
    }
  });

  if (caso.pistas.length && conhecidas.size / caso.pistas.length > 0.75) {
    avisos.push(`coopSimulado já revela ${conhecidas.size} de ${caso.pistas.length} pistas: sobra pouco para o jogador`);
  }
}

/** Regras entre casos: ids e marcadores no mapa. */
export function validarConjunto(casos: Caso[]): { erros: string[]; avisos: string[] } {
  const erros = duplicados(casos.map((c) => c.id)).map((id) => `caso #${id} aparece mais de uma vez`);
  const avisos: string[] = [];
  for (let i = 0; i < casos.length; i++) {
    for (let j = i + 1; j < casos.length; j++) {
      const a = casos[i].mapa, b = casos[j].mapa;
      if (Math.abs(a.x - b.x) < MAPA.marcador.largura && Math.abs(a.y - b.y) < MAPA.marcador.altura) {
        avisos.push(`marcadores de #${casos[i].id} e #${casos[j].id} se sobrepõem no mapa`);
      }
    }
  }
  return { erros, avisos };
}
