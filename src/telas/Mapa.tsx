// 01 Mapa da cidade: hub com os casos, o mapa animado e a atividade da equipe.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import mapaUrl from '../arte/assets/mapa-cidade.png';
import { MAPA_GAROA } from '../arte/mapa-camadas.js';
import { live } from '../arte/pixel.js';
import { icone, marcador } from '../arte/sprites';
import { DETETIVES_SIMULADOS } from '../casos/catalogo';
import type { Caso } from '../casos/esquema';
import { useCasos, useDetetives, useEstadosCasos, useJogador, usePrivado } from '../dados/contexto';
import { diario, type LinhaDiario } from '../jogo/diario';
import type { EstadoCaso } from '../jogo/estado';
import type { CasoPrivado } from '../jogo/privado';
import { detetivesNoCaso, progresso, statusNoMapa, type StatusMapa } from '../jogo/regras';
import { Barra, Botao, Painel, Rosto, Selo } from '../ui/base';
import { useEmBreve } from '../ui/Avisos';
import { tempoRelativo } from '../ui/formatar';
import { Palco } from '../ui/Palco';
import { STATUS, rotuloStatus } from '../ui/status';
import { TopoCompleto } from '../ui/Topo';
import './mapa.css';

interface InfoCaso {
  caso: Caso;
  estado: EstadoCaso;
  status: StatusMapa;
  cp?: CasoPrivado;
}

const ORDEM: Record<StatusMapa, number> = { alerta: 0, andamento: 1, novo: 2, resolvido: 3 };

/** Onde os detetives simulados aparecem andando pela cidade. */
const NA_RUA: { handle: string; x: number; y: number; ausente?: boolean; etiqueta?: [number, number] }[] = [
  { handle: 'lupa_ana', x: 400, y: 424, etiqueta: [380, 470] },
  { handle: 'caju', x: 444, y: 432 },
  { handle: 'sgt.moreira', x: 876, y: 338 },
  { handle: 'nevoeiro', x: 180, y: 40, ausente: true },
];

export default function Mapa() {
  const casos = useCasos();
  const estados = useEstadosCasos();
  const privado = usePrivado();
  const eu = useJogador();
  const navegar = useNavigate();
  const emBreve = useEmBreve();
  const [params] = useSearchParams();

  const info: InfoCaso[] = useMemo(
    () =>
      casos
        .map((caso) => {
          const estado = estados.get(caso.id)!;
          const cp = privado.casos[caso.id];
          return { caso, estado, cp, status: statusNoMapa(caso, estado, cp) };
        })
        .sort((a, b) => ORDEM[a.status] - ORDEM[b.status] || a.caso.id.localeCompare(b.caso.id)),
    [casos, estados, privado],
  );
  const [selId, setSelId] = useState(() => info[0]?.caso.id);
  const sel = info.find((i) => i.caso.id === selId) ?? info[0];

  // Camadas vivas: chuva, carros, pedestres, luzes. Marcadores com data-bob balançam.
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => live(canvas.current, { src: mapaUrl, map: MAPA_GAROA }), []);

  const { relogio, online } = useCidadeViva();

  return (
    <Palco altura={896}>
      <TopoCompleto aba="mapa">
        <label className="campo mapa-busca">
          <img src={icone('lupa')} alt="" />
          <input type="search" placeholder="Buscar caso, bairro ou suspeito…" aria-label="Buscar" onFocus={emBreve} />
        </label>
        <Botao variante="primario" onClick={emBreve}>
          + ABRIR CASO
        </Botao>
      </TopoCompleto>

      <div className="mapa-corpo">
        <main className="mapa" data-camadas={params.has('raiox') ? '1' : '0'}>
          <img className="mapa-arte" src={mapaUrl} alt="Mapa da cidade de Garoa" />
          <canvas className="mapa-arte mapa-vivo" ref={canvas} />

          <div className="bairro" style={{ left: 640, top: 232 }}>ALTO DOS VIDROS</div>
          <div className="bairro" style={{ left: 620, top: 492 }}>CENTRO LUZ</div>
          <div className="bairro" style={{ left: 20, top: 660 }}>CAIS VELHO</div>

          {info.map(({ caso, status }) => (
            <MarcadorCaso key={caso.id} caso={caso} status={status} selecionado={caso.id === sel?.caso.id} aoEscolher={() => setSelId(caso.id)} />
          ))}

          {NA_RUA.map((p) => (
            <PinoDetetive key={p.handle} handle={p.handle} x={p.x} y={p.y} ausente={p.ausente} etiqueta={p.etiqueta} />
          ))}
          {eu && (
            <>
              <div className="pino" style={{ left: 236, top: 592, '--cor': 'var(--amber)' } as CSSProperties}>
                <Rosto aparencia={eu.aparencia} tamanho={24} borda={4} corBorda="var(--amber)" />
                <div className="pino-haste" />
              </div>
              <div className="etiqueta" style={{ left: 234, top: 572, '--cor': 'var(--amber)' } as CSSProperties}>
                VOCÊ
              </div>
            </>
          )}

          {sel && <CartaoCaso info={sel} aoEntrar={() => navegar(`/caso/${sel.caso.id}`)} />}

          <div className="zoom">
            <button onClick={emBreve} aria-label="Aproximar">+</button>
            <button onClick={emBreve} aria-label="Afastar">−</button>
          </div>

          <div className="clima">
            <span className="clima-luz" />
            CHUVA · {relogio} · {online} DETETIVES NA RUA
          </div>

          <aside className="painel painel-sombra legenda">
            <div className="painel-titulo">LEGENDA</div>
            <div className="legenda-itens">
              {(['novo', 'andamento', 'resolvido', 'alerta'] as const).map((s) => (
                <span key={s} style={{ display: 'contents' }}>
                  <img src={marcador(s)} alt="" />
                  <span style={s === 'alerta' ? { color: 'var(--red)' } : undefined}>{s === 'alerta' ? 'URGENTE / PISTA NOVA' : s === 'novo' ? 'CASO NOVO' : STATUS[s].rotulo}</span>
                </span>
              ))}
            </div>
          </aside>
        </main>

        <aside className="mapa-lateral">
          <Painel titulo="CASOS EM DESTAQUE">
            <ul className="destaques">
              {info.map((i) => (
                <Destaque key={i.caso.id} info={i} aoAbrir={() => navegar(`/caso/${i.caso.id}`)} />
              ))}
            </ul>
          </Painel>
          <Atividade info={info} />
        </aside>
      </div>
    </Palco>
  );
}

