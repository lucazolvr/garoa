import type { StatusMapa } from '../jogo/regras';
import type { CasoPrivado } from '../jogo/privado';

export const STATUS: Record<StatusMapa, { rotulo: string; cor: string }> = {
  novo: { rotulo: 'NOVO', cor: 'var(--amber)' },
  andamento: { rotulo: 'EM ANDAMENTO', cor: 'var(--teal)' },
  resolvido: { rotulo: 'RESOLVIDO', cor: 'var(--fog)' },
  alerta: { rotulo: 'URGENTE', cor: 'var(--red)' },
};

/** Rótulo do selo: "ARQUIVADO" quando o jogador esgotou as tentativas. */
export const rotuloStatus = (s: StatusMapa, cp?: CasoPrivado) => (cp?.status === 'encerrado' ? 'ARQUIVADO' : STATUS[s].rotulo);
