// 05 Acusação (culpado + motivo + evidência, 3 tentativas) e 05B relatório final.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { arteFixa } from '../arte/sprites';
import type { Caso } from '../casos/esquema';
import { useAcoes, useCasoPrivado, useCasos, useDetetives, useEstadoCaso, useJogador, usePrivado, useXpTotal } from '../dados/contexto';
import type { EstadoCaso } from '../jogo/estado';
import type { CasoPrivado } from '../jogo/privado';
import { MAX_TENTATIVAS, detetivesNoCaso } from '../jogo/regras';
import { nivel, xpNoCaso, xpResolucao } from '../jogo/xp';
import { Botao, Icone, IconePista, Painel, Retrato, Rosto } from '../ui/base';
import { dataCarimbo, plural } from '../ui/formatar';
import { Janela } from '../ui/Janela';
import { Palco } from '../ui/Palco';
import { TopoTrilha } from '../ui/Topo';
import './acusacao.css';

export default function Acusacao({ caso }: { caso: Caso }) {
  const cp = useCasoPrivado(caso.id);
  const estado = useEstadoCaso(caso);
  const fechado = cp.status !== 'aberto';
  return (
    <Palco altura={900}>
      <TopoTrilha
        trilha={[
          { rotulo: `CASO #${caso.id}`, para: `/caso/${caso.id}` },
          { rotulo: fechado ? (cp.status === 'resolvido' ? 'RESOLVIDO' : 'ARQUIVADO') : 'ACUSAÇÃO' },
        ]}
      />
      {fechado ? <Resolvido caso={caso} estado={estado} cp={cp} /> : <Formulario caso={caso} estado={estado} cp={cp} />}
    </Palco>
  );
}

