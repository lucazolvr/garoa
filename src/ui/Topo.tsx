// Barra do topo: versão completa (mapa, caso) e compacta com trilha (demais telas).
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useJogador } from '../dados/contexto';
import { icone } from '../arte/sprites';
import { Rosto } from './base';
import { useEmBreve } from './Avisos';

function Eu() {
  const eu = useJogador();
  if (!eu) return null;
  return (
    <Link to="/perfil" className="topo-eu" aria-label="Seu perfil" title={`@${eu.handle}`}>
      <Rosto aparencia={eu.aparencia} tamanho={40} borda={0} />
    </Link>
  );
}

export function TopoCompleto({ aba, children }: { aba?: 'mapa' | 'casos'; children?: ReactNode }) {
  const emBreve = useEmBreve();
  return (
    <header className="topo">
      <Link to="/" className="marca">
        <img src={icone('lupa')} alt="" />
        <span>
          <span className="marca-nome">GAROA</span>
          <span className="marca-sub">DETETIVES EM REDE</span>
        </span>
      </Link>
      <nav className="abas">
        <Link to="/" className="aba" aria-current={aba === 'mapa' ? 'page' : undefined}>
          MAPA
        </Link>
        <button className="aba" onClick={emBreve} aria-current={aba === 'casos' ? 'page' : undefined}>
          MEUS CASOS
        </button>
        <button className="aba" onClick={emBreve}>
          QUADROS
        </button>
        <button className="aba" onClick={emBreve}>
          ARQUIVO
        </button>
      </nav>
      <div className="topo-direita">
        {children}
        <Eu />
      </div>
    </header>
  );
}

export function TopoTrilha({ trilha, children }: { trilha: { rotulo: string; para?: string }[]; children?: ReactNode }) {
  return (
    <header className="topo topo-compacto">
      <Link to="/" className="marca">
        <img src={icone('lupa')} alt="" />
        <span className="marca-nome">GAROA</span>
      </Link>
      <nav className="trilha" aria-label="Você está em">
        {trilha.map((t) => (
          <Fragment key={t.rotulo}>
            <span aria-hidden>▸</span>
            {t.para ? <Link to={t.para}>{t.rotulo}</Link> : <span>{t.rotulo}</span>}
          </Fragment>
        ))}
      </nav>
      <div className="topo-direita">
        {children}
        <Eu />
      </div>
    </header>
  );
}
