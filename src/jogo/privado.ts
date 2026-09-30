// Estado privado do jogador: perfil e acusações. A acusação é selada: no marco 2
// continua só do jogador, enquanto o estado do caso passa a ser compartilhado.
import { z } from 'zod';
import { HANDLES_SIMULADOS, VISUAIS_JOGADOR } from '../casos/catalogo';

export const Perfil = z.object({
  handle: z.string(),
  visual: z.enum(Object.keys(VISUAIS_JOGADOR) as [string, ...string[]]),
  desde: z.number(),
});
export type Perfil = z.infer<typeof Perfil>;

export const Tentativa = z.object({
  suspeito: z.string(),
  motivo: z.string(),
  evidencia: z.string(),
  acertos: z.int().min(0).max(3),
  em: z.number(),
});
export type Tentativa = z.infer<typeof Tentativa>;

export const CasoPrivado = z.object({
  tentativas: z.array(Tentativa).default([]),
  status: z.enum(['aberto', 'resolvido', 'encerrado']).default('aberto'),
  fechadoEm: z.number().optional(),
});
export type CasoPrivado = z.infer<typeof CasoPrivado>;

export const EstadoPrivado = z.object({
  versao: z.literal(1),
  perfil: Perfil.optional(),
  casos: z.record(z.string(), CasoPrivado).default({}),
});
export type EstadoPrivado = z.infer<typeof EstadoPrivado>;

export const privadoVazio = (): EstadoPrivado => ({ versao: 1, casos: {} });
export const casoPrivadoVazio = (): CasoPrivado => ({ tentativas: [], status: 'aberto' });

/** Problema com o nome de detetive escolhido, ou null se estiver bom. */
export function checarHandle(handle: string): string | null {
  if (!/^[a-z0-9_.]{3,16}$/.test(handle)) return 'Use de 3 a 16 letras minúsculas, números, ponto ou _.';
  if ((HANDLES_SIMULADOS as readonly string[]).includes(handle)) return 'Esse nome já pertence a outro detetive.';
  return null;
}
