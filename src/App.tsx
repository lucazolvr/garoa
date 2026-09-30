import type { ReactNode } from 'react';
import { HashRouter, Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import type { Caso } from './casos/esquema';
import { ProvedorJogo, useCaso, usePrivado } from './dados/contexto';
import type { Repositorio } from './dados/repositorio';
import { ProvedorAvisos } from './ui/Avisos';
import { BoasVindas } from './ui/BoasVindas';
import Mapa from './telas/Mapa';
import CasoPagina from './telas/Caso';
import Interrogatorio from './telas/Interrogatorio';
import Quadro from './telas/Quadro';
import Acusacao from './telas/Acusacao';
import Perfil from './telas/Perfil';

export function App({ repo, casos }: { repo: Repositorio; casos: Caso[] }) {
  return (
    <ProvedorJogo repo={repo} casos={casos}>
      <ProvedorAvisos>
        <HashRouter>
          <Rotas />
        </HashRouter>
      </ProvedorAvisos>
    </ProvedorJogo>
  );
}

function Rotas() {
  const perfil = usePrivado().perfil;
  return (
    <>
      <Routes>
        <Route path="/" element={<Mapa />} />
        <Route path="/caso/:id" element={<ComCaso tela={CasoPagina} />} />
        <Route path="/caso/:id/interrogatorio/:suspeito" element={<ComCaso tela={Interrogatorio} />} />
        <Route path="/caso/:id/quadro" element={<ComCaso tela={Quadro} />} />
        <Route path="/caso/:id/acusacao" element={<ComCaso tela={Acusacao} />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!perfil && <BoasVindas />}
    </>
  );
}

/** Resolve o :id da rota; caso inexistente vira uma página de aviso. */
function ComCaso({ tela: Tela }: { tela: (p: { caso: Caso }) => ReactNode }) {
  const { id } = useParams();
  const caso = useCaso(id);
  if (!caso) {
    return (
      <div style={{ padding: 48, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <h1 style={{ fontSize: 32, color: 'var(--amber)' }}>CASO #{id} NÃO ENCONTRADO</h1>
        <p className="texto">Esse arquivo não está na delegacia. Talvez tenha sido arquivado ou o número esteja errado.</p>
        <Link to="/">◂ VOLTAR AO MAPA</Link>
      </div>
    );
  }
  return <Tela key={caso.id} caso={caso} />;
}
