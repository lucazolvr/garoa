import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { carregarCasos } from './casos/carregar';
import { RepositorioLocal } from './dados/repositorioLocal';
import { App } from './App';
import './estilos/garoa.css';

const casos = carregarCasos();
const repo = new RepositorioLocal(window.localStorage, casos);
// Outra aba jogou: atualiza esta também.
window.addEventListener('storage', (e) => repo.aoMudarFora(e.key));

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App repo={repo} casos={casos} />
  </StrictMode>,
);
