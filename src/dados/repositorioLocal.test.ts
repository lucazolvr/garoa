import { describe, expect, it } from 'vitest';
import relogioJson from '../casos/dados/0412-relogio-parado.json';
import { validarCaso } from '../casos/validar';
import { CHAVE_PRIVADO, RepositorioLocal, chaveCaso, type Armazenamento } from './repositorioLocal';

const relogio = validarCaso(relogioJson).caso!;
const AGORA = 1_800_000_000_000;

class Memoria implements Armazenamento {
  dados = new Map<string, string>();
  getItem = (k: string) => this.dados.get(k) ?? null;
  setItem = (k: string, v: string) => void this.dados.set(k, v);
  removeItem = (k: string) => void this.dados.delete(k);
}

const novoRepo = (mem: Armazenamento) => {
  let n = 0;
  return new RepositorioLocal(mem, [relogio], () => AGORA, () => `id${++n}`);
};

describe('RepositorioLocal', () => {
  it('semeia o caso com os detetives simulados na primeira visita', () => {
    const repo = novoRepo(new Memoria());
    const eventos = repo.eventos('0412');
    expect(eventos).toHaveLength(relogio.coopSimulado.eventos.length);
    expect(eventos[0]).toMatchObject({ autor: 'sgt.moreira', em: AGORA - 4320 * 60_000 });
    expect(repo.eventos('0412')).toBe(eventos); // mesma referência até mudar
  });

  it('grava eventos e outro repositório lê o mesmo estado', async () => {
    const mem = new Memoria();
    const repo = novoRepo(mem);
    let avisado = 0;
    repo.assinar(() => avisado++);
    await repo.registrar('0412', { tipo: 'examinou', ancora: 'mesa' }, 'lucas');
    expect(avisado).toBe(1);
    expect(repo.versao()).toBe(1);
    const outro = novoRepo(mem);
    expect(outro.eventos('0412').at(-1)).toMatchObject({ tipo: 'examinou', ancora: 'mesa', autor: 'lucas', em: AGORA });
  });

  it('descarta dados corrompidos, avisa e semeia de novo', () => {
    const mem = new Memoria();
    mem.setItem(chaveCaso('0412'), '{isso não é json');
    const repo = novoRepo(mem);
    expect(repo.eventos('0412')).toHaveLength(relogio.coopSimulado.eventos.length);
    expect(repo.retirarAvisos()).toEqual(['Os dados do caso #0412 estavam corrompidos ou numa versão antiga e foram descartados.']);
    expect(repo.retirarAvisos()).toEqual([]);
  });

  it('descarta formato de versão antiga', () => {
    const mem = new Memoria();
    mem.setItem(chaveCaso('0412'), JSON.stringify({ versao: 0, eventos: [] }));
    mem.setItem(CHAVE_PRIVADO, JSON.stringify({ versao: 0, nome: 'antigo' }));
    const repo = novoRepo(mem);
    repo.eventos('0412');
    expect(repo.privado()).toEqual({ versao: 1, casos: {} });
    expect(repo.retirarAvisos()).toHaveLength(2);
  });

  it('guarda o perfil e as acusações no estado privado', async () => {
    const mem = new Memoria();
    await novoRepo(mem).atualizarPrivado((p) => ({ ...p, perfil: { handle: 'lucas', visual: 'vega', desde: AGORA } }));
    expect(novoRepo(mem).privado().perfil).toEqual({ handle: 'lucas', visual: 'vega', desde: AGORA });
  });

  it('avisa quando o navegador não deixa salvar', async () => {
    const mem = new Memoria();
    const repo = novoRepo(mem);
    repo.eventos('0412');
    mem.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    await repo.registrar('0412', { tipo: 'examinou', ancora: 'mesa' }, 'lucas');
    expect(repo.retirarAvisos()[0]).toMatch(/Não foi possível salvar/);
    expect(repo.eventos('0412').at(-1)).toMatchObject({ ancora: 'mesa' }); // segue na memória
  });
});