/** Relógio do jogo (1 min a cada 20 s) e contagem de detetives online (simulada). */
function useCidadeViva() {
  const [min, setMin] = useState(14);
  const [n, setN] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setMin((m) => (m + 1) % 60), 20_000);
    const b = setInterval(() => setN((x) => x + 1), 6500);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);
  return { relogio: `23:${String(min).padStart(2, '0')}`, online: 11 + ((n * 7) % 5) };
}

function MarcadorCaso({ caso, status, selecionado, aoEscolher }: { caso: Caso; status: StatusMapa; selecionado: boolean; aoEscolher: () => void }) {
  const { x, y } = caso.mapa;
  return (
    <>
      {selecionado && <div className="marcador-selecao" style={{ left: x - 8, top: y - 8 }} />}
      <button
        className="marcador"
        data-bob
        style={{ left: x, top: y }}
        onClick={aoEscolher}
        aria-pressed={selecionado}
        aria-label={`Caso #${caso.id}, ${caso.titulo}: ${STATUS[status].rotulo.toLowerCase()}`}
      >
        <img src={marcador(status)} alt="" />
      </button>
    </>
  );
}

function PinoDetetive({ handle, x, y, ausente, etiqueta }: { handle: string; x: number; y: number; ausente?: boolean; etiqueta?: [number, number] }) {
  const d = DETETIVES_SIMULADOS[handle];
  const estilo = { '--cor': d.cor } as CSSProperties;
  return (
    <>
      <div className={`pino ${ausente ? 'pino-ausente' : ''}`} style={{ left: x, top: y, ...estilo }} title={`@${handle}`}>
        <Rosto aparencia={d.aparencia} tamanho={24} borda={4} corBorda={d.cor} />
        <div className="pino-haste" />
      </div>
      {etiqueta && (
        <div className="etiqueta" style={{ left: etiqueta[0], top: etiqueta[1], ...estilo }}>
          {handle.toUpperCase()}
        </div>
      )}
    </>
  );
}