function Formulario({ caso, estado, cp }: { caso: Caso; estado: EstadoCaso; cp: CasoPrivado }) {
  const { acusar } = useAcoes();
  const [suspeito, setSuspeito] = useState<string | null>(null);
  const [motivo, setMotivo] = useState<string | null>(null);
  const [evidencia, setEvidencia] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  const evidencias = caso.pistas.filter((p) => estado.pistas.has(p.id));
  const restantes = MAX_TENTATIVAS - cp.tentativas.length;
  const ultima = cp.tentativas.at(-1);
  const s = caso.suspeitos.find((x) => x.id === suspeito);
  const m = caso.motivos.find((x) => x.id === motivo);
  const e = caso.pistas.find((x) => x.id === evidencia);
  const pronta = s && m && e;

  const enviar = () => {
    setConfirmar(false);
    if (!s || !m || !e) return;
    acusar(caso, { suspeito: s.id, motivo: m.id, evidencia: e.id });
  };

  return (
    <div className="acusacao">
      <div className="acusacao-topo">
        <div>
          <span className="acusacao-rotulo">ACUSAÇÃO FORMAL</span>
          <h1>{caso.acusacao}</h1>
        </div>
        <p className="texto">Sua acusação fica selada. Ninguém da equipe vê sua resposta até o caso ser resolvido.</p>
      </div>

      <div className="acusacao-grade">
        <Painel titulo={<Passo n={1}>CULPADO</Passo>} sombra className="acusacao-painel">
          <div className="escolha-suspeitos" role="radiogroup" aria-label="Culpado">
            {caso.suspeitos.map((x) => (
              <button key={x.id} role="radio" aria-checked={suspeito === x.id} className={`opcao opcao-suspeito ${suspeito === x.id ? 'sel' : ''}`} onClick={() => setSuspeito(x.id)}>
                <Retrato aparencia={x.aparencia} alt="" />
                <span>{x.nome}</span>
                {suspeito === x.id && <span className="tag-escolhida">✓ {x.genero === 'f' ? 'ESCOLHIDA' : 'ESCOLHIDO'}</span>}
              </button>
            ))}
          </div>
        </Painel>
        <Painel titulo={<Passo n={2}>MOTIVO</Passo>} sombra className="acusacao-painel">
          <div className="escolha-lista" role="radiogroup" aria-label="Motivo">
            {caso.motivos.map((x) => (
              <button key={x.id} role="radio" aria-checked={motivo === x.id} className={`opcao opcao-motivo ${motivo === x.id ? 'sel' : ''}`} onClick={() => setMotivo(x.id)}>
                <span className="radio">
                  <span />
                </span>
                <span className="texto">{x.texto}</span>
              </button>
            ))}
          </div>
        </Painel>
        <Painel titulo={<Passo n={3}>EVIDÊNCIA PRINCIPAL</Passo>} sombra className="acusacao-painel">
          <div className="escolha-evidencias" role="radiogroup" aria-label="Evidência principal">
            {!evidencias.length && <p className="texto sem-evidencia">Nenhuma pista encontrada ainda. Examine a cena e interrogue os suspeitos antes de acusar.</p>}
            {evidencias.map((x) => (
              <button key={x.id} role="radio" aria-checked={evidencia === x.id} className={`opcao opcao-evidencia ${evidencia === x.id ? 'sel' : ''}`} onClick={() => setEvidencia(x.id)}>
                <Icone nome={x.icone} />
                <span>{x.nome}</span>
              </button>
            ))}
          </div>
        </Painel>
      </div>

      <div className="acusacao-rodape">
        <div className="papel sua-acusacao">
          <span className="acusacao-rotulo">SUA ACUSAÇÃO</span>
          <p className="texto">
            Acuso <b>{s ? s.nome.toUpperCase() : '________'}</b> no caso {caso.titulo}. Motivo: <b>{m ? m.texto.toLowerCase() : '________'}</b>. Prova principal:{' '}
            <b>{e ? e.nome.toLowerCase() : '________'}</b>.
          </p>
        </div>
        <div className="acusacao-envio">
          <div className="tentativas">
            <Icone nome="alerta" tamanho={24} />
            <span>
              {restantes} DE {MAX_TENTATIVAS} {restantes === 1 ? 'TENTATIVA RESTANTE' : 'TENTATIVAS RESTANTES'}
            </span>
          </div>
          {ultima && (
            <p className="texto ultima-tentativa" role="status">
              O delegado não se convenceu da última acusação: {plural(ultima.acertos, 'elemento estava certo', 'elementos estavam certos')}.
            </p>
          )}
          <Botao variante="alerta" tamanho="grande" largo disabled={!pronta} onClick={() => setConfirmar(true)}>
            ENVIAR SOLUÇÃO
          </Botao>
        </div>
      </div>

      {confirmar && pronta && (
        <Janela titulo="ENVIAR ACUSAÇÃO?" aoFechar={() => setConfirmar(false)}>
          <p className="texto" style={{ fontSize: 15, lineHeight: 1.6 }}>
            Você acusa <b>{s.nome}</b>, por <b>{m.texto.toLowerCase()}</b>, com a prova <b>{e.nome.toLowerCase()}</b>.
          </p>
          <p className="texto" style={{ fontSize: 14, color: 'var(--fog)' }}>
            {restantes === 1 ? 'É a sua última tentativa. Se errar, o caso é arquivado para você e a solução é revelada.' : `Depois desta, restam ${restantes - 1} tentativas.`}
          </p>
          <div className="janela-acoes">
            <Botao onClick={() => setConfirmar(false)}>REVISAR</Botao>
            <Botao variante="alerta" onClick={enviar}>
              ACUSAR
            </Botao>
          </div>
        </Janela>
      )}
    </div>
  );
}

const Passo = ({ n, children }: { n: number; children: string }) => (
  <span className="passo">
    <span>{n}</span>
    {children}
  </span>
);

/** A contribuição mais marcante de um detetive no caso, para os créditos. */
function destaque(caso: Caso, estado: EstadoCaso, handle: string) {
  const importante = caso.pistas.find((p) => p.importante && estado.pistas.get(p.id)?.autor === handle);
  if (importante) return `Achou ${importante.nome.toLowerCase()}`;
  const fios = [...estado.fios.values()].filter((f) => f.autor === handle).length;
  if (fios >= 2) return `${fios} conexões no quadro`;
  const teoria = [...estado.teorias.values()].find((t) => t.autor === handle);
  if (teoria) return `Teoria “${teoria.titulo}”`;
  const pista = caso.pistas.find((p) => estado.pistas.get(p.id)?.autor === handle);
  if (pista) return `Achou ${pista.nome.toLowerCase()}`;
  const interrogou = caso.suspeitos.filter((s) => s.perguntas.some((p) => estado.perguntas.get(`${s.id}/${p.id}`)?.autor === handle));
  if (interrogou.length) return `Interrogou ${interrogou.map((s) => s.curto).join(' e ')}`;
  return 'Acompanhou o caso';
}

