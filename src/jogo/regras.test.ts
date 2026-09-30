import { describe, expect, it } from 'vitest';
import relogioJson from '../casos/dados/0412-relogio-parado.json';
import cinemaJson from '../casos/dados/0421-apagao-cine-estrela.json';
import { validarCaso } from '../casos/validar';
import type { DadosEvento, Evento } from '../casos/esquema';
import { checarEvento, derivarEstado, totalVotos } from './estado';
import { eventosSimulados } from './semente';
import { avaliarAcusacao, progresso, registrarAcusacao, situacaoSuspeito, statusNoMapa, suspeita, tensaoAtual } from './regras';
import { casoPrivadoVazio } from './privado';
import { nivel, xpNoCaso, xpResolucao } from './xp';
import { diario } from './diario';

const relogio = validarCaso(relogioJson).caso!;
const cinema = validarCaso(cinemaJson).caso!;
const AGORA = 1_800_000_000_000;

let seq = 0;
const ev = (dados: DadosEvento, autor = 'lucas', em = AGORA + ++seq): Evento => ({ ...dados, id: `t${seq}`, autor, em }) as Evento;

describe('estado a partir da semente', () => {
  const estado = derivarEstado(relogio, eventosSimulados(relogio, AGORA));

  it('reproduz o que os detetives simulados fizeram', () => {
    expect(estado.eventos).toHaveLength(relogio.coopSimulado.eventos.length);
    expect(estado.examinados.size).toBe(5);
    expect([...estado.pistas.keys()].sort()).toEqual(
      ['bilhete-rasgado', 'chave-mestra', 'discussao-2240', 'pegadas-molhadas', 'recibo-penhor', 'relogio-parado', 'xicara-residuo'],
    );
    expect(estado.pausas.get('rui')?.autor).toBe('nevoeiro');
    expect(progresso(relogio, estado)).toBeCloseTo(7 / 12);
  });

  it('calcula a suspeita da equipe pelos votos das teorias', () => {
    expect(suspeita(relogio, estado)).toEqual({ irene: 75, caio: 25, lucia: 0, rui: 0 });
  });

  it('marca status no mapa', () => {
    expect(statusNoMapa(relogio, estado)).toBe('andamento');
    expect(statusNoMapa(cinema, derivarEstado(cinema, []))).toBe('novo');
    expect(statusNoMapa(relogio, estado, { tentativas: [], status: 'resolvido' })).toBe('resolvido');
  });
});

describe('examinar e perguntar', () => {
  it('examinar revela a pista do ponto uma única vez', () => {
    const e = ev({ tipo: 'examinou', ancora: 'escada' });
    const estado = derivarEstado(cinema, [e]);
    expect(estado.pistas.get('escada-barro')).toMatchObject({ autor: 'lucas', origem: { tipo: 'cena', ancora: 'escada' } });
    expect(checarEvento(cinema, estado, { tipo: 'examinou', ancora: 'escada' }, 'lucas')).toBe('Esse ponto já foi examinado.');
  });

  it('pergunta que exige pista só libera depois de achá-la', () => {
    const vazio = derivarEstado(cinema, []);
    const mostrar = { tipo: 'perguntou', suspeito: 'nair', pergunta: 'cortesia' } as const;
    expect(checarEvento(cinema, vazio, mostrar, 'lucas')).toBe('Falta uma pista para fazer essa pergunta.');
    const comIngresso = derivarEstado(cinema, [ev({ tipo: 'examinou', ancora: 'poltrona' })]);
    expect(checarEvento(cinema, comIngresso, mostrar, 'lucas')).toBeNull();
  });

  it('resposta revela pista e registra tensão; pergunta nova tira a pausa', () => {
    const estado = derivarEstado(cinema, [
      ev({ tipo: 'pausou', suspeito: 'tito' }, 'caju'),
      ev({ tipo: 'perguntou', suspeito: 'tito', pergunta: 'quadro-forca' }),
    ]);
    expect(estado.pistas.get('maos-graxa')?.origem).toEqual({ tipo: 'depoimento', suspeito: 'tito', pergunta: 'quadro-forca' });
    expect(tensaoAtual(cinema, estado, 'tito')).toBe('media');
    expect(estado.pausas.has('tito')).toBe(false);
    expect(situacaoSuspeito(cinema, estado, 'tito')).toBe('em-andamento');
  });

  it('ignora eventos impossíveis ao refazer o estado', () => {
    const estado = derivarEstado(cinema, [ev({ tipo: 'perguntou', suspeito: 'beto', pergunta: 'cortesia' })]);
    expect(estado.eventos).toHaveLength(0);
  });
});

