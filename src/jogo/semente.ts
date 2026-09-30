// Transforma o coopSimulado do arquivo do caso em eventos datados a partir de "agora"
// (a primeira visita do jogador). No marco 2 esses eventos vêm de jogadores reais.
import type { Caso, Evento } from '../casos/esquema';

export function eventosSimulados(caso: Caso, agora: number): Evento[] {
  return caso.coopSimulado.eventos.map((e, i) => {
    const { minutosAtras, ...dados } = e;
    return { ...dados, id: `sim-${caso.id}-${i}`, em: agora - minutosAtras * 60_000 } as Evento;
  });
}