function CartaoCaso({ info, aoEntrar }: { info: InfoCaso; aoEntrar: () => void }) {
  const { caso, estado, status, cp } = info;
  const detetive = useDetetives();
  const emBreve = useEmBreve();
  const equipe = detetivesNoCaso(caso, estado);
  const pct = progresso(caso, estado) * 100;
  return (
    <section className="painel painel-sombra cartao-caso" aria-label="Caso selecionado">
      <div className="cartao-caso-topo">
        <span className="cartao-caso-num">CASO #{caso.id}</span>
        <Selo cor={STATUS[status].cor}>{rotuloStatus(status, cp)}</Selo>
      </div>
      <div className="cartao-caso-corpo">
        <h2 className="cartao-caso-titulo">{caso.titulo}</h2>
        <p className="cartao-caso-resumo texto">{caso.resumo}</p>
        <div className="cartao-caso-equipe">
          {equipe.length ? (
            <>
              <div>
                {equipe.slice(0, 3).map((p) => (
                  <Rosto key={p.handle} aparencia={detetive(p.handle).aparencia} tamanho={32} alt={`@${p.handle}`} />
                ))}
              </div>
              <span>
                {equipe.length > 3 ? `+${equipe.length - 3} · ` : ''}
                {equipe.length} {equipe.length === 1 ? 'DETETIVE' : 'DETETIVES'}
              </span>
            </>
          ) : (
            <span>NINGUÉM NA CENA AINDA</span>
          )}
        </div>
        <Barra pct={pct} rotulo="Progresso da investigação" />
        <div className="cartao-caso-acoes">
          <Botao variante="primario" onClick={aoEntrar} style={{ flex: 1 }}>
            ENTRAR NO CASO
          </Botao>
          <Botao onClick={emBreve}>SEGUIR</Botao>
        </div>
      </div>
    </section>
  );
}

function notaDestaque({ caso, estado, cp }: InfoCaso): string {
  if (cp?.status === 'resolvido') return 'Você resolveu este caso.';
  if (cp?.status === 'encerrado') return 'Suas tentativas acabaram. A solução está no arquivo.';
  const pausa = [...estado.pausas.entries()].sort((a, b) => b[1].em - a[1].em)[0];
  if (pausa) {
    const nome = caso.suspeitos.find((s) => s.id === pausa[0])?.nome;
    return `@${pausa[1].autor} parou no interrogatório de ${nome}. Continue daí.`;
  }
  if (!estado.eventos.length) return 'Ninguém entrou na cena ainda. Seja o primeiro a investigar.';
  const ultima = diario(caso, estado).at(-1)!;
  return `@${ultima.autor} ${ultima.verbo}${ultima.obj ? ` ${ultima.obj}` : ''}.`;
}

function Destaque({ info, aoAbrir }: { info: InfoCaso; aoAbrir: () => void }) {
  const { caso, status, estado, cp } = info;
  const cor = STATUS[status].cor;
  return (
    <li>
      <button className="destaque" onClick={aoAbrir}>
        <span className="destaque-topo">
          <span className="destaque-local">
            #{caso.id} · {caso.bairro}
          </span>
          <Selo cor={cor}>{rotuloStatus(status, cp)}</Selo>
        </span>
        <span className="destaque-titulo">{caso.titulo}</span>
        <span className="destaque-nota texto">{notaDestaque(info)}</span>
        <Barra pct={progresso(caso, estado) * 100} cor={cor} altura={8} segmento={16} fundo="var(--ink)" />
      </button>
    </li>
  );
}

function Atividade({ info }: { info: InfoCaso[] }) {
  const detetive = useDetetives();
  const emBreve = useEmBreve();
  const linhas: LinhaDiario[] = useMemo(
    () =>
      info
        .flatMap((i) => diario(i.caso, i.estado))
        .sort((a, b) => b.em - a.em)
        .slice(0, 4),
    [info],
  );

  // Destaca por 1,8 s a linha que acabou de chegar.
  const [nova, setNova] = useState<string | null>(null);
  const primeira = useRef(linhas[0]?.id);
  useEffect(() => {
    if (!linhas[0] || linhas[0].id === primeira.current) return;
    primeira.current = linhas[0].id;
    setNova(linhas[0].id);
    const t = setTimeout(() => setNova(null), 1800);
    return () => clearTimeout(t);
  }, [linhas]);

  return (
    <Painel
      titulo="ATIVIDADE RECENTE"
      className="atividade"
      extra={
        <button className="ver-tudo" onClick={emBreve}>
          VER TUDO ▸
        </button>
      }
    >
      <ul className="feed" aria-live="polite">
        {linhas.map((l) => {
          const d = detetive(l.autor);
          return (
            <li key={l.id} className={`feed-item ${l.id === nova ? 'novo' : ''}`}>
              <Rosto aparencia={d.aparencia} tamanho={40} />
              <div className="feed-texto">
                <p className="feed-frase texto">
                  <span className="feed-quem" style={{ color: d.cor }}>
                    @{l.autor}
                  </span>{' '}
                  {l.verbo} {l.obj && <span className="feed-obj">{l.obj}</span>}
                </p>
                <span className="feed-meta">
                  #{l.casoId} · {tempoRelativo(l.em)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Painel>
  );
}
