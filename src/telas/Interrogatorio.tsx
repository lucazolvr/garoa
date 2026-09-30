// 04 Interrogatório: perguntas liberadas pelas pistas, trechos marcados e anotações para o quadro.
import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { arteFixa, retrato } from '../arte/sprites';
import type { Caso, Pergunta, Suspeito } from '../casos/esquema';
import { useAcoes, useDetetives, useEstadoCaso, useJogador } from '../dados/contexto';
import { chaveTrecho, type EstadoCaso } from '../jogo/estado';
import { posicaoLivre } from '../jogo/quadro';
import { perguntaFeita, perguntaLiberada, situacaoSuspeito, tensaoAtual } from '../jogo/regras';
import { Barra, Botao, Icone, Rosto } from '../ui/base';
import { useAvisar } from '../ui/Avisos';
import { tempoRelativo } from '../ui/formatar';
import { Palco } from '../ui/Palco';
import { TopoTrilha } from '../ui/Topo';
import './interrogatorio.css';

const TENSAO = {
  baixa: { rotulo: 'BAIXO', cor: 'var(--teal)', pct: 30 },
  media: { rotulo: 'MÉDIO', cor: 'var(--amber)', pct: 55 },
  alta: { rotulo: 'ALTO', cor: 'var(--red)', pct: 85 },
};

export default function Interrogatorio({ caso }: { caso: Caso }) {
  const { suspeito: suspeitoId } = useParams();
  const s = caso.suspeitos.find((x) => x.id === suspeitoId);
  if (!s) return <Navigate to={`/caso/${caso.id}`} replace />;
  return <Sessao key={s.id} caso={caso} s={s} />;
}

/** Perguntas já feitas a este suspeito, em ordem cronológica. */
function historico(estado: EstadoCaso, s: Suspeito) {
  return s.perguntas
    .map((p) => ({ p, reg: estado.perguntas.get(`${s.id}/${p.id}`) }))
    .filter((x): x is { p: Pergunta; reg: NonNullable<typeof x.reg> } => !!x.reg)
    .sort((a, b) => a.reg.em - b.reg.em);
}