function Resolvido({ caso, estado, cp }: { caso: Caso; estado: EstadoCaso; cp: CasoPrivado }) {
  const eu = useJogador();
  const detetive = useDetetives();
  const casos = useCasos();
  const privado = usePrivado();
  const navegar = useNavigate();
  const culpado = caso.suspeitos.find((s) => s.id === caso.solucao.culpado)!;
  const resolvido = cp.status === 'resolvido';

  const handles = new Set(detetivesNoCaso(caso, estado).map((d) => d.handle));
  if (eu) handles.add(eu.handle);
  const bonus = xpResolucao(caso, cp);
  const creditos = [...handles]
    .map((h) => ({
      handle: h,
      xp: xpNoCaso(estado, h) + (h === eu?.handle ? bonus : 0),
      oque: h === eu?.handle && resolvido ? 'Acusação final' : destaque(caso, estado, h),
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 6);
  const meuXp = eu ? xpNoCaso(estado, eu.handle) + bonus : 0;
  const proximo = casos.find((c) => c.id !== caso.id && (privado.casos[c.id]?.status ?? 'aberto') === 'aberto');

  return (
    <div className="relatorio-final">
      <div className="arquivo">
        <div className="arquivo-aba">ARQUIVO · #{caso.id}</div>
        <div className="arquivo-folha">
          <div className="arquivo-culpado">
            <Retrato aparencia={culpado.aparencia} tamanho={256} alt={culpado.nome} />
            <span className="arquivo-tag">{culpado.genero === 'f' ? 'CULPADA' : 'CULPADO'}</span>
            <span className="arquivo-nome">{culpado.nome}</span>
          </div>
          <div className="arquivo-relatorio">
            <span className="acusacao-rotulo">RELATÓRIO FINAL</span>
            <h1>{caso.titulo}</h1>
            {caso.solucao.relatorio.map((p, i) => (
              <p key={i} className="texto">
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className={`carimbo ${resolvido ? '' : 'arquivado'}`} aria-label={resolvido ? 'Caso resolvido' : 'Caso arquivado'}>
          <div className="carimbo-dentro">
            <span className="carimbo-caso">CASO</span>
            <span className="carimbo-titulo">{resolvido ? 'RESOLVIDO' : 'ARQUIVADO'}</span>
            <span className="carimbo-data">{dataCarimbo(cp.fechadoEm ?? Date.now())}</span>
            <img src={arteFixa().wear} alt="" />
          </div>
        </div>
      </div>

      <aside className="resolvido-lateral">
        <Painel titulo="CRÉDITOS DA INVESTIGAÇÃO">
          <ul className="creditos">
            {creditos.map((c) => {
              const d = detetive(c.handle);
              return (
                <li key={c.handle}>
                  <Rosto aparencia={d.aparencia} tamanho={40} />
                  <span className="credito-texto">
                    <span style={{ color: d.cor }}>@{c.handle}</span>
                    <span className="texto">{c.oque}</span>
                  </span>
                  <span className="credito-xp">+{c.xp}</span>
                </li>
              );
            })}
          </ul>
        </Painel>
        <div className="xp-ganho">
          <IconePista nome={resolvido ? 'distintivo' : 'alerta'} caixa={64} />
          <div>
            <span className="acusacao-rotulo" style={{ color: 'var(--amber)' }}>
              {resolvido ? 'XP GANHO NESTE CASO' : 'SEM BÔNUS DE RESOLUÇÃO'}
            </span>
            <span className="xp-valor">+{meuXp} XP</span>
            <span className="texto xp-nota">
              {resolvido
                ? `${plural(cp.tentativas.length, 'tentativa', 'tentativas')} · bônus de resolução +${bonus}`
                : 'Suas 3 tentativas acabaram. O XP da investigação continua seu.'}
            </span>
          </div>
        </div>
        <NivelAtual />
        <div className="resolvido-acoes">
          <Botao onClick={() => navegar(`/caso/${caso.id}`)} style={{ flex: 1 }}>
            VER CASO
          </Botao>
          {proximo ? (
            <Botao variante="primario" onClick={() => navegar(`/caso/${proximo.id}`)} style={{ flex: 1 }}>
              PRÓXIMO CASO ▸
            </Botao>
          ) : (
            <Botao variante="primario" onClick={() => navegar('/')} style={{ flex: 1 }}>
              VOLTAR AO MAPA
            </Botao>
          )}
        </div>
      </aside>
    </div>
  );
}

function NivelAtual() {
  const n = nivel(useXpTotal());
  return (
    <div className="nivel-atual">
      <span>
        NÍVEL {n.nivel} · {n.rank}
      </span>
      <span>
        {n.xp}/{n.proximo} XP
      </span>
    </div>
  );
}
