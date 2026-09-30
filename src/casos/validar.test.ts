import { describe, expect, it } from 'vitest';
import { validarCaso, validarConjunto } from './validar';
import relogio from './dados/0412-relogio-parado.json';
import cinema from './dados/0421-apagao-cine-estrela.json';

const copia = <T>(o: T): T => structuredClone(o);

describe('validarCaso', () => {
  it.each([
    ['0412 O Relógio Parado', relogio],
    ['0421 Apagão no Cine Estrela', cinema],
  ])('aprova o caso real %s', (_, dados) => {
    const r = validarCaso(dados);
    expect(r.erros).toEqual([]);
    expect(r.caso).toBeDefined();
  });

  it('reprova culpado que não é suspeito', () => {
    const c = copia(relogio);
    c.solucao.culpado = 'mordomo';
    expect(validarCaso(c).erros).toContain('solucao.culpado: suspeito "mordomo" não existe');
  });

  it('reprova motivo fora das opções', () => {
    const c = copia(relogio);
    c.solucao.motivo = 'tedio';
    expect(validarCaso(c).erros.join()).toMatch(/motivo "tedio" não está entre as opções/);
  });

  it('reprova pista que ninguém revela', () => {
    const c = copia(cinema);
    c.cena.pontos = c.cena.pontos.filter((p) => p.pista !== 'escada-barro');
    expect(validarCaso(c).erros).toContain('pista "escada-barro" nunca pode ser encontrada (nenhum ponto da cena nem pergunta alcançável a revela)');
  });

  it('reprova dependência circular entre perguntas', () => {
    const c = copia(cinema);
    // maos-graxa passa a exigir dividas-beto, que só é revelada por quem exige maos-graxa
    const tito = c.suspeitos.find((s) => s.id === 'tito')!;
    const q = tito.perguntas.find((p) => p.id === 'quadro-forca')!;
    (q as { requer?: string[] }).requer = ['dividas-beto'];
    const erros = validarCaso(c).erros.join('\n');
    expect(erros).toMatch(/pista "maos-graxa" nunca pode ser encontrada/);
    expect(erros).toMatch(/pergunta "dinheiro-beto" nunca fica liberada \(faltam: maos-graxa\)/);
  });

  it('reprova evidência inalcançável', () => {
    const c = copia(cinema);
    const nair = c.suspeitos.find((s) => s.id === 'nair')!;
    nair.perguntas = nair.perguntas.filter((p) => p.id !== 'cortesia');
    expect(validarCaso(c).erros).toContain('solucao.evidencias: "cortesia-beto" não pode ser obtida');
  });

  it('reprova âncora que não existe no cenário', () => {
    const c = copia(cinema);
    c.cena.pontos[0].ancora = 'relogio';
    expect(validarCaso(c).erros.join()).toMatch(/âncora "relogio" não existe no cenário "sala-cinema"/);
  });

  it('reprova ids fora do formato', () => {
    const c = copia(cinema);
    c.pistas[0].id = 'Fusível Removido';
    expect(validarCaso(c).erros.join()).toMatch(/pistas\.0\.id: use kebab-case/);
  });

  it('reprova jogada simulada impossível', () => {
    const c = copia(relogio);
    // Irene só explica o horário depois de encontrarem a discussão das 22:40
    c.coopSimulado.eventos.push({ autor: 'caju', minutosAtras: 9000, tipo: 'perguntou', suspeito: 'irene', pergunta: 'depois-jantar' } as never);
    expect(validarCaso(c).erros.join()).toMatch(/pergunta feita antes de encontrar discussao-2240, conta-restaurante/);
  });

  it('avisa quando tudo se resolve só pela cena', () => {
    const c = copia(cinema);
    c.solucao.evidencias = ['fusivel-removido'];
    expect(validarCaso(c).avisos.join()).toMatch(/sem interrogar ninguém/);
  });
});

describe('validarConjunto', () => {
  it('avisa marcadores sobrepostos e reprova ids repetidos', () => {
    const a = validarCaso(relogio).caso!;
    const b = { ...a, mapa: { x: a.mapa.x + 10, y: a.mapa.y } };
    const r = validarConjunto([a, b]);
    expect(r.erros).toEqual(['caso #0412 aparece mais de uma vez']);
    expect(r.avisos).toHaveLength(1);
  });
});
