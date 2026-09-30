// Janela modal no estilo "JANELA ✕" do guia.
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Janela({ titulo, aoFechar, largura, children }: { titulo: string; aoFechar: () => void; largura?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', tecla);
    ref.current?.querySelector<HTMLElement>('input, textarea, select, button:not([aria-label="Fechar"])')?.focus();
    return () => window.removeEventListener('keydown', tecla);
  }, [aoFechar]);

  return createPortal(
    <div className="janela-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div ref={ref} className="janela painel painel-sombra" role="dialog" aria-modal="true" aria-label={titulo} style={largura ? { width: `min(${largura}px, 100%)` } : undefined}>
        <div className="painel-titulo">
          <h2 style={{ font: 'inherit' }}>{titulo}</h2>
          <button onClick={aoFechar} aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="janela-corpo">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