function Sessao({ caso, s }: { caso: Caso; s: Suspeito }) {
  const estado = useEstadoCaso(caso);
  const eu = useJogador();
  const detetive = useDetetives();
  const { registrar } = useAcoes();
  const avisar = useAvisar();
  const navegar = useNavigate();

  const feitas = historico(estado, s);
  const [foco, setFoco] = useState<string | null>(() => feitas.at(-1)?.p.id ?? null);
  const [frase, setFrase] = useState<number | null>(null);
  const perguntaFoco = s.perguntas.find((p) => p.id === foco);
  const falas = perguntaFoco ? perguntaFoco.resposta : s.abertura;

  const perguntar = (p: Pergunta) => {
    const antes = new Set(estado.pistas.keys());
    const erro = registrar(caso, { tipo: 'perguntou', suspeito: s.id, pergunta: p.id });
    if (erro) return avisar(erro, 'erro');
    setFoco(p.id);
    setFrase(null);
    p.revela.filter((id) => !antes.has(id)).forEach((id) => avisar(`NOVA PISTA: ${caso.pistas.find((x) => x.id === id)?.nome.toUpperCase()}`));
  };

  const marcar = () => {
    if (!perguntaFoco || frase === null) return;
    const erro = registrar(caso, { tipo: 'marcou-trecho', suspeito: s.id, pergunta: perguntaFoco.id, trecho: frase });
    avisar(erro ?? 'TRECHO MARCADO', erro ? 'erro' : 'info');
  };

  const anotar = () => {
    if (frase === null) return;
    const texto = `“${falas[frase]}” (${s.curto})`.slice(0, 280);
    const nota = `n-${Date.now().toString(36)}`;
    const { x, y } = posicaoLivre([...estado.itens.values()], 'nota');
    const erro = registrar(caso, { tipo: 'nota', nota, texto, x, y });
    if (erro) return avisar(erro, 'erro');
    registrar(caso, { tipo: 'fio', de: `nota:${nota}`, para: `suspeito:${s.id}` });
    avisar('NOTA PRESA NO QUADRO');
  };

  const pausar = () => {
    registrar(caso, { tipo: 'pausou', suspeito: s.id });
    avisar('SESSÃO PAUSADA PARA A EQUIPE');
    navegar(`/caso/${caso.id}`);
  };

  const tensao = tensaoAtual(caso, estado, s.id);
  const deOutros = feitas.filter((f) => f.reg.autor !== eu?.handle);
  const outro = estado.pausas.get(s.id)?.autor ?? deOutros.at(-1)?.reg.autor;
  const marcados = perguntaFoco ? falas.map((_, i) => estado.trechos.get(chaveTrecho(s.id, perguntaFoco.id, i))) : [];
  const primeiroMarcador = marcados.find(Boolean);

  const disponiveis = s.perguntas.filter((p) => !perguntaFeita(estado, s.id, p));
  const liberadas = disponiveis.filter((p) => perguntaLiberada(estado, p));
  const bloqueadas = disponiveis.filter((p) => !perguntaLiberada(estado, p));
  const nomePista = (id: string) => caso.pistas.find((p) => p.id === id);

  return (
    <Palco altura={900}>
      <TopoTrilha
        trilha={[
          { rotulo: `CASO #${caso.id}`, para: `/caso/${caso.id}` },
          { rotulo: 'INTERROGATÓRIO' },
        ]}
      >
        <Botao tamanho="pequeno" onClick={() => navegar(`/caso/${caso.id}`)}>
          ◂ VOLTAR AO CASO
        </Botao>
      </TopoTrilha>

      <div className="interro">
        <div className="palco-interro" style={{ backgroundImage: `url(${arteFixa().dNight})` }}>
          <div className="interro-parede" />
          <img className="interro-luz" src={arteFixa().cone} alt="" />
          <div className="interro-lampada" />
          <div className="interro-lampada-luz" />
          <img className="interro-retrato" src={retrato(s.aparencia, 64)} alt={s.nome} />
          <div className="interro-mesa-borda" />
          <div className="interro-mesa" />
          <div className="interro-placa">{s.nome.toUpperCase()}</div>
          <Icone nome="carta" style={{ position: 'absolute', left: 680, top: 416 }} />
          <Icone nome="xicara" style={{ position: 'absolute', left: 296, top: 412 }} />

          <nav className="interro-suspeitos" aria-label="Suspeitos">
            <span className="rotulo">SUSPEITOS</span>
            {caso.suspeitos.map((x) => {
              const atual = x.id === s.id;
              return (
                <Link key={x.id} to={`/caso/${caso.id}/interrogatorio/${x.id}`} aria-current={atual ? 'page' : undefined} title={x.nome} className="interro-suspeito">
                  <Rosto aparencia={x.aparencia} tamanho={56} borda={4} corBorda={atual ? 'var(--amber)' : 'var(--slate)'} alt={x.nome} />
                  {situacaoSuspeito(caso, estado, x.id) === 'interrogado' && <span className="interro-check">✓</span>}
                </Link>
              );
            })}
          </nav>

          <div className="interro-info">
            <div className="interro-info-linha">
              <span>PERGUNTA</span>
              <b>
                {feitas.length} / {s.perguntas.length}
              </b>
            </div>
            <div className="interro-info-linha">
              <span>NERVOSISMO</span>
              <b style={{ color: tensao ? TENSAO[tensao].cor : 'var(--fog)' }}>{tensao ? TENSAO[tensao].rotulo : '—'}</b>
            </div>
            <Barra pct={tensao ? TENSAO[tensao].pct : 0} cor={tensao ? TENSAO[tensao].cor : 'var(--dusk)'} rotulo="Nervosismo" />
            <span className="texto interro-nota">
              {outro && outro !== eu?.handle && deOutros.length ? (
                <>
                  Continuando a sessão de <span style={{ color: detetive(outro).cor }}>@{outro}</span>.{' '}
                  {deOutros.length === 1 ? 'A pergunta 1 já foi feita.' : `${deOutros.length} perguntas já foram feitas.`}
                </>
              ) : (
                'Clique numa frase para marcá-la como pista ou anotá-la no quadro.'
              )}
            </span>
          </div>

          <div className="dialogo">
            <div className="dialogo-falante">{s.curto.toUpperCase()}</div>
            <div className="dialogo-texto">
              {perguntaFoco && <span className="dialogo-pergunta">▸ {rotuloPergunta(perguntaFoco, nomePista)}</span>}
              <p className="texto">
                {falas.map((f, i) => {
                  const marcado = marcados[i];
                  return (
                    <span key={i}>
                      <span
                        className={`frase ${marcado ? 'marcada' : ''} ${frase === i ? 'escolhida' : ''} ${perguntaFoco ? 'clicavel' : ''}`}
                        role={perguntaFoco ? 'button' : undefined}
                        tabIndex={perguntaFoco ? 0 : undefined}
                        onClick={() => perguntaFoco && setFrase(frase === i ? null : i)}
                        onKeyDown={(e) => perguntaFoco && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setFrase(frase === i ? null : i))}
                        title={marcado ? `Marcado por @${marcado.autor}` : undefined}
                      >
                        {f}
                      </span>{' '}
                    </span>
                  );
                })}
              </p>
              {frase !== null && perguntaFoco && (
                <div className="dialogo-ferramentas">
                  <button className="ferramenta-marcar" onClick={marcar} disabled={!!marcados[frase]}>
                    {marcados[frase] ? '✓ JÁ MARCADO' : '✚ MARCAR COMO PISTA'}
                  </button>
                  <button className="ferramenta-anotar" onClick={anotar}>
                    ✎ ANOTAR NO QUADRO
                  </button>
                </div>
              )}
              {primeiroMarcador && (
                <div className="dialogo-legenda">
                  <span />
                  TRECHO MARCADO POR @{primeiroMarcador.autor.toUpperCase()} · SUBLINHADO
                </div>
              )}
              <span className="dialogo-seta" aria-hidden>
                ▼
              </span>
            </div>
            <div className="dialogo-perguntas">
              <span className="rotulo">PERGUNTAR</span>
              <ul>
                {liberadas.map((p) => (
                  <li key={p.id}>
                    <button className="pergunta" onClick={() => perguntar(p)}>
                      {p.mostra ? (
                        <>
                          <Icone nome={nomePista(p.mostra)!.icone} tamanho={24} />
                          <span>
                            <span className="pergunta-mostrar">MOSTRAR</span> {nomePista(p.mostra)!.nome}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="pergunta-seta">▶</span>
                          {p.texto}
                        </>
                      )}
                    </button>
                  </li>
                ))}
                {bloqueadas.map((p) => (
                  <li key={p.id} className="pergunta bloqueada">
                    <span className="pergunta-seta">▶</span>
                    <span>
                      {p.mostra ? 'Mostrar uma pista…' : p.texto} <small>[PRECISA DE PISTA]</small>
                    </span>
                  </li>
                ))}
                {!disponiveis.length && <li className="texto pergunta-fim">Nada mais a perguntar a {s.curto}.</li>}
              </ul>
              <button className="pausar" onClick={pausar}>
                ⏸ PAUSAR E DEIXAR PARA A EQUIPE
              </button>
            </div>
          </div>
        </div>

        <aside className="interro-lateral">
          <TrechosMarcados caso={caso} estado={estado} />
          <section className="painel">
            <div className="painel-titulo">
              <h2 style={{ font: 'inherit' }}>HISTÓRICO DA SESSÃO</h2>
            </div>
            <ol className="historico">
              {!feitas.length && <li className="texto historico-vazio">Ninguém interrogou {s.curto} ainda.</li>}
              {feitas.map(({ p, reg }, i) => {
                const cor = detetive(reg.autor).cor;
                return (
                  <li key={p.id}>
                    <button className={`historico-item ${foco === p.id ? 'atual' : ''}`} onClick={() => (setFoco(p.id), setFrase(null))}>
                      <span className="historico-n" style={{ color: cor }}>
                        P{i + 1}
                      </span>
                      <span className="historico-texto">
                        <span className="texto">{rotuloPergunta(p, nomePista)}</span>
                        <span className="historico-meta">
                          @{reg.autor.toUpperCase()} · {tempoRelativo(reg.em)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        </aside>
      </div>
    </Palco>
  );
}

function rotuloPergunta(p: Pergunta, pista: (id: string) => { nome: string } | undefined) {
  return p.mostra ? `Mostrou ${pista(p.mostra)?.nome}: ${p.texto}` : p.texto;
}

function TrechosMarcados({ caso, estado }: { caso: Caso; estado: EstadoCaso }) {
  const detetive = useDetetives();
  const trechos = [...estado.trechos.entries()]
    .map(([chave, reg]) => {
      const [sid, pid, n] = chave.split('/');
      const s = caso.suspeitos.find((x) => x.id === sid)!;
      const idx = s.perguntas.findIndex((p) => p.id === pid);
      return { chave, reg, texto: s.perguntas[idx].resposta[Number(n)], fonte: `${s.curto.toUpperCase()} · PERGUNTA ${idx + 1}` };
    })
    .sort((a, b) => b.reg.em - a.reg.em);
  return (
    <section className="painel">
      <div className="painel-titulo">
        <h2 style={{ font: 'inherit' }}>TRECHOS MARCADOS</h2>
        <small>{trechos.length}</small>
      </div>
      <ul className="trechos">
        {!trechos.length && <li className="texto historico-vazio">Nenhum trecho marcado ainda.</li>}
        {trechos.slice(0, 4).map((t) => (
          <li key={t.chave} className="trecho" style={{ borderLeftColor: detetive(t.reg.autor).cor }}>
            <span className="texto">“{t.texto}”</span>
            <span className="trecho-meta">
              <span>{t.fonte}</span>
              <span>@{t.reg.autor}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
