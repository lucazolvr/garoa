// 06 Perfil do detetive: rank, números, casos fechados e contribuições.
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { marcador } from '../arte/sprites';
import { NOMES_ICONES } from '../casos/catalogo';
import { useCasos, useEstadosCasos, useJogador, usePrivado, useXpTotal } from '../dados/contexto';
import { chaveTrecho, totalVotos } from '../jogo/estado';
import { nivel } from '../jogo/xp';
import { Barra, Icone, IconePista, Painel, Retrato } from '../ui/base';
import { dataCarimbo, fmtNumero, mesAno, tempoRelativo } from '../ui/formatar';
import { Palco } from '../ui/Palco';
import { TopoTrilha } from '../ui/Topo';
import './perfil.css';

interface Contribuicao {
  id: string;
  em: number;
  icone: string;
  tipo: string;
  caso: string;
  texto: string;
  votos?: number;
}

export default function Perfil() {
  const eu = useJogador();
  const perfil = usePrivado().perfil;
  const privado = usePrivado();
  const casos = useCasos();
  const estados = useEstadosCasos();
  const xp = useXpTotal();

  const dados = useMemo(() => {
    if (!eu) return null;
    const meus = casos.flatMap((c) => estados.get(c.id)!.eventos.filter((e) => e.autor === eu.handle).map((e) => ({ caso: c, e })));
    const conta = (tipos: string[]) => meus.filter(({ e }) => tipos.includes(e.tipo)).length;
    const contribuicoes: Contribuicao[] = [];
    for (const { caso, e } of meus) {
      const rotuloCaso = `#${caso.id} ${caso.titulo.toUpperCase()}`;
      if (e.tipo === 'nota') contribuicoes.push({ id: e.id, em: e.em, icone: 'carta', tipo: 'NOTA', caso: rotuloCaso, texto: e.texto });
      if (e.tipo === 'teoria') {
        const t = estados.get(caso.id)!.teorias.get(e.teoria);
        contribuicoes.push({ id: e.id, em: e.em, icone: 'lupa', tipo: 'TEORIA', caso: rotuloCaso, texto: `${e.titulo}: ${e.texto}`, votos: t ? totalVotos(t) : 0 });
      }
      if (e.tipo === 'marcou-trecho') {
        const s = caso.suspeitos.find((x) => x.id === e.suspeito)!;
        const p = s.perguntas.find((x) => x.id === e.pergunta)!;
        if (estados.get(caso.id)!.trechos.get(chaveTrecho(s.id, p.id, e.trecho))?.autor === eu.handle) {
          contribuicoes.push({ id: e.id, em: e.em, icone: 'alerta', tipo: `TRECHO DE ${s.curto.toUpperCase()}`, caso: rotuloCaso, texto: p.resposta[e.trecho] });
        }
      }
    }
    for (const caso of casos) {
      for (const [id, reg] of estados.get(caso.id)!.pistas) {
        if (reg.autor !== eu.handle) continue;
        const p = caso.pistas.find((x) => x.id === id)!;
        contribuicoes.push({ id: `pista-${caso.id}-${id}`, em: reg.em, icone: p.icone, tipo: 'PISTA', caso: `#${caso.id} ${caso.titulo.toUpperCase()}`, texto: `${p.nome}: ${p.descricao}` });
      }
    }
    const especialidades = [
      conta(['examinou']) >= 3 && 'CENAS DO CRIME',
      conta(['perguntou']) >= 5 && 'INTERROGATÓRIOS',
      conta(['nota', 'fio', 'pista-no-quadro', 'foto-cena']) >= 3 && 'QUADRO',
      conta(['teoria']) >= 1 && 'TEORIAS',
    ].filter((x): x is string => !!x);
    const fechados = casos
      .filter((c) => privado.casos[c.id] && privado.casos[c.id].status !== 'aberto')
      .map((c) => ({ caso: c, cp: privado.casos[c.id] }))
      .sort((a, b) => (b.cp.fechadoEm ?? 0) - (a.cp.fechadoEm ?? 0));
    return {
      contribuicoes: contribuicoes.sort((a, b) => b.em - a.em),
      total: meus.length,
      teorias: conta(['teoria']),
      especialidades,
      fechados,
    };
  }, [eu, casos, estados, privado]);

  if (!eu || !perfil || !dados) return <Palco><TopoTrilha trilha={[{ rotulo: 'PERFIL' }]} /></Palco>;
  const n = nivel(xp);
  const resolvidos = dados.fechados.filter((f) => f.cp.status === 'resolvido').length;

  return (
    <Palco>
      <TopoTrilha trilha={[{ rotulo: 'PERFIL' }]} />
      <div className="perfil">
        <div className="perfil-esquerda">
          <section className="painel painel-sombra cartao-detetive">
            <Retrato aparencia={eu.aparencia} tamanho={256} alt="" />
            <h1>
              {n.rank} {eu.handle.toUpperCase()}
            </h1>
            <span className="texto perfil-desde">
              @{eu.handle} · detetive desde {mesAno(perfil.desde)}
            </span>
            <div className="rank">
              <Icone nome="distintivo" />
              <div className="rank-info">
                <div className="rank-linha">
                  <span style={{ color: 'var(--amber)' }}>RANK · NÍVEL {n.nivel}</span>
                  <span>
                    {fmtNumero(n.xp)}/{fmtNumero(n.proximo)}
                  </span>
                </div>
                <Barra pct={((n.xp - n.inicio) / (n.proximo - n.inicio)) * 100} cor="var(--amber)" segmento={16} fundo="var(--ink)" rotulo="XP até o próximo nível" />
                <span className="rank-proximo">{n.proximoRank ? `PRÓXIMO: ${n.proximoRank.nome} (NÍVEL ${n.proximoRank.nivel})` : 'RANK MÁXIMO'}</span>
              </div>
            </div>
            <div className="especialidades">
              {(dados.especialidades.length ? dados.especialidades : ['NOVATO NA CIDADE']).map((e) => (
                <span key={e}>{e}</span>
              ))}
            </div>
          </section>
          <div className="numeros">
            <div>
              <b style={{ color: 'var(--amber)' }}>{resolvidos}</b>
              <span>RESOLVIDOS</span>
            </div>
            <div>
              <b style={{ color: 'var(--teal)' }}>{dados.total}</b>
              <span>CONTRIBUIÇÕES</span>
            </div>
            <div>
              <b>{dados.teorias}</b>
              <span>TEORIAS</span>
            </div>
          </div>
        </div>

        <div className="perfil-meio">
          <Painel titulo="CASOS FECHADOS" extra={dados.fechados.length}>
            <ul className="fechados">
              {!dados.fechados.length && (
                <li className="texto perfil-vazio">
                  Nenhum caso fechado ainda. <Link to="/">O mapa espera.</Link>
                </li>
              )}
              {dados.fechados.map(({ caso, cp }) => (
                <li key={caso.id}>
                  <img src={marcador('resolvido')} alt="" />
                  <Link to={`/caso/${caso.id}/acusacao`} className="fechado-info">
                    <span>{caso.titulo}</span>
                    <span className="texto">
                      #{caso.id} · {caso.bairro} · {dataCarimbo(cp.fechadoEm ?? 0).toLowerCase()}
                    </span>
                  </Link>
                  <span className={`papel-caso ${cp.status}`}>{cp.status === 'resolvido' ? 'ACUSOU' : 'ARQUIVADO'}</span>
                </li>
              ))}
            </ul>
          </Painel>
          <Painel titulo="SUAS CONTRIBUIÇÕES" extra={dados.contribuicoes.length} className="contribuicoes">
            <ul>
              {!dados.contribuicoes.length && <li className="texto perfil-vazio">Examine cenas, interrogue suspeitos e deixe notas no quadro: tudo aparece aqui.</li>}
              {dados.contribuicoes.slice(0, 5).map((k) => (
                <li key={k.id} className="contribuicao">
                  <IconePista nome={k.icone} caixa={56} />
                  <div className="contribuicao-texto">
                    <span className="contribuicao-tipo">
                      {k.tipo} · {k.caso} · {tempoRelativo(k.em)}
                    </span>
                    <span className="texto">“{k.texto}”</span>
                  </div>
                  {k.votos !== undefined && <span className="contribuicao-votos">▲ {k.votos}</span>}
                </li>
              ))}
            </ul>
          </Painel>
        </div>

        <Painel titulo="CONQUISTAS" extra="EM BREVE" className="conquistas">
          <div className="conquistas-grade">
            {NOMES_ICONES.slice(0, 12).map((i) => (
              <div key={i} className="conquista" aria-hidden>
                <span>
                  <Icone nome={i} style={{ opacity: 0.15 }} />
                </span>
                ???
              </div>
            ))}
          </div>
        </Painel>
      </div>
    </Palco>
  );
}
