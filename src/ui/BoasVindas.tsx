// Primeira visita: nome de detetive e visual. Perfil local, sem senha (marco 1).
import { useState, type FormEvent } from 'react';
import { VISUAIS_JOGADOR } from '../casos/catalogo';
import { useAcoes } from '../dados/contexto';
import { checarHandle } from '../jogo/privado';
import { Botao, Rosto } from './base';
import { createPortal } from 'react-dom';

export function BoasVindas() {
  const { criarPerfil } = useAcoes();
  const [handle, setHandle] = useState('');
  const [visual, setVisual] = useState('vega');
  const [tentou, setTentou] = useState(false);
  const erro = checarHandle(handle);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setTentou(true);
    if (!erro) criarPerfil(handle, visual);
  };

  return createPortal(
    <div className="janela-fundo">
      <form className="janela painel painel-sombra" role="dialog" aria-modal="true" aria-labelledby="bv-titulo" onSubmit={enviar} style={{ width: 'min(560px, 100%)' }}>
        <div className="painel-titulo">
          <h2 id="bv-titulo" style={{ font: 'inherit' }}>
            BOAS-VINDAS À GAROA
          </h2>
        </div>
        <div className="janela-corpo">
          <p className="texto" style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--paper2)' }}>
            Chove na cidade e há casos esperando. Outros detetives já começaram: você continua de onde eles pararam. Deixe pistas, conexões e teorias. Nunca a resposta.
          </p>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="rotulo">NOME DE DETETIVE</span>
            <span className="campo">
              <span style={{ color: 'var(--fog)' }}>@</span>
              <input value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase())} maxLength={16} placeholder="seu_nome" autoComplete="off" aria-invalid={tentou && !!erro} aria-describedby="bv-erro" />
            </span>
            <span id="bv-erro" className="texto" style={{ fontSize: 13, color: tentou && erro ? 'var(--red)' : 'var(--fog)' }}>
              {tentou && erro ? erro : '3 a 16 caracteres: letras minúsculas, números, ponto ou _.'}
            </span>
          </label>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <legend className="rotulo" style={{ marginBottom: 8 }}>
              SEU RETRATO
            </legend>
            <div style={{ display: 'flex', gap: 12 }}>
              {Object.entries(VISUAIS_JOGADOR).map(([id, a]) => (
                <label key={id} style={{ cursor: 'pointer' }}>
                  <input type="radio" name="visual" value={id} checked={visual === id} onChange={() => setVisual(id)} className="sr" />
                  <Rosto aparencia={a} tamanho={80} borda={4} corBorda={visual === id ? 'var(--amber)' : 'var(--deep)'} alt={id} />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="janela-acoes">
            <Botao variante="primario" type="submit">
              ENTRAR NA CIDADE ▸
            </Botao>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}
