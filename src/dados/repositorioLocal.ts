// Repositório do marco 1: tudo no localStorage do navegador.
import { z } from 'zod';
import { Evento, type Caso, type DadosEvento } from '../casos/esquema';
import { EstadoPrivado, privadoVazio } from '../jogo/privado';
import { eventosSimulados } from '../jogo/semente';
import type { Repositorio } from './repositorio';

export interface Armazenamento {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
  removeItem(chave: string): void;
}

const PREFIXO = 'garoa:';
export const chaveCaso = (id: string) => `${PREFIXO}caso:${id}`;
export const CHAVE_PRIVADO = `${PREFIXO}privado`;

const CasoGuardado = z.object({ versao: z.literal(1), criadoEm: z.number(), eventos: z.array(Evento) });

export class RepositorioLocal implements Repositorio {
  private cache = new Map<string, readonly Evento[]>();
  private cachePrivado?: EstadoPrivado;
  private ouvintes = new Set<() => void>();
  private avisos: string[] = [];
  private _versao = 0;

  constructor(
    private armazenamento: Armazenamento,
    private casos: readonly Caso[],
    private agora: () => number = Date.now,
    private novoId: () => string = () => crypto.randomUUID(),
  ) {}

  eventos(casoId: string): readonly Evento[] {
    let eventos = this.cache.get(casoId);
    if (!eventos) {
      eventos = this.carregarCaso(casoId);
      this.cache.set(casoId, eventos);
    }
    return eventos;
  }

  async registrar(casoId: string, dados: DadosEvento, autor: string): Promise<Evento> {
    const evento = { ...dados, id: this.novoId(), autor, em: this.agora() } as Evento;
    const eventos = [...this.eventos(casoId), evento];
    this.cache.set(casoId, eventos);
    this.gravar(chaveCaso(casoId), { versao: 1, criadoEm: this.criadoEm(casoId), eventos });
    this.emitir();
    return evento;
  }

  privado(): EstadoPrivado {
    if (!this.cachePrivado) {
      const r = this.ler(CHAVE_PRIVADO, EstadoPrivado, 'Seu perfil salvo');
      this.cachePrivado = r ?? privadoVazio();
    }
    return this.cachePrivado;
  }

  async atualizarPrivado(mudar: (p: EstadoPrivado) => EstadoPrivado): Promise<void> {
    this.cachePrivado = mudar(this.privado());
    this.gravar(CHAVE_PRIVADO, this.cachePrivado);
    this.emitir();
  }

  versao() {
    return this._versao;
  }

  assinar(ouvinte: () => void) {
    this.ouvintes.add(ouvinte);
    return () => {
      this.ouvintes.delete(ouvinte);
    };
  }

  retirarAvisos() {
    const a = this.avisos;
    this.avisos = [];
    return a;
  }

  /** Outra aba mudou o armazenamento: esquece o cache daquela chave. */
  aoMudarFora(chave: string | null) {
    if (chave === null) this.cache.clear(), (this.cachePrivado = undefined);
    else if (chave === CHAVE_PRIVADO) this.cachePrivado = undefined;
    else if (chave.startsWith(`${PREFIXO}caso:`)) this.cache.delete(chave.slice(`${PREFIXO}caso:`.length));
    else return;
    this.emitir();
  }

  // ---------- interno ----------

  private carregarCaso(casoId: string): readonly Evento[] {
    const guardado = this.ler(chaveCaso(casoId), CasoGuardado, `Os dados do caso #${casoId}`);
    if (guardado) return guardado.eventos;
    // Primeira visita (ou dados descartados): semeia com os detetives simulados.
    const caso = this.casos.find((c) => c.id === casoId);
    const eventos = caso ? eventosSimulados(caso, this.agora()) : [];
    this.gravar(chaveCaso(casoId), { versao: 1, criadoEm: this.agora(), eventos });
    return eventos;
  }

  private criadoEm(casoId: string): number {
    try {
      const bruto = this.armazenamento.getItem(chaveCaso(casoId));
      const r = bruto ? CasoGuardado.safeParse(JSON.parse(bruto)) : null;
      if (r?.success) return r.data.criadoEm;
    } catch {
      /* cai no padrão */
    }
    return this.agora();
  }

  /** Lê e valida; se estiver corrompido ou numa versão antiga, descarta e avisa. */
  private ler<T>(chave: string, esquema: z.ZodType<T>, oque: string): T | null {
    let bruto: string | null;
    try {
      bruto = this.armazenamento.getItem(chave);
    } catch {
      return null;
    }
    if (bruto === null) return null;
    try {
      const r = esquema.safeParse(JSON.parse(bruto));
      if (r.success) return r.data;
    } catch {
      /* JSON quebrado: trata como inválido */
    }
    this.avisos.push(`${oque} estavam corrompidos ou numa versão antiga e foram descartados.`);
    try {
      this.armazenamento.removeItem(chave);
    } catch {
      /* nada a fazer */
    }
    return null;
  }

  private gravar(chave: string, valor: unknown) {
    try {
      this.armazenamento.setItem(chave, JSON.stringify(valor));
    } catch {
      this.avisos.push('Não foi possível salvar no navegador. O progresso desta sessão pode se perder ao recarregar.');
    }
  }

  private emitir() {
    this._versao++;
    this.ouvintes.forEach((o) => o());
  }
}
