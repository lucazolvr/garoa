// 03 Quadro de investigação: notas, fotos, fios e teorias, com autor em cada item.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as PE } from 'react';
import { arteFixa, cenaImagem, strings } from '../arte/sprites';
import { CENARIOS, QUADRO } from '../casos/catalogo';
import type { Caso } from '../casos/esquema';
import { useAcoes, useDetetives, useEstadoCaso, useJogador } from '../dados/contexto';
import { totalVotos, type EstadoCaso, type ItemQuadro, type Teoria } from '../jogo/estado';
import { LARGURA, alfinete, chaveFio, idDe, posicaoLivre } from '../jogo/quadro';
import { Botao, Icone, Retrato } from '../ui/base';
import { useAvisar } from '../ui/Avisos';
import { tempoRelativo } from '../ui/formatar';
import { Janela } from '../ui/Janela';
import { Palco, useZoom } from '../ui/Palco';
import { TopoTrilha } from '../ui/Topo';
import './quadro.css';

type Modal = null | 'nota' | 'foto' | 'teoria';
const EVENTOS_DE_QUADRO = new Set(['nota', 'fio', 'pista-no-quadro', 'foto-cena', 'recorte', 'teoria', 'item-movido']);

export default function Quadro({ caso }: { caso: Caso }) {
  const estado = useEstadoCaso(caso);
  const eu = useJogador();
  const detetive = useDetetives();
  const { registrar } = useAcoes();
  const avisar = useAvisar();
  const [modal, setModal] = useState<Modal>(null);
  const [modoFio, setModoFio] = useState(false);
  const [origemFio, setOrigemFio] = useState<string | null>(null);
  const [arrasto, setArrasto] = useState<{ ref: string; x: number; y: number } | null>(null);

  const acao = (...args: Parameters<typeof registrar>[1][]) => {
    for (const dados of args) {
      const erro = registrar(caso, dados);
      if (erro) return avisar(erro, 'erro'), false;
    }
    return true;
  };

  useEffect(() => {
    if (!modoFio) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && (setModoFio(false), setOrigemFio(null));
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [modoFio]);

  const itens = [...estado.itens.values()].map((i) => (arrasto?.ref === i.ref ? { ...i, x: arrasto.x, y: arrasto.y } : i));
  const posicoes = new Map(itens.map((i) => [i.ref, i]));

  const clicarItem = (ref: string) => {
    if (!modoFio) return;
    if (!origemFio) return setOrigemFio(ref);
    if (origemFio === ref) return setOrigemFio(null);
    const existente = estado.fios.get(chaveFio(origemFio, ref));
    if (existente) {
      if (acao({ tipo: 'fio-removido', de: existente.de, para: existente.para })) avisar('FIO DESFEITO');
    } else if (acao({ tipo: 'fio', de: origemFio, para: ref })) avisar('FIO LIGADO');
    setOrigemFio(null);
  };

  // Presença simulada: o último detetive (não você) que mexeu no quadro na última hora.
  const presenca = [...estado.eventos]
    .reverse()
    .find((e) => EVENTOS_DE_QUADRO.has(e.tipo) && e.autor !== eu?.handle && Date.now() - e.em < 60 * 60_000);
  const autores = [...new Set([...itens.map((i) => i.autor), ...[...estado.fios.values()].map((f) => f.autor), ...[...estado.teorias.values()].map((t) => t.autor)])].filter(
    (a): a is string => !!a,
  );

  return (
    <Palco altura={960}>
      <TopoTrilha
        trilha={[
          { rotulo: `CASO #${caso.id}`, para: `/caso/${caso.id}` },
          { rotulo: 'QUADRO' },
        ]}
      >
        {presenca && (
          <div className="presenca">
            <span className="presenca-luz" />
            AGORA NO QUADRO: <span style={{ color: detetive(presenca.autor).cor }}>@{presenca.autor.toUpperCase()}</span>
          </div>
        )}
      </TopoTrilha>

      <div className="quadro-corpo">
        <div className="quadro-coluna">
          <div className="quadro-ferramentas">
            <h1>QUADRO DE INVESTIGAÇÃO</h1>
            <Botao tamanho="pequeno" onClick={() => setModal('nota')}>
              + NOTA
            </Botao>
            <Botao tamanho="pequeno" onClick={() => setModal('foto')}>
              + FOTO
            </Botao>
            <Botao
              tamanho="pequeno"
              variante="alerta"
              aria-pressed={modoFio}
              className={modoFio ? 'fio-ativo' : ''}
              onClick={() => (setModoFio(!modoFio), setOrigemFio(null))}
            >
              {modoFio ? '✕ CANCELAR FIO' : '✕ LIGAR FIO'}
            </Botao>
            <Botao tamanho="pequeno" variante="primario" onClick={() => setModal('teoria')}>
              + TEORIA
            </Botao>
            <div className="autores">
              <span>AUTORES:</span>
              {autores.map((a) => {
                const cor = detetive(a).cor;
                return (
                  <span key={a} className="autor" style={{ borderColor: cor }}>
                    <i style={{ background: cor }} />
                    {a === eu?.handle ? 'VOCÊ' : a.replace(/^sgt\./, '').replace(/^lupa_/, '').toUpperCase()}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="quadro-moldura">
            <Cortica
              caso={caso}
              estado={estado}
              itens={itens}
              posicoes={posicoes}
              modoFio={modoFio}
              origemFio={origemFio}
              meu={eu?.handle}
              presenca={presenca?.autor}
              aoClicar={clicarItem}
              aoArrastar={(ref, x, y) => setArrasto({ ref, x, y })}
              aoSoltar={(ref, x, y, moveu) => {
                setArrasto(null);
                if (moveu) acao({ tipo: 'item-movido', item: ref, x, y });
              }}
              aoRemover={(ref) => acao({ tipo: 'item-removido', item: ref }) && avisar('ITEM REMOVIDO')}
            />
          </div>
        </div>

        <aside className="quadro-lateral">
          <Teorias caso={caso} estado={estado} aoVotar={(teoria, valor) => acao({ tipo: 'voto', teoria, valor })} />
          <div className="regra">
            <span>REGRA DO QUADRO</span>
            <p className="texto">Deixe pistas, conexões e perguntas. Nunca a resposta. Quem acusa é quem investiga.</p>
          </div>
        </aside>
      </div>

      {modal === 'nota' && (
        <NovaNota
          aoFechar={() => setModal(null)}
          aoCriar={(texto) => {
            const { x, y } = posicaoLivre(itens, 'nota');
            if (acao({ tipo: 'nota', nota: `n-${Date.now().toString(36)}`, texto, x, y })) (setModal(null), avisar('NOTA PRESA NO QUADRO'));
          }}
        />
      )}
      {modal === 'foto' && (
        <NovaFoto
          caso={caso}
          estado={estado}
          aoFechar={() => setModal(null)}
          aoEscolher={(dados) => {
            if (acao(dados)) (setModal(null), avisar('FOTO PRESA NO QUADRO'));
          }}
          posicao={(tipo) => posicaoLivre(itens, tipo)}
        />
      )}
      {modal === 'teoria' && (
        <NovaTeoria
          caso={caso}
          aoFechar={() => setModal(null)}
          aoCriar={(titulo, texto, suspeito) => {
            if (acao({ tipo: 'teoria', teoria: `t-${Date.now().toString(36)}`, titulo, texto, suspeito, votosBase: 0 })) (setModal(null), avisar('TEORIA PUBLICADA'));
          }}
        />
      )}
    </Palco>
  );
}

// ---------- Cortiça ----------

interface PropsCortica {
  caso: Caso;
  estado: EstadoCaso;
  itens: ItemQuadro[];
  posicoes: Map<string, ItemQuadro>;
  modoFio: boolean;
  origemFio: string | null;
  meu?: string;
  presenca?: string;
  aoClicar: (ref: string) => void;
  aoArrastar: (ref: string, x: number, y: number) => void;
  aoSoltar: (ref: string, x: number, y: number, moveu: boolean) => void;
  aoRemover: (ref: string) => void;
}

function Cortica({ caso, estado, itens, posicoes, modoFio, origemFio, meu, presenca, aoClicar, aoArrastar, aoSoltar, aoRemover }: PropsCortica) {
  const zoom = useZoom();
  const detetive = useDetetives();
  const arrasto = useRef<{ ref: string; px: number; py: number; x0: number; y0: number; x: number; y: number; moveu: boolean } | null>(null);

  const fios = [...estado.fios.values()];
  const chaveDesenho = fios.map((f) => f.de + f.para).join() + itens.map((i) => `${i.ref}${i.x},${i.y}`).join();
  // Fios em pixel art, desenhados a 1/4 da resolução (252×200) como no design.
  const imagemFios = useMemo(() => {
    const segs = fios
      .map((f) => [posicoes.get(f.de), posicoes.get(f.para)] as const)
      .filter(([a, b]) => a && b)
      .map(([a, b]) => {
        const [x0, y0] = alfinete(a!.ref, a!.x, a!.y);
        const [x1, y1] = alfinete(b!.ref, b!.x, b!.y);
        return [x0 / 4, y0 / 4, x1 / 4, y1 / 4] as [number, number, number, number];
      });
    return strings(QUADRO.largura / 4, QUADRO.altura / 4, segs);
  }, [chaveDesenho]);

  const inicio = (e: PE<HTMLDivElement>, item: ItemQuadro) => {
    if (modoFio || e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrasto.current = { ref: item.ref, px: e.clientX, py: e.clientY, x0: item.x, y0: item.y, x: item.x, y: item.y, moveu: false };
  };
  const mover = (e: PE<HTMLDivElement>) => {
    const a = arrasto.current;
    if (!a) return;
    const dx = (e.clientX - a.px) / zoom;
    const dy = (e.clientY - a.py) / zoom;
    if (!a.moveu && Math.abs(dx) + Math.abs(dy) < 3) return;
    a.moveu = true;
    const largura = LARGURA[posicoes.get(a.ref)!.tipo];
    a.x = Math.round(Math.max(0, Math.min(QUADRO.largura - largura, QUADRO.largura - 40, a.x0 + dx)));
    a.y = Math.round(Math.max(0, Math.min(QUADRO.altura - 60, QUADRO.altura - 40, a.y0 + dy)));
    aoArrastar(a.ref, a.x, a.y);
  };
  const fim = () => {
    const a = arrasto.current;
    arrasto.current = null;
    if (a) aoSoltar(a.ref, a.x, a.y, a.moveu);
  };

  const ordenados = [...itens].sort((a, b) => (a.ordem ?? a.em ?? 0) - (b.ordem ?? b.em ?? 0));
  const ultimaDaPresenca = presenca && [...ordenados].reverse().find((i) => i.autor === presenca);

  return (
    <div className={`cortica ${modoFio ? 'modo-fio' : ''}`} style={{ backgroundImage: `url(${arteFixa().cork})` }}>
      {modoFio && <div className="dica-fio">{origemFio ? 'Agora clique no segundo item.' : 'Clique em dois itens para ligá-los. Em dois itens já ligados por você, o fio é desfeito. Esc cancela.'}</div>}
      <img className="fios" src={imagemFios} alt="" />
      {ordenados.map((item) => {
        const cor = corAlfinete(item, detetive);
        const [px, py] = alfinete(item.ref, item.x, item.y);
        const meuItem = !!item.autor && item.autor === meu;
        return (
          <div key={item.ref} style={{ display: 'contents' }}>
            <div
              className={`item item-${item.tipo} ${origemFio === item.ref ? 'origem' : ''} ${arrasto.current?.ref === item.ref ? 'arrastando' : ''}`}
              style={{ left: item.x, top: item.y, width: LARGURA[item.tipo], '--autor': item.autor ? detetive(item.autor).cor : 'var(--red)' } as CSSProperties}
              onPointerDown={(e) => inicio(e, item)}
              onPointerMove={mover}
              onPointerUp={fim}
              onPointerCancel={fim}
              onClick={() => aoClicar(item.ref)}
              role={modoFio ? 'button' : undefined}
              tabIndex={modoFio ? 0 : undefined}
              onKeyDown={(e) => modoFio && e.key === 'Enter' && aoClicar(item.ref)}
            >
              <ConteudoItem caso={caso} item={item} />
              {meuItem && !modoFio && (
                <button className="item-remover" onClick={() => aoRemover(item.ref)} aria-label="Tirar do quadro">
                  ✕
                </button>
              )}
            </div>
            <span className="alfinete" style={{ left: px - 8, top: py - 8, background: cor }} />
          </div>
        );
      })}
      {ultimaDaPresenca && (
        <div className="cursor-presenca" style={{ left: ultimaDaPresenca.x + LARGURA[ultimaDaPresenca.tipo] - 24, top: ultimaDaPresenca.y + 64, '--cor': detetive(presenca!).cor } as CSSProperties}>
          <span className="cursor-seta" />
          <span className="cursor-nome">{presenca!.replace(/^sgt\./, '').replace(/^lupa_/, '').toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}

function corAlfinete(item: ItemQuadro, detetive: ReturnType<typeof useDetetives>) {
  if (item.tipo === 'recorte') return 'var(--amber)';
  if (item.tipo === 'nota' || item.tipo === 'pista') return item.autor ? detetive(item.autor).cor : 'var(--fog)';
  return 'var(--red)';
}

function ConteudoItem({ caso, item }: { caso: Caso; item: ItemQuadro }) {
  const assinatura = item.autor && (
    <span className="item-assinatura">
      @{item.autor.toUpperCase()}
      {item.em ? ` · ${tempoRelativo(item.em)}` : ''}
    </span>
  );
  switch (item.tipo) {
    case 'vitima':
      return (
        <>
          <Retrato aparencia={caso.vitima.aparencia} borda={2} alt="" />
          <span className="legenda-foto vitima">VÍTIMA · {caso.vitima.curto}</span>
        </>
      );
    case 'suspeito': {
      const s = caso.suspeitos.find((x) => x.id === idDe(item.ref))!;
      return (
        <>
          <Retrato aparencia={s.aparencia} borda={2} alt="" />
          <span className="legenda-foto">
            {s.curto}, {s.papel.split(' ')[0].toLowerCase()}
          </span>
        </>
      );
    }
    case 'nota':
      return (
        <>
          <span className="texto nota-texto">{item.texto}</span>
          {assinatura}
        </>
      );
    case 'pista': {
      const p = caso.pistas.find((x) => x.id === idDe(item.ref))!;
      return (
        <>
          <Icone nome={p.icone} />
          <span className="pista-cartao">
            <span>{p.nome.toUpperCase()}</span>
            {assinatura}
          </span>
        </>
      );
    }
    case 'cena': {
      const alvo = CENARIOS[caso.cena.cenario].ancoras[idDe(item.ref)]?.alvo ?? [224, 128, 192, 128];
      const left = Math.max(-(640 - 192), Math.min(0, -(alvo[0] + alvo[2] / 2 - 96)));
      const top = Math.max(-(384 - 128), Math.min(0, -(alvo[1] + alvo[3] / 2 - 64)));
      return (
        <>
          <span className="foto-cena">
            <img src={cenaImagem(caso.cena.cenario)} alt="" style={{ left, top }} />
          </span>
          <span className="legenda-foto">{item.legenda}</span>
        </>
      );
    }
    case 'recorte':
      return (
        <>
          <span className="recorte-fonte">{item.fonte}</span>
          <span className="recorte-titulo">{item.titulo}</span>
          <span className="texto recorte-texto">{item.texto}</span>
          {item.autor && <span className="recorte-fonte">RECORTE POR @{item.autor.toUpperCase()}</span>}
        </>
      );
  }
}

// ---------- Teorias ----------

function Teorias({ caso, estado, aoVotar }: { caso: Caso; estado: EstadoCaso; aoVotar: (teoria: string, valor: -1 | 0 | 1) => void }) {
  const eu = useJogador();
  const detetive = useDetetives();
  const teorias = [...estado.teorias.values()].sort((a, b) => totalVotos(b) - totalVotos(a) || b.em - a.em);
  return (
    <section className="painel teorias">
      <div className="painel-titulo">
        <h2 style={{ font: 'inherit' }}>TEORIAS</h2>
        <small>{teorias.length} · MAIS VOTADAS</small>
      </div>
      <ul>
        {!teorias.length && <li className="texto sem-teorias">Nenhuma teoria ainda. Proponha a primeira com + TEORIA.</li>}
        {teorias.map((t, i) => (
          <CartaoTeoria key={t.id} teoria={t} caso={caso} destaque={i === 0} minha={t.autor === eu?.handle} meuVoto={eu ? t.votos[eu.handle] ?? 0 : 0} cor={detetive(t.autor).cor} aoVotar={aoVotar} />
        ))}
      </ul>
    </section>
  );
}

function CartaoTeoria({ teoria: t, caso, destaque, minha, meuVoto, cor, aoVotar }: { teoria: Teoria; caso: Caso; destaque: boolean; minha: boolean; meuVoto: number; cor: string; aoVotar: (teoria: string, valor: -1 | 0 | 1) => void }) {
  const aponta = t.suspeito ? caso.suspeitos.find((s) => s.id === t.suspeito)?.curto.toUpperCase() : null;
  return (
    <li className={`teoria ${destaque ? 'em-alta' : ''}`}>
      <div className="votos">
        <button className={meuVoto === 1 ? 'votado' : ''} disabled={minha} onClick={() => aoVotar(t.id, meuVoto === 1 ? 0 : 1)} aria-label="Votar a favor" aria-pressed={meuVoto === 1}>
          ▲
        </button>
        <span>{totalVotos(t)}</span>
        <button className={meuVoto === -1 ? 'contra' : ''} disabled={minha} onClick={() => aoVotar(t.id, meuVoto === -1 ? 0 : -1)} aria-label="Votar contra" aria-pressed={meuVoto === -1}>
          ▼
        </button>
      </div>
      <div className="teoria-corpo">
        <span className="teoria-titulo">{t.titulo}</span>
        <span className="texto teoria-texto">{t.texto}</span>
        <span className="teoria-meta">
          <span style={{ color: cor }}>{minha ? 'SUA TEORIA' : `@${t.autor}`}</span>
          <span>· {aponta ? `APONTA ${aponta}` : 'HIPÓTESE GERAL'}</span>
        </span>
      </div>
    </li>
  );
}

// ---------- Janelas ----------

function NovaNota({ aoFechar, aoCriar }: { aoFechar: () => void; aoCriar: (texto: string) => void }) {
  const [texto, setTexto] = useState('');
  return (
    <Janela titulo="NOVA NOTA" aoFechar={aoFechar}>
      <form onSubmit={(e) => (e.preventDefault(), texto.trim() && aoCriar(texto.trim()))} style={{ display: 'contents' }}>
        <label className="campo">
          <span className="sr">Texto da nota</span>
          <textarea rows={4} maxLength={280} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Uma pergunta, uma conexão, uma dúvida. Nunca a resposta." />
        </label>
        <span className="texto" style={{ fontSize: 13, color: 'var(--fog)' }}>
          {texto.length}/280
        </span>
        <div className="janela-acoes">
          <Botao onClick={aoFechar}>CANCELAR</Botao>
          <Botao variante="primario" type="submit" disabled={!texto.trim()}>
            PRENDER NOTA
          </Botao>
        </div>
      </form>
    </Janela>
  );
}

type DadosFoto = { tipo: 'pista-no-quadro'; pista: string; x: number; y: number } | { tipo: 'foto-cena'; ancora: string; legenda: string; x: number; y: number };

function NovaFoto({ caso, estado, aoFechar, aoEscolher, posicao }: { caso: Caso; estado: EstadoCaso; aoFechar: () => void; aoEscolher: (d: DadosFoto) => void; posicao: (tipo: 'pista' | 'cena') => { x: number; y: number } }) {
  const pistas = caso.pistas.filter((p) => estado.pistas.has(p.id) && !estado.itens.has(`pista:${p.id}`));
  const pontos = caso.cena.pontos.filter((p) => estado.examinados.has(p.ancora) && !estado.itens.has(`cena:${p.ancora}`));
  const legenda = (ancora: string, pista?: string) => (pista ? caso.pistas.find((x) => x.id === pista)!.nome : CENARIOS[caso.cena.cenario].ancoras[ancora].descricao).slice(0, 40);
  return (
    <Janela titulo="PRENDER NO QUADRO" aoFechar={aoFechar} largura={560}>
      <span className="rotulo">PISTAS ENCONTRADAS</span>
      <div className="escolhas">
        {!pistas.length && <span className="texto escolha-vazia">Todas as pistas encontradas já estão no quadro.</span>}
        {pistas.map((p) => (
          <button key={p.id} className="escolha" onClick={() => aoEscolher({ tipo: 'pista-no-quadro', pista: p.id, ...posicao('pista') })}>
            <Icone nome={p.icone} tamanho={32} />
            {p.nome}
          </button>
        ))}
      </div>
      <span className="rotulo">FOTOS DA CENA</span>
      <div className="escolhas">
        {!pontos.length && <span className="texto escolha-vazia">Examine mais pontos da cena para tirar fotos.</span>}
        {pontos.map((p) => (
          <button key={p.ancora} className="escolha" onClick={() => aoEscolher({ tipo: 'foto-cena', ancora: p.ancora, legenda: legenda(p.ancora, p.pista), ...posicao('cena') })}>
            <Icone nome="lupa" tamanho={32} />
            {legenda(p.ancora, p.pista)}
          </button>
        ))}
      </div>
    </Janela>
  );
}

function NovaTeoria({ caso, aoFechar, aoCriar }: { caso: Caso; aoFechar: () => void; aoCriar: (titulo: string, texto: string, suspeito?: string) => void }) {
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [suspeito, setSuspeito] = useState('');
  const pronta = titulo.trim() && texto.trim();
  return (
    <Janela titulo="NOVA TEORIA" aoFechar={aoFechar}>
      <form onSubmit={(e) => (e.preventDefault(), pronta && aoCriar(titulo.trim(), texto.trim(), suspeito || undefined))} style={{ display: 'contents' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="rotulo">TÍTULO</span>
          <span className="campo">
            <input value={titulo} maxLength={60} onChange={(e) => setTitulo(e.target.value)} placeholder="A hora foi forjada" />
          </span>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="rotulo">RACIOCÍNIO</span>
          <span className="campo">
            <textarea rows={4} maxLength={280} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="O que as pistas sugerem e por quê." />
          </span>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="rotulo">APONTA PARA</span>
          <span className="campo">
            <select value={suspeito} onChange={(e) => setSuspeito(e.target.value)}>
              <option value="">Ninguém em especial</option>
              {caso.suspeitos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </span>
        </label>
        <div className="janela-acoes">
          <Botao onClick={aoFechar}>CANCELAR</Botao>
          <Botao variante="primario" type="submit" disabled={!pronta}>
            PUBLICAR TEORIA
          </Botao>
        </div>
      </form>
    </Janela>
  );
}
