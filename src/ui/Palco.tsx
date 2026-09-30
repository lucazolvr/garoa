// As telas são desenhadas a 1440px de largura (como no design) e ampliadas ou
// reduzidas com CSS zoom. Com `altura`, a tela inteira cabe na janela; sem, rola.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const LARGURA = 1440;
const ContextoZoom = createContext(1);
/** Fator de zoom atual: para converter coordenadas do ponteiro em px do design. */
export const useZoom = () => useContext(ContextoZoom);

function calcular(altura?: number) {
  const porLargura = window.innerWidth / LARGURA;
  return altura ? Math.min(porLargura, window.innerHeight / altura) : porLargura;
}

export function Palco({ altura, children }: { altura?: number; children: ReactNode }) {
  const [zoom, setZoom] = useState(() => calcular(altura));
  useEffect(() => {
    const aoRedimensionar = () => setZoom(calcular(altura));
    aoRedimensionar();
    window.addEventListener('resize', aoRedimensionar);
    return () => window.removeEventListener('resize', aoRedimensionar);
  }, [altura]);

  const tela = (
    <ContextoZoom.Provider value={zoom}>
      <div className="tela" style={{ zoom, height: altura, minHeight: altura ? undefined : `calc(100vh / ${zoom})` }}>
        {children}
      </div>
    </ContextoZoom.Provider>
  );
  return <div className={altura ? 'palco-caber' : 'palco-largura'}>{tela}</div>;
}
