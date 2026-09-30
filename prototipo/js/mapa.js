// GAROA — tela do mapa da cidade.
// Arte gerada por pixel.js (window.PX); camadas animadas por PX.live sobre assets/mapa-cidade.png.
(function () {
  const A = window.PX.get();
  const $ = (sel) => document.querySelector(sel);

  // ---------- Escala do palco (desenho em 1440×896) ----------
  const tela = $('#tela');
  const encaixar = () => {
    const s = Math.min(window.innerWidth / 1440, window.innerHeight / 896);
    tela.style.transform = 'scale(' + s + ')';
  };
  window.addEventListener('resize', encaixar);
  encaixar();

  // ---------- Sprites: <img data-art="grupo.nome"> ----------
  document.querySelectorAll('img[data-art]').forEach((img) => {
    const [grupo, nome] = img.dataset.art.split('.');
    img.src = A[grupo][nome];
  });

  // ---------- Dados (mock até existir backend) ----------
  const DESTAQUES = [
    { num: '#0412', local: 'CENTRO LUZ', status: 'EM ANDAMENTO', cor: '#4fd1c5', titulo: 'O Relógio Parado', nota: '@nevoeiro parou no interrogatório de Rui Toledo. Continue daí.', pct: 62 },
    { num: '#0421', local: 'ALTO DOS VIDROS', status: 'NOVO', cor: '#ffb43a', titulo: 'Apagão no Cine Estrela', nota: 'Ninguém entrou na cena ainda. Seja o primeiro a investigar.', pct: 0 },
    { num: '#0423', local: 'CENTRO LUZ', status: 'URGENTE', cor: '#e2433b', titulo: 'Ameaça no Jornal', nota: 'Carta anônima chegou à redação. Prazo: 48 horas.', pct: 10 }
  ];

  const EVENTOS = [
    { pt: 'ana', quem: 'lupa_ana', cor: '#4fd1c5', verbo: 'ligou', obj: 'Relógio parado → depoimento de Lúcia', caso: '#0412' },
    { pt: 'caju', quem: 'caju', cor: '#9b6b3d', verbo: 'adicionou a pista', obj: 'Recibo de penhor', caso: '#0412' },
    { pt: 'moreira', quem: 'sgt.moreira', cor: '#9e9fc9', verbo: 'abriu o caso', obj: 'Ameaça no Jornal', caso: '#0423' },
    { pt: 'nevoeiro', quem: 'nevoeiro', cor: '#9e9fc9', verbo: 'chegou ao', obj: 'Cais 7', caso: '#0419' },
    { pt: 'vega', quem: 'vega', cor: '#ffb43a', verbo: 'votou na teoria', obj: 'A hora foi forjada', caso: '#0412' },
    { pt: 'ana', quem: 'lupa_ana', cor: '#4fd1c5', verbo: 'encontrou uma digital no', obj: 'Cine Estrela', caso: '#0421' },
    { pt: 'caju', quem: 'caju', cor: '#9b6b3d', verbo: 'interrogou', obj: 'o violinista do Mercado', caso: '#0405' },
    { pt: 'moreira', quem: 'sgt.moreira', cor: '#9e9fc9', verbo: 'marcou um trecho do depoimento de', obj: 'Caio Mendes', caso: '#0412' }
  ];
  const IDADES = ['AGORA', 'HÁ 4 MIN', 'HÁ 38 MIN'];

  // ---------- Casos em destaque ----------
  $('#destaques').innerHTML = DESTAQUES.map((c) => `
    <li class="destaque" tabindex="0" style="--cor:${c.cor};">
      <div class="destaque-topo">
        <span class="destaque-local">${c.num} · ${c.local}</span>
        <span class="selo" style="background:${c.cor};">${c.status}</span>
      </div>
      <div class="destaque-titulo">${c.titulo}</div>
      <div class="destaque-nota">${c.nota}</div>
      <div class="barra" role="progressbar" aria-valuenow="${c.pct}" aria-valuemin="0" aria-valuemax="100"><div style="width:${c.pct}%;"></div></div>
    </li>`).join('');

  // ---------- Atividade recente (gira a cada 6,5s; o item novo pisca por 1,8s) ----------
  let n = 0;
  let novoTimer;
  const renderFeed = (novo) => {
    $('#feed').innerHTML = [0, 1, 2].map((i) => {
      const e = EVENTOS[((n - i) % EVENTOS.length + EVENTOS.length) % EVENTOS.length];
      return `
      <li class="feed-item${i === 0 && novo ? ' novo' : ''}">
        <div class="retrato"><img src="${A.pt[e.pt]}" alt=""></div>
        <div class="feed-texto">
          <div class="feed-frase"><span class="feed-quem" style="color:${e.cor};">@${e.quem}</span> ${e.verbo} <span class="feed-obj">${e.obj}</span></div>
          <span class="feed-meta">${e.caso} · ${IDADES[i]}</span>
        </div>
      </li>`;
    }).join('');
  };
  renderFeed(false);

  setInterval(() => {
    n += 1;
    $('#online').textContent = 11 + ((n * 7) % 5);
    renderFeed(true);
    clearTimeout(novoTimer);
    novoTimer = setTimeout(() => $('#feed .feed-item.novo')?.classList.remove('novo'), 1800);
  }, 6500);

  // ---------- Relógio do jogo (1 min a cada 20s) ----------
  let min = 14;
  setInterval(() => {
    min = (min + 1) % 60;
    $('#relogio').textContent = '23:' + String(min).padStart(2, '0');
  }, 20000);

  // ---------- Raio-X das camadas: abra com ?raiox=1 ----------
  if (new URLSearchParams(location.search).has('raiox')) $('#mapa').dataset.camadas = '1';

  // ---------- Camadas vivas (chuva, carros, pedestres, luzes, fumaça) ----------
  window.PX.live($('#mapa-vivo'), { src: '../src/arte/assets/mapa-cidade.png' });
})();
