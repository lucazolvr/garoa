// Regras do jogo que as telas consultam. Funções puras sobre (caso, estado).
import type { Caso, Pergunta } from '../casos/esquema';
import { exigencias } from '../casos/validar';
import { totalVotos, type EstadoCaso } from './estado';
import type { CasoPrivado } from './privado';

export const MAX_TENTATIVAS = 3;

export type StatusMapa = 'novo' | 'andamento' | 'resolvido' | 'alerta';

export const perguntaFeita = (estado: EstadoCaso, suspeito: string, p: Pergunta) => estado.perguntas.has(`${suspeito}/${p.id}`);
export const perguntaLiberada = (estado: EstadoCaso, p: Pergunta) => exigencias(p).every((id) => estado.pistas.has(id));

/** Fração das pistas do caso já encontradas pela equipe (0 a 1). */
export const progresso = (caso: Caso, estado: EstadoCaso) => estado.pistas.size / caso.pistas.length;

export function resumoProgresso(caso: Caso, estado: EstadoCaso) {
  return {
    pontos: [estado.examinados.size, caso.cena.pontos.length] as const,
    suspeitos: [caso.suspeitos.filter((s) => s.perguntas.some((p) => perguntaFeita(estado, s.id, p))).length, caso.suspeitos.length] as const,
    pistas: estado.pistas.size,
    teorias: estado.teorias.size,
  };
}

export function statusNoMapa(caso: Caso, estado: EstadoCaso, privado?: CasoPrivado): StatusMapa {
  if (privado && privado.status !== 'aberto') return 'resolvido';
  if (caso.urgente) return 'alerta';
  return estado.eventos.length ? 'andamento' : 'novo';
}

export type SituacaoSuspeito = 'nao-interrogado' | 'em-andamento' | 'interrogado';

export function situacaoSuspeito(caso: Caso, estado: EstadoCaso, suspeitoId: string): SituacaoSuspeito {
  const s = caso.suspeitos.find((x) => x.id === suspeitoId)!;
  const feitas = s.perguntas.filter((p) => perguntaFeita(estado, s.id, p)).length;
  if (feitas === 0) return 'nao-interrogado';
  const pendentes = s.perguntas.some((p) => !perguntaFeita(estado, s.id, p) && perguntaLiberada(estado, p));
  return pendentes || estado.pausas.has(s.id) ? 'em-andamento' : 'interrogado';
}

/** Quanto a equipe suspeita de cada um: votos positivos das teorias que apontam para ele (0 a 100). */
export function suspeita(caso: Caso, estado: EstadoCaso): Record<string, number> {
  const soma: Record<string, number> = Object.fromEntries(caso.suspeitos.map((s) => [s.id, 0]));
  for (const t of estado.teorias.values()) if (t.suspeito && t.suspeito in soma) soma[t.suspeito] += Math.max(0, totalVotos(t));
  const total = Object.values(soma).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.entries(soma).map(([id, v]) => [id, total ? Math.round((v / total) * 100) : 0]));
}

/** Tensão da última resposta do suspeito (ou null se ninguém perguntou nada). */
export function tensaoAtual(caso: Caso, estado: EstadoCaso, suspeitoId: string) {
  const s = caso.suspeitos.find((x) => x.id === suspeitoId)!;
  let ultima: { em: number; tensao: Pergunta['tensao'] } | null = null;
  for (const p of s.perguntas) {
    const r = estado.perguntas.get(`${s.id}/${p.id}`);
    if (r && (!ultima || r.em >= ultima.em)) ultima = { em: r.em, tensao: p.tensao };
  }
  return ultima?.tensao ?? null;
}

export interface Acusacao {
  suspeito: string;
  motivo: string;
  evidencia: string;
}

export function avaliarAcusacao(caso: Caso, a: Acusacao) {
  const acertos =
    Number(a.suspeito === caso.solucao.culpado) +
    Number(a.motivo === caso.solucao.motivo) +
    Number(caso.solucao.evidencias.includes(a.evidencia));
  return { correta: acertos === 3, acertos };
}

/** Registra uma tentativa. Acertar resolve; errar a última encerra o caso para o jogador. */
export function registrarAcusacao(caso: Caso, cp: CasoPrivado, a: Acusacao, em: number): CasoPrivado {
  if (cp.status !== 'aberto') throw new Error('Este caso já foi fechado para você.');
  const { correta, acertos } = avaliarAcusacao(caso, a);
  const tentativas = [...cp.tentativas, { ...a, acertos, em }];
  if (correta) return { tentativas, status: 'resolvido', fechadoEm: em };
  if (tentativas.length >= MAX_TENTATIVAS) return { tentativas, status: 'encerrado', fechadoEm: em };
  return { tentativas, status: 'aberto' };
}

/** Resumo de cada detetive que já mexeu no caso, como no design ("4 conexões", "2 pistas"). */
export function detetivesNoCaso(caso: Caso, estado: EstadoCaso) {
  const conta = new Map<string, { pistas: number; fios: number; perguntas: number; notas: number; teorias: number }>();
  const de = (autor: string) => {
    let c = conta.get(autor);
    if (!c) conta.set(autor, (c = { pistas: 0, fios: 0, perguntas: 0, notas: 0, teorias: 0 }));
    return c;
  };
  if (caso.coopSimulado.abertoPor) de(caso.coopSimulado.abertoPor);
  for (const p of estado.pistas.values()) de(p.autor).pistas++;
  for (const f of estado.fios.values()) de(f.autor).fios++;
  for (const r of estado.perguntas.values()) de(r.autor).perguntas++;
  for (const t of estado.teorias.values()) de(t.autor).teorias++;
  for (const i of estado.itens.values()) if (i.tipo === 'nota' && i.autor) de(i.autor).notas++;

  const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
  return [...conta.entries()].map(([handle, c]) => {
    let papel = 'observando';
    if (handle === caso.coopSimulado.abertoPor) papel = 'abriu o caso';
    else if (c.fios >= Math.max(c.pistas, c.perguntas, 1)) papel = plural(c.fios, 'conexão', 'conexões');
    else if (c.pistas >= Math.max(c.perguntas, 1)) papel = plural(c.pistas, 'pista', 'pistas');
    else if (c.perguntas) papel = plural(c.perguntas, 'pergunta', 'perguntas');
    else if (c.teorias) papel = plural(c.teorias, 'teoria', 'teorias');
    else if (c.notas) papel = plural(c.notas, 'nota', 'notas');
    return { handle, papel, ...c };
  });
}
