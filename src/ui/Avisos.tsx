// Avisos rápidos no rodapé ("EM BREVE", erros de regra, dados descartados).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRepositorio } from '../dados/contexto';

interface Aviso {
  id: number;
  texto: string;
  tipo: 'info' | 'erro' | 'texto';
}
const Contexto = createContext<(texto: string, tipo?: Aviso['tipo']) => void>(() => {});

export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const seq = useRef(0);
  const repo = useRepositorio();

  const avisar = useCallback((texto: string, tipo: Aviso['tipo'] = 'info') => {
    const id = ++seq.current;
    setAvisos((a) => [...a.filter((x) => x.texto !== texto), { id, texto, tipo }].slice(-3));
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), tipo === 'info' ? 2200 : 5000);
  }, []);

  // Problemas do armazenamento chegam pelo repositório.
  useEffect(() => {
    const puxar = () => repo.retirarAvisos().forEach((t) => avisar(t, 'erro'));
    puxar();
    return repo.assinar(puxar);
  }, [repo, avisar]);

  return (
    <Contexto.Provider value={avisar}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`aviso ${a.tipo === 'erro' ? 'aviso-erro aviso-texto' : a.tipo === 'texto' ? 'aviso-texto' : ''}`}>
            {a.texto}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export const useAvisar = () => useContext(Contexto);

/** Para os botões que ficam para depois do marco 1. */
export function useEmBreve() {
  const avisar = useAvisar();
  return useMemo(() => () => avisar('EM BREVE'), [avisar]);
}
