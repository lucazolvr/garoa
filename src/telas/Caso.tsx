// 02 Página do caso: cena do crime, relatório, suspeitos, pistas e diário.
import { useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { arteFixa, cenaImagem } from '../arte/sprites';
import { CENARIOS } from '../casos/catalogo';
import type { Caso } from '../casos/esquema';
import { useAcoes, useCasoPrivado, useDetetives, useEstadoCaso, useJogador } from '../dados/contexto';
import { diario } from '../jogo/diario';
import type { EstadoCaso } from '../jogo/estado';
import { detetivesNoCaso, progresso, resumoProgresso, situacaoSuspeito, statusNoMapa, suspeita } from '../jogo/regras';
import { Barra, Botao, IconePista, Retrato, Rosto, Selo } from '../ui/base';
import { useAvisar, useEmBreve } from '../ui/Avisos';
import { plural, tempoRelativo } from '../ui/formatar';
import { Palco } from '../ui/Palco';
import { STATUS, rotuloStatus } from '../ui/status';
import { TopoCompleto } from '../ui/Topo';
import './caso.css';

export default function CasoPagina({ caso }: { caso: Caso }) {
  const estado = useEstadoCaso(caso);
  const cp = useCasoPrivado(caso.id);
  const navegar = useNavigate();
  const emBreve = useEmBreve();
  const status = statusNoMapa(caso, estado, cp);
  const equipe = detetivesNoCaso(caso, estado);
  const ultima = estado.eventos.at(-1);
  const abertura = diario(caso, estado)[0];

  return (
    <Palco>
      <TopoCompleto aba="casos" />
      <div className="caso">
        <div className="caso-cabecalho">
          <nav className="caso-trilha" aria-label="Você está em">
            <Link to="/">MAPA</Link>
            <span aria-hidden>▸</span>
            <span className="ambar">{caso.bairro}</span>
            <span aria-hidden>▸</span>
            <span>{caso.local.toUpperCase()}</span>
          </nav>
          <div className="caso-titulo-linha">
            <div className="caso-titulo-bloco">
              <div className="caso-selos">
                <span className="caso-num">CASO #{caso.id}</span>
                <Selo cor={STATUS[status].cor} medio>
                  {rotuloStatus(status, cp)}
                </Selo>
                <Selo cor="var(--deep)" texto="var(--fog)" medio>
                  DIFICULDADE {'■'.repeat(caso.dificuldade)}
                  {'□'.repeat(5 - caso.dificuldade)}
                </Selo>
              </div>
              <h1 className="caso-titulo">{caso.titulo}</h1>
              <span className="caso-meta texto">
                {abertura?.verbo === 'abriu o caso' ? `Aberto por @${abertura.autor} ${tempoRelativo(abertura.em).toLowerCase()}` : 'Aberto pela delegacia'}
                {' · '}
                {plural(equipe.length, 'detetive', 'detetives')}
                {ultima ? ` · última atividade ${tempoRelativo(ultima.em).toLowerCase()}` : ' · ninguém entrou na cena ainda'}
              </span>
            </div>
            <div className="caso-acoes">
              <Botao onClick={emBreve}>SEGUIR CASO</Botao>
              <Botao onClick={() => navegar(`/caso/${caso.id}/quadro`)}>ABRIR QUADRO</Botao>
              <Botao variante="primario" onClick={() => navegar(`/caso/${caso.id}/acusacao`)}>
                {cp.status === 'aberto' ? 'FAZER ACUSAÇÃO' : 'VER RELATÓRIO FINAL'}
              </Botao>
            </div>
          </div>
        </div>

        <div className="caso-linha">
          <CenaDoCrime caso={caso} estado={estado} />
          <div className="caso-coluna">
            <article className="papel relatorio">
              <div className="relatorio-topo">
                <span>RELATÓRIO POLICIAL</span>
                <small>FL. 1/1</small>
              </div>
              {caso.relatorio.map((p, i) => (
                <p key={i} className="texto">
                  {p}
                </p>
              ))}
            </article>
            <Progresso caso={caso} estado={estado} />
            <Continuar caso={caso} estado={estado} />
            <Equipe caso={caso} estado={estado} />
          </div>
        </div>

        <Suspeitos caso={caso} estado={estado} />

        <div className="caso-linha">
          <Pistas caso={caso} estado={estado} />
          <Diario caso={caso} estado={estado} />
        </div>
      </div>
    </Palco>
  );
}

function CenaDoCrime({ caso, estado }: { caso: Caso; estado: EstadoCaso }) {
  const { registrar } = useAcoes();
  const avisar = useAvisar();
  const [sel, setSel] = useState<string | null>(null);
  const cenario = CENARIOS[caso.cena.cenario];
  const personagens = arteFixa().ch;

  const examinar = (ancora: string) => {
    if (!estado.examinados.has(ancora)) {
      const erro = registrar(caso, { tipo: 'examinou', ancora });
      if (erro) return avisar(erro, 'erro');
    }
    setSel(ancora);
  };

  const ponto = caso.cena.pontos.find((p) => p.ancora === sel);
  const ancora = sel ? cenario.ancoras[sel] : null;
  const pista = ponto?.pista ? caso.pistas.find((p) => p.id === ponto.pista) : undefined;
  const quem = sel ? estado.examinados.get(sel) : undefined;

  let popup: CSSProperties | undefined;
  if (ancora) {
    const [x, y, w] = ancora.alvo;
    const left = x + w + 8 + 208 <= 640 ? x + w + 8 : Math.max(8, x - 216);
    popup = { left, top: Math.min(Math.max(8, y + 8), 384 - 132) };
  }

  return (
    <section className="painel painel-sombra cena-painel">
      <div className="painel-titulo">
        <h2 style={{ font: 'inherit' }}>CENA DO CRIME · {caso.cena.titulo}</h2>
        <small>
          {estado.examinados.size} DE {caso.cena.pontos.length} PONTOS
        </small>
      </div>
      <div className="cena">
        <img className="cena-arte" src={cenaImagem(caso.cena.cenario)} alt={`${cenario.nome}: ${cenario.descricao}`} onClick={() => setSel(null)} />
        {cenario.figurantes.map((f, i) => (
          <img key={i} className="cena-figurante" src={personagens[f.sprite]} alt="" style={{ left: f.x, top: f.y }} />
        ))}
        {ancora && <div className="cena-alvo" style={{ left: ancora.alvo[0], top: ancora.alvo[1], width: ancora.alvo[2], height: ancora.alvo[3] }} />}
        {caso.cena.pontos.map((p, i) => {
          const a = cenario.ancoras[p.ancora];
          const examinado = estado.examinados.has(p.ancora);
          const importante = examinado && p.pista && caso.pistas.find((x) => x.id === p.pista)?.importante;
          return (
            <button
              key={p.ancora}
              className={`cena-ponto ${examinado ? (importante ? 'importante' : 'examinado') : 'novo'} ${sel === p.ancora ? 'sel' : ''}`}
              style={{ left: a.marca[0], top: a.marca[1] }}
              onClick={() => examinar(p.ancora)}
              aria-label={examinado ? `Ponto ${i + 1}: ${a.descricao}` : `Examinar ${a.descricao}`}
            >
              {examinado ? i + 1 : '?'}
            </button>
          );
        })}
        {ponto && popup && (
          <div className={`cena-popup ${pista?.importante ? 'importante' : pista ? '' : 'vazio'}`} style={popup} role="status">
            <span className="cena-popup-titulo">{pista?.importante ? 'PISTA IMPORTANTE' : pista ? `PISTA: ${pista.nome.toUpperCase()}` : 'NADA DE NOVO'}</span>
            <span className="texto">{ponto.texto}</span>
            {quem && <span className="cena-popup-quem">EXAMINADO POR @{quem.autor.toUpperCase()}</span>}
          </div>
        )}
      </div>
      <div className="cena-rodape">
        <span className="texto">{caso.cena.contexto}</span>
        <span className="ambar">CLIQUE PARA EXAMINAR</span>
      </div>
    </section>
  );
}

function Progresso({ caso, estado }: { caso: Caso; estado: EstadoCaso }) {
  const pct = Math.round(progresso(caso, estado) * 100);
  const r = resumoProgresso(caso, estado);
  return (
    <section className="painel">
      <div className="painel-titulo">
        <h2 style={{ font: 'inherit' }}>PROGRESSO DA INVESTIGAÇÃO</h2>
        <span style={{ color: 'var(--teal)' }}>{pct}%</span>
      </div>
      <div className="progresso-corpo">
        <Barra pct={pct} altura={16} fundo="var(--night)" rotulo="Pistas encontradas" />
        <div className="progresso-grade">
          <span>
            <i style={{ color: 'var(--teal)' }}>■</i>CENA · {r.pontos[0]}/{r.pontos[1]} PONTOS
          </span>
          <span>
            <i style={{ color: 'var(--teal)' }}>■</i>SUSPEITOS · {r.suspeitos[0]}/{r.suspeitos[1]}
          </span>
          <span>
            <i style={{ color: 'var(--teal)' }}>■</i>PISTAS · {r.pistas} {r.pistas === 1 ? 'ACHADA' : 'ACHADAS'}
          </span>
          <span>
            <i style={{ color: 'var(--amber)' }}>■</i>TEORIAS · {r.teorias} NO QUADRO
          </span>
        </div>
      </div>
    </section>
  );
}

function Continuar({ caso, estado }: { caso: Caso; estado: EstadoCaso }) {
  const detetive = useDetetives();
  const eu = useJogador();
  const navegar = useNavigate();
  const pausa = [...estado.pausas.entries()].sort((a, b) => b[1].em - a[1].em)[0];
  if (!pausa) return null;
  const [suspeitoId, reg] = pausa;
  const s = caso.suspeitos.find((x) => x.id === suspeitoId)!;
  const feitas = s.perguntas.filter((p) => estado.perguntas.has(`${s.id}/${p.id}`)).length;
  const quem = reg.autor === eu?.handle ? 'Você' : `@${reg.autor}`;
  return (
    <div className="continuar">
      <Rosto aparencia={detetive(reg.autor).aparencia} tamanho={56} borda={4} />
      <div className="continuar-texto">
        <span className="ambar">CONTINUE DE ONDE PARARAM</span>
        <span className="texto">
          {quem} pausou o interrogatório de {s.nome} na pergunta {feitas + 1}, {tempoRelativo(reg.em).toLowerCase()}.
        </span>
      </div>
      <Botao variante="primario" onClick={() => navegar(`/caso/${caso.id}/interrogatorio/${s.id}`)}>
        CONTINUAR ▸
      </Botao>
    </div>
  );
}

function Equipe({ caso, estado }: { caso: Caso; estado: EstadoCaso }) {
  const detetive = useDetetives();
  const equipe = detetivesNoCaso(caso, estado);
  if (!equipe.length) return null;
  return (
    <div className="equipe">
      <span className="rotulo">DETETIVES NO CASO</span>
      <ul className="equipe-lista">
        {equipe.map((p) => {
          const d = detetive(p.handle);
          return (
            <li key={p.handle} className="equipe-item">
              <Rosto aparencia={d.aparencia} tamanho={40} />
              <span>
                <span style={{ color: d.cor, fontSize: 14 }}>@{p.handle}</span>
                <span className="texto equipe-papel">{p.papel}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const TAG = {
  'nao-interrogado': { f: 'NÃO INTERROGADA', m: 'NÃO INTERROGADO', cor: 'var(--deep)', texto: 'var(--fog)' },
  'em-andamento': { f: 'EM ANDAMENTO', m: 'EM ANDAMENTO', cor: 'var(--teal)', texto: 'var(--void)' },
  interrogado: { f: 'INTERROGADA', m: 'INTERROGADO', cor: 'var(--fog)', texto: 'var(--void)' },
};

function Suspeitos({ caso, estado }: { caso: Caso; estado: EstadoCaso }) {
  const sus = suspeita(caso, estado);
  return (
    <section className="secao">
      <div className="secao-titulo">
        <h2>SUSPEITOS</h2>
        <span className="texto">Barra = quanto a equipe suspeita (votos no quadro)</span>
      </div>
      <ul className="suspeitos" style={{ gridTemplateColumns: `repeat(${caso.suspeitos.length}, minmax(0, 1fr))` }}>
        {caso.suspeitos.map((s) => {
          const tag = TAG[situacaoSuspeito(caso, estado, s.id)];
          return (
            <li key={s.id}>
              <Link to={`/caso/${caso.id}/interrogatorio/${s.id}`} className="suspeito painel painel-sombra">
                <span className="suspeito-topo">
                  <Retrato aparencia={s.aparencia} alt="" />
                  <span className="suspeito-info">
                    <span className="suspeito-nome">{s.nome}</span>
                    <span className="texto suspeito-papel">{s.papel}</span>
                    <Selo cor={tag.cor} texto={tag.texto}>
                      {tag[s.genero]}
                    </Selo>
                  </span>
                </span>
                <span className="texto suspeito-alibi">
                  <span className="ambar">Álibi:</span> {s.alibi}
                </span>
                <span className="suspeito-barra">
                  <Barra pct={sus[s.id]} cor="var(--red)" altura={8} segmento={1000} rotulo={`Suspeita da equipe sobre ${s.curto}`} />
                  <span>{sus[s.id]}%</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Pistas({ caso, estado }: { caso: Caso; estado: EstadoCaso }) {
  const achadas = caso.pistas
    .filter((p) => estado.pistas.has(p.id))
    .sort((a, b) => Number(b.importante) - Number(a.importante) || estado.pistas.get(a.id)!.em - estado.pistas.get(b.id)!.em);
  const origem = (id: string) => {
    const r = estado.pistas.get(id)!;
    const o = r.origem;
    if (o.tipo === 'cena') {
      const n = caso.cena.pontos.findIndex((p) => p.ancora === o.ancora) + 1;
      return `POR @${r.autor.toUpperCase()} · CENA, PONTO ${n}`;
    }
    const s = caso.suspeitos.find((x) => x.id === o.suspeito);
    return `POR @${r.autor.toUpperCase()} · DEPOIMENTO DE ${s?.curto.toUpperCase()}`;
  };
  return (
    <section className="secao" style={{ flex: 2, minWidth: 0 }}>
      <div className="secao-titulo">
        <h2>PISTAS COLETADAS</h2>
        <span className="texto">
          {achadas.length} de {caso.pistas.length}
        </span>
      </div>
      <ul className="pistas">
        {achadas.map((p) => (
          <li key={p.id} className={`pista ${p.importante ? 'importante' : ''}`}>
            <IconePista nome={p.icone} />
            <span className="pista-info">
              <span className="pista-nome">
                {p.nome}
                {p.importante && (
                  <Selo cor="var(--red)" texto="var(--white)">
                    IMPORTANTE
                  </Selo>
                )}
              </span>
              <span className="texto pista-desc">{p.descricao}</span>
              <span className="pista-origem">{origem(p.id)}</span>
            </span>
          </li>
        ))}
        {achadas.length < caso.pistas.length && (
          <li className="pista pista-falta">
            <span className="pista-interrogacao">?</span>
            <span className="texto">Ainda há pistas escondidas na cena e nos depoimentos.</span>
          </li>
        )}
      </ul>
    </section>
  );
}

function Diario({ caso, estado }: { caso: Caso; estado: EstadoCaso }) {
  const detetive = useDetetives();
  const [tudo, setTudo] = useState(false);
  const linhas = diario(caso, estado).reverse();
  const visiveis = tudo ? linhas : linhas.slice(0, 8);
  return (
    <section className="secao" style={{ flex: 1, minWidth: 0 }}>
      <div className="secao-titulo">
        <h2>DIÁRIO DO CASO</h2>
      </div>
      <div className="painel diario">
        {visiveis.length === 0 && (
          <p className="texto" style={{ color: 'var(--fog)' }}>
            Nada registrado ainda.
          </p>
        )}
        <ol>
          {visiveis.map((l) => {
            const cor = detetive(l.autor).cor;
            return (
              <li key={l.id} className="diario-linha">
                <span className="diario-marca" style={{ background: cor }} />
                <span className="diario-texto">
                  <span className="diario-quando">{tempoRelativo(l.em)}</span>
                  <span className="texto">
                    <b style={{ color: cor }}>@{l.autor}</b> {l.verbo} {l.obj && <span className="ambar-claro">{l.obj}</span>}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        {linhas.length > 8 && (
          <button className="ver-mais" onClick={() => setTudo(!tudo)}>
            {tudo ? 'MOSTRAR MENOS ▴' : `VER DIÁRIO COMPLETO (${linhas.length}) ▾`}
          </button>
        )}
      </div>
    </section>
  );
}
