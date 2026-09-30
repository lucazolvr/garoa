// A única porta para os dados. As telas nunca tocam no armazenamento direto:
// no marco 1 isto é o localStorage; no marco 2, o Supabase (mesma interface).
import type { DadosEvento, Evento } from '../casos/esquema';
import type { EstadoPrivado } from '../jogo/privado';

export interface Repositorio {
  /** Eventos do caso (compartilhados entre detetives). Mesma referência até mudar. */
  eventos(casoId: string): readonly Evento[];
  registrar(casoId: string, dados: DadosEvento, autor: string): Promise<Evento>;

  /** Perfil e acusações do jogador (privados). */
  privado(): EstadoPrivado;
  atualizarPrivado(mudar: (p: EstadoPrivado) => EstadoPrivado): Promise<void>;

  /** Número que muda a cada alteração; as telas se assinam para redesenhar. */
  versao(): number;
  assinar(ouvinte: () => void): () => void;

  /** Avisos sobre dados descartados ou não salvos (cada aviso é entregue uma vez). */
  retirarAvisos(): string[];
}
