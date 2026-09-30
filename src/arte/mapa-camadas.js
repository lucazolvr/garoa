// GAROA — mapa em camadas (formato estilo Tiled). Coordenadas em px da arte 1536×1024 (grade de 16px = 96×64 tiles).
// Ordem de desenho: chao → fx_chao → objetos (Y-sort junto com sprites, pela linha de base) → teto → clima.
// Um objeto é recortado da própria arte e redesenhado por cima de qualquer sprite cujo pé esteja ACIMA da sua base.
export const MAPA_GAROA = {
  orientation: 'orthogonal', renderorder: 'y-sort',
  tilewidth: 16, tileheight: 16, width: 96, height: 64,
  tileset: { image: 'assets/mapa-cidade.png', columns: 96, tilecount: 6144 },
  layers: [
    { name: 'chao', type: 'imagelayer', image: 'assets/mapa-cidade.png' },
    { name: 'fx_chao', type: 'fx', items: ['janelas', 'agua'] },
    { name: 'objetos', type: 'objectgroup', ysort: true, objects: [
      // Rua norte (Solar Reis)
      { name: 'predio-esquina-norte', base: 400, rects: [[455,230,68,110]] },
      { name: 'sobrado-rua-norte', base: 380, rects: [[305,271,67,70]] },
      { name: 'torre-igreja', base: 380, rects: [[40,258,30,82]] },
      { name: 'chamine-a', base: 370, rects: [[115,282,16,58]] },
      { name: 'chamine-b', base: 370, rects: [[205,277,27,63]] },
      { name: 'poste-rn-1', base: 272, rects: [[172,254,9,18]] },
      { name: 'poste-rn-2', base: 272, rects: [[216,244,9,28]] },
      { name: 'poste-rn-3', base: 272, rects: [[435,224,9,48]] },
      { name: 'poste-rn-4', base: 332, rects: [[257,284,11,48]] },
      // Rua do Cinema
      { name: 'poste-cine-1', base: 590, rects: [[98,540,9,50]] },
      { name: 'poste-cine-2', base: 590, rects: [[206,540,9,50]] },
      // Avenida central — calçada sul
      { name: 'poste-av-1', base: 660, rects: [[661,575,9,85]] },
      { name: 'poste-av-2', base: 660, rects: [[781,628,9,32]] },
      { name: 'poste-av-3', base: 660, rects: [[946,625,9,35]] },
      { name: 'poste-av-4', base: 660, rects: [[1088,625,9,35]] },
      { name: 'poste-av-5', base: 660, rects: [[1108,605,9,55]] },
      { name: 'poste-av-6', base: 652, rects: [[1474,605,9,47]] },
      { name: 'fabrica-lume', base: 900, rects: [[1229,626,100,134]] },
      { name: 'tanque-lume', base: 900, rects: [[1410,624,39,76]] },
      // Ponte da Garoa
      { name: 'torre-ponte-oeste', base: 915, rects: [[670,628,18,14],[655,642,47,273]] },
      { name: 'torre-ponte-leste', base: 915, rects: [[1002,636,16,10],[988,646,44,269]] },
      { name: 'poste-ponte-1', base: 836, rects: [[753,795,9,41]] },
      { name: 'poste-ponte-2', base: 836, rects: [[918,795,9,41]] },
      { name: 'poste-ponte-3', base: 836, rects: [[1138,795,9,41]] },
      // Docas
      { name: 'galpao-docas', base: 835, rects: [[355,775,41,60]] },
      { name: 'conteiner', base: 830, rects: [[397,795,38,35]] },
      { name: 'poste-docas', base: 835, rects: [[436,772,8,63]] }
    ]},
    { name: 'rotas', type: 'objectgroup', objects: {
      carros: [
        { y: 606, x0: 440, x1: 1536, d: -1, n: 3 }, { y: 624, x0: 440, x1: 1536, d: 1, n: 3 },
        { y: 579, x0: 0, x1: 440, d: 1, n: 2 }, { y: 597, x0: 0, x1: 440, d: -1, n: 1 },
        { y: 266, x0: 0, x1: 470, d: 1, n: 2 }, { y: 282, x0: 0, x1: 470, d: -1, n: 1 },
        { y: 786, x0: 640, x1: 1150, d: 1, n: 2 }, { y: 800, x0: 640, x1: 1150, d: -1, n: 1 },
        { y: 782, x0: 390, x1: 650, d: -1, n: 1 }
      ],
      carrosV: [ { x: 414, y0: 300, y1: 600, d: 1 }, { x: 924, y0: 300, y1: 600, d: -1 } ],
      pedestres: [
        { y: 588, x0: 460, x1: 1400 }, { y: 642, x0: 720, x1: 1150 }, { y: 766, x0: 704, x1: 1140 },
        { y: 552, x0: 0, x1: 400 }, { y: 818, x0: 300, x1: 640 }, { y: 244, x0: 0, x1: 440 }
      ],
      barco: { y: 918, x0: -80, x1: 1120, v: 18 }
    }},
    { name: 'teto', type: 'fx', items: ['sirenes', 'roda-gigante', 'holofotes', 'fumaca'] },
    { name: 'clima', type: 'fx', items: ['chuva'] }
  ]
};