describe('quadro', () => {
  it('não deixa tirar vítima nem suspeitos, e tirar um item leva os fios junto', () => {
    const estado = derivarEstado(cinema, [
      ev({ tipo: 'nota', nota: 'n1', texto: 'Quem tinha a chave do quadro de força?', x: 400, y: 300 }),
      ev({ tipo: 'fio', de: 'nota:n1', para: 'suspeito:beto' }),
    ]);
    expect(checarEvento(cinema, estado, { tipo: 'item-removido', item: 'suspeito:beto' }, 'lucas')).toMatch(/ficam sempre no quadro/);
    expect(checarEvento(cinema, estado, { tipo: 'item-removido', item: 'nota:n1' }, 'caju')).toMatch(/Só quem prendeu/);
    const depois = derivarEstado(cinema, [...estado.eventos, ev({ tipo: 'item-removido', item: 'nota:n1' })]);
    expect(depois.itens.has('nota:n1')).toBe(false);
    expect(depois.fios.size).toBe(0);
  });

  it('conta votos e impede votar na própria teoria', () => {
    const estado = derivarEstado(cinema, [
      ev({ tipo: 'teoria', teoria: 't1', titulo: 'Foi o Beto', texto: 'Graxa na porta.', suspeito: 'beto', votosBase: 2 }, 'caju'),
      ev({ tipo: 'voto', teoria: 't1', valor: 1 }),
      ev({ tipo: 'voto', teoria: 't1', valor: -1 }),
    ]);
    expect(totalVotos(estado.teorias.get('t1')!)).toBe(1);
    expect(checarEvento(cinema, estado, { tipo: 'voto', teoria: 't1', valor: 1 }, 'caju')).toMatch(/própria teoria/);
  });
});

describe('acusação', () => {
  const certa = { suspeito: 'beto', motivo: 'divida-jogo', evidencia: 'cortesia-beto' };

  it('aceita qualquer evidência listada na solução', () => {
    expect(avaliarAcusacao(cinema, certa)).toEqual({ correta: true, acertos: 3 });
    expect(avaliarAcusacao(cinema, { ...certa, evidencia: 'fusivel-removido' }).correta).toBe(true);
    expect(avaliarAcusacao(cinema, { ...certa, suspeito: 'nair' })).toEqual({ correta: false, acertos: 2 });
  });

  it('resolve ao acertar e encerra depois de 3 erros', () => {
    const errada = { ...certa, suspeito: 'tito' };
    let cp = registrarAcusacao(cinema, casoPrivadoVazio(), errada, 1);
    expect(cp.status).toBe('aberto');
    expect(registrarAcusacao(cinema, cp, certa, 2)).toMatchObject({ status: 'resolvido', fechadoEm: 2 });
    cp = registrarAcusacao(cinema, cp, errada, 2);
    cp = registrarAcusacao(cinema, cp, errada, 3);
    expect(cp).toMatchObject({ status: 'encerrado', fechadoEm: 3 });
    expect(() => registrarAcusacao(cinema, cp, certa, 4)).toThrow();
  });
});

describe('XP e diário', () => {
  it('soma ações e pistas encontradas pelo detetive', () => {
    const estado = derivarEstado(cinema, [
      ev({ tipo: 'examinou', ancora: 'escada' }), // 5 + 15 da pista
      ev({ tipo: 'examinou', ancora: 'tela' }), // 5, sem pista
      ev({ tipo: 'perguntou', suspeito: 'tito', pergunta: 'quadro-forca' }), // 5 + 15
    ]);
    expect(xpNoCaso(estado, 'lucas')).toBe(45);
    expect(xpNoCaso(estado, 'caju')).toBe(0);
  });

  it('bônus de resolução cai com tentativas erradas', () => {
    expect(xpResolucao(cinema, { tentativas: [{ suspeito: 'beto', motivo: 'divida-jogo', evidencia: 'cortesia-beto', acertos: 3, em: 1 }], status: 'resolvido' })).toBe(200);
    expect(xpResolucao(cinema, { tentativas: [], status: 'encerrado' })).toBe(0);
  });

  it('nível e rank', () => {
    expect(nivel(0)).toMatchObject({ nivel: 1, rank: 'RECRUTA', proximo: 100 });
    expect(nivel(299)).toMatchObject({ nivel: 2, inicio: 100, proximo: 300 });
    expect(nivel(300)).toMatchObject({ nivel: 3, rank: 'AGENTE', proximoRank: { nome: 'DETETIVE', nivel: 6 } });
  });

  it('escreve o diário em frases', () => {
    const estado = derivarEstado(relogio, eventosSimulados(relogio, AGORA));
    const linhas = diario(relogio, estado);
    expect(linhas[0]).toMatchObject({ autor: 'sgt.moreira', verbo: 'abriu o caso' });
    expect(linhas).toContainEqual(expect.objectContaining({ autor: 'lupa_ana', verbo: 'ligou', obj: 'Relógio · 22:17 → “O relógio parou às…”' }));
    expect(linhas).toContainEqual(expect.objectContaining({ autor: 'lupa_ana', verbo: 'interrogou Lúcia e descobriu:', obj: 'Discussão às 22:40' }));
  });
});
