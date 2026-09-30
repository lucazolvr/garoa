// Hooks que as telas usam para ler e mudar o jogo. Tudo passa pelo Repositorio.
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import type { Caso, DadosEvento } from '../casos/esquema';
import { COR_JOGADOR, DETETIVES_SIMULADOS, VISUAIS_JOGADOR, type Detetive } from '../casos/catalogo';
import { checarEvento, derivarEstado, type EstadoCaso } from '../jogo/estado';
import { casoPrivadoVazio, type CasoPrivado, type EstadoPrivado } from '../jogo/privado';
import { registrarAcusacao, type Acusacao } from '../jogo/regras';
import { xpNoCaso, xpResolucao } from '../jogo/xp';
import type { Repositorio } from './repositorio';

interface Valor {
  repo: Repositorio;
  casos: Caso[];
}
const Contexto = createContext<Valor | null>(null);

export function ProvedorJogo({ repo, casos, children }: Valor & { children: ReactNode }) {
  const valor = useMemo(() => ({ repo, casos }), [repo, casos]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

function useValor() {
  const v = useContext(Contexto);
  if (!v) throw new Error('ProvedorJogo ausente');
  return v;
}

/** Redesenha quando qualquer dado muda. */
function useVersao() {
  const { repo } = useValor();
  const assinar = useCallback((cb: () => void) => repo.assinar(cb), [repo]);
  return useSyncExternalStore(assinar, () => repo.versao());
}

export const useRepositorio = () => useValor().repo;
export const useCasos = () => useValor().casos;
export const useCaso = (id?: string) => useValor().casos.find((c) => c.id === id);

export function useEstadoCaso(caso: Caso): EstadoCaso {
  const { repo } = useValor();
  const versao = useVersao();
  const eventos = useMemo(() => repo.eventos(caso.id), [repo, caso.id, versao]);
  return useMemo(() => derivarEstado(caso, eventos), [caso, eventos]);
}

/** Estado de todos os casos (mapa e perfil). */
export function useEstadosCasos(): Map<string, EstadoCaso> {
  const { repo, casos } = useValor();
  const versao = useVersao();
  return useMemo(() => new Map(casos.map((c) => [c.id, derivarEstado(c, repo.eventos(c.id))])), [repo, casos, versao]);
}

export function usePrivado(): EstadoPrivado {
  const { repo } = useValor();
  const versao = useVersao();
  return useMemo(() => repo.privado(), [repo, versao]);
}

export function useCasoPrivado(casoId: string): CasoPrivado {
  return usePrivado().casos[casoId] ?? casoPrivadoVazio();
}

const DESCONHECIDO: Detetive = {
  handle: '?',
  cor: '#9e9fc9',
  aparencia: { pele: 'media', cabelo: 'curto', corCabelo: 'void', chapeu: 'dusk', casaco: 'dusk', camisa: 'paper2' },
};

/** Quem é quem: detetives simulados e o próprio jogador. */
export function useDetetives() {
  const perfil = usePrivado().perfil;
  return useCallback(
    (handle: string): Detetive => {
      if (perfil && handle === perfil.handle) return { handle, cor: COR_JOGADOR, aparencia: VISUAIS_JOGADOR[perfil.visual] };
      return DETETIVES_SIMULADOS[handle] ?? { ...DESCONHECIDO, handle };
    },
    [perfil],
  );
}

export function useJogador(): Detetive | null {
  const perfil = usePrivado().perfil;
  return perfil ? { handle: perfil.handle, cor: COR_JOGADOR, aparencia: VISUAIS_JOGADOR[perfil.visual] } : null;
}

/** XP total do jogador: ações em todos os casos + bônus de resolução. */
export function useXpTotal(): number {
  const eu = useJogador();
  const casos = useCasos();
  const privado = usePrivado();
  const estados = useEstadosCasos();
  if (!eu) return 0;
  return casos.reduce((soma, c) => soma + xpNoCaso(estados.get(c.id)!, eu.handle) + xpResolucao(c, privado.casos[c.id]), 0);
}

export function useAcoes() {
  const { repo } = useValor();
  const handle = usePrivado().perfil?.handle;
  return useMemo(
    () => ({
      /** Registra uma ação no caso. Devolve o motivo se ela não puder acontecer. */
      registrar(caso: Caso, dados: DadosEvento): string | null {
        if (!handle) return 'Crie seu detetive primeiro.';
        const erro = checarEvento(caso, derivarEstado(caso, repo.eventos(caso.id)), dados, handle);
        if (erro) return erro;
        void repo.registrar(caso.id, dados, handle);
        return null;
      },
      acusar(caso: Caso, a: Acusacao): CasoPrivado {
        const atual = repo.privado().casos[caso.id] ?? casoPrivadoVazio();
        const novo = registrarAcusacao(caso, atual, a, Date.now());
        void repo.atualizarPrivado((p) => ({ ...p, casos: { ...p.casos, [caso.id]: novo } }));
        return novo;
      },
      criarPerfil(novoHandle: string, visual: string) {
        void repo.atualizarPrivado((p) => ({ ...p, perfil: { handle: novoHandle, visual, desde: Date.now() } }));
      },
    }),
    [repo, handle],
  );
}
