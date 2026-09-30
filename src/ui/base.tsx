// Peças do guia de estilo.
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import type { Aparencia } from '../casos/catalogo';
import { icone, retrato } from '../arte/sprites';

type Variante = 'primario' | 'secundario' | 'alerta';

export function Botao({
  variante = 'secundario',
  tamanho,
  largo,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; tamanho?: 'pequeno' | 'grande'; largo?: boolean }) {
  const classes = ['btn', variante !== 'secundario' && `btn-${variante}`, tamanho && `btn-${tamanho}`, largo && 'btn-largo', className];
  return <button type="button" {...props} className={classes.filter(Boolean).join(' ')} />;
}

export function Painel({
  titulo,
  extra,
  sombra,
  className = '',
  style,
  children,
}: {
  titulo?: ReactNode;
  extra?: ReactNode;
  sombra?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section className={`painel ${sombra ? 'painel-sombra' : ''} ${className}`} style={style}>
      {titulo && (
        <div className="painel-titulo">
          <h2 style={{ font: 'inherit' }}>{titulo}</h2>
          {extra && <small>{extra}</small>}
        </div>
      )}
      {children}
    </section>
  );
}

export const Selo = ({ cor, texto = 'var(--void)', medio, children }: { cor: string; texto?: string; medio?: boolean; children: ReactNode }) => (
  <span className={`selo ${medio ? 'selo-m' : ''}`} style={{ background: cor, color: texto }}>
    {children}
  </span>
);

export function Barra({
  pct,
  cor = 'var(--teal)',
  altura = 12,
  segmento = 20,
  fundo = 'var(--void)',
  rotulo,
}: {
  pct: number;
  cor?: string;
  altura?: number;
  segmento?: number;
  fundo?: string;
  rotulo?: string;
}) {
  const v = Math.round(Math.max(0, Math.min(100, pct)));
  return (
    <div
      className="barra"
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={rotulo}
      style={{ height: altura, '--cor': cor, '--seg': `${segmento}px`, '--fundo': fundo } as CSSProperties}
    >
      <div style={{ width: `${v}%` }} />
    </div>
  );
}

/** Rosto recortado de um retrato 32px exibido a 4×. `tamanho` é a área visível. */
export function Rosto({
  aparencia,
  tamanho,
  borda = 2,
  corBorda = 'var(--void)',
  alt = '',
  style,
}: {
  aparencia: Aparencia;
  tamanho: number;
  borda?: number;
  corBorda?: string;
  alt?: string;
  style?: CSSProperties;
}) {
  return (
    <div className="rosto" style={{ width: tamanho, height: tamanho, border: `${borda}px solid ${corBorda}`, ...style }}>
      <img src={retrato(aparencia)} alt={alt} style={{ left: tamanho / 2 - 64, top: tamanho / 2 - 60 }} />
    </div>
  );
}

/** Retrato inteiro: 128px (arte 32) ou 256px (arte 64). */
export function Retrato({ aparencia, tamanho = 128, borda = 4, alt = '', style }: { aparencia: Aparencia; tamanho?: 128 | 256; borda?: number; alt?: string; style?: CSSProperties }) {
  return (
    <img
      src={retrato(aparencia, tamanho === 256 ? 64 : 32)}
      alt={alt}
      style={{ width: tamanho, height: tamanho, border: `${borda}px solid var(--void)`, flex: 'none', display: 'block', ...style }}
    />
  );
}

export const Icone = ({ nome, tamanho = 48, alt = '', style }: { nome: string; tamanho?: number; alt?: string; style?: CSSProperties }) => (
  <img src={icone(nome)} alt={alt} width={tamanho} height={tamanho} style={{ flex: 'none', ...style }} />
);

/** Ícone de pista dentro do quadradinho de ardósia (64 ou 56). */
export const IconePista = ({ nome, caixa = 64, fundo }: { nome: string; caixa?: number; fundo?: string }) => (
  <div className="icone-quadro" style={{ width: caixa, height: caixa, background: fundo }}>
    <Icone nome={nome} tamanho={48} />
  </div>
);
