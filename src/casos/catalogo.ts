// Catálogo: tudo que um caso pode referenciar. Dados puros (sem DOM), usados pelo
// esquema, pelo validador, pelo jogo e pela skill gerar-caso.

/** Paleta de 25 cores (mesmas chaves de P em arte/pixel.js). */
export const CORES = [
  'void', 'ink', 'night', 'deep', 'slate', 'dusk', 'haze', 'fog',
  'white', 'paper', 'paper2', 'paper3', 'cork', 'cork2',
  'amber', 'amberL', 'amberD', 'red', 'redD', 'teal', 'moss', 'leaf',
  'skin1', 'skin2', 'skin3',
] as const;
export type Cor = (typeof CORES)[number];

/** Ícones de pista 12×12 desenhados em arte/pixel.js. */
export const ICONES = {
  lupa: 'lupa, exame, algo observado de perto',
  digital: 'impressão digital, marca de dedo',
  pegada: 'pegadas, rastro no chão',
  chave: 'chave, fechadura, acesso',
  carta: 'carta, bilhete, documento escrito',
  relogio: 'relógio, horário',
  xicara: 'xícara, bebida, comida',
  recibo: 'recibo, conta, nota promissória, papel com valores',
  distintivo: 'distintivo policial, autoridade',
  alerta: 'contradição, depoimento importante',
  filme: 'rolo de filme, cinema',
  fusivel: 'fusível, eletricidade',
  ingresso: 'ingresso, tíquete de entrada',
} as const;
export type Icone = keyof typeof ICONES;
export const NOMES_ICONES = Object.keys(ICONES) as Icone[];

/** Retângulo [x, y, largura, altura] em px da cena exibida (640×384). */
export type Retangulo = [number, number, number, number];

export interface Ancora {
  descricao: string;
  /** Área do objeto: destaque tracejado ao examinar e recorte da foto no quadro. */
  alvo: Retangulo;
  /** Posição [x, y] do marcador numerado (24×24). */
  marca: [number, number];
}

export interface Cenario {
  nome: string;
  descricao: string;
  ancoras: Record<string, Ancora>;
  /** Personagens decorativos sobre a cena: sprite 16×24 exibido a 64×96. */
  figurantes: { sprite: 'detLupa' | 'pol' | 'civ' | 'civ2'; x: number; y: number }[];
}

export const CENARIOS: Record<string, Cenario> = {
  'quarto-hotel': {
    nome: 'Quarto de hotel',
    descricao: 'Quarto antigo com relógio de parede, mesa com gaveta, janela para a escada de incêndio e contorno de giz no chão.',
    ancoras: {
      relogio: { descricao: 'relógio de parede redondo', alvo: [248, 56, 112, 80], marca: [292, 36] },
      janela: { descricao: 'janela com cortinas, dá para a escada de incêndio', alvo: [400, 32, 176, 184], marca: [552, 44] },
      quadro: { descricao: 'quadro pendurado na parede', alvo: [12, 48, 72, 88], marca: [64, 36] },
      luminaria: { descricao: 'luminária acesa sobre a mesa', alvo: [72, 136, 80, 60], marca: [100, 116] },
      mesa: { descricao: 'papéis em cima da mesa', alvo: [140, 176, 64, 28], marca: [160, 156] },
      gaveta: { descricao: 'gavetas da mesa', alvo: [56, 224, 176, 56], marca: [124, 236] },
      corpo: { descricao: 'contorno de giz da vítima no chão', alvo: [264, 296, 176, 76], marca: [360, 288] },
      pegadas: { descricao: 'marcas no chão entre a janela e o centro do quarto', alvo: [436, 304, 128, 28], marca: [520, 280] },
      cadeira: { descricao: 'cadeira tombada', alvo: [472, 264, 64, 76], marca: [548, 244] },
      xicara: { descricao: 'xícara quebrada perto do corpo', alvo: [400, 352, 48, 24], marca: [412, 332] },
      'papel-chao': { descricao: 'papel amassado no chão', alvo: [196, 340, 36, 24], marca: [200, 316] },
    },
    figurantes: [
      { sprite: 'detLupa', x: 100, y: 276 },
      { sprite: 'pol', x: 556, y: 248 },
    ],
  },
  'sala-cinema': {
    nome: 'Sala de cinema',
    descricao: 'Sala de cinema às escuras: tela apagada, cortinas, palco com escada, quadro de força na parede, porta de saída e fileiras de poltronas.',
    ancoras: {
      tela: { descricao: 'tela de projeção apagada', alvo: [144, 24, 352, 136], marca: [460, 28] },
      cortina: { descricao: 'cortina vermelha à esquerda do palco', alvo: [104, 8, 40, 184], marca: [96, 100] },
      palco: { descricao: 'beira do palco', alvo: [160, 160, 320, 48], marca: [260, 172] },
      escada: { descricao: 'escada encostada no palco, à direita', alvo: [544, 40, 40, 168], marca: [516, 112] },
      'quadro-forca': { descricao: 'quadro de força aberto na parede direita', alvo: [592, 56, 40, 64], marca: [596, 28] },
      saida: { descricao: 'porta de saída lateral com barra de empurrar', alvo: [8, 52, 56, 156], marca: [24, 24] },
      poltrona: { descricao: 'poltrona da fileira do meio', alvo: [436, 276, 32, 20], marca: [452, 252] },
      corredor: { descricao: 'corredor entre as poltronas', alvo: [296, 328, 48, 48], marca: [340, 300] },
    },
    figurantes: [
      { sprite: 'detLupa', x: 168, y: 276 },
      { sprite: 'pol', x: 580, y: 264 },
    ],
  },
};
export const NOMES_CENARIOS = Object.keys(CENARIOS);

/** Bairros do mapa e a área (1024×832) onde os marcadores de cada um devem ficar. */
export const BAIRROS: Record<string, Retangulo> = {
  'CENTRO LUZ': [250, 240, 450, 280],
  'ALTO DOS VIDROS': [560, 40, 420, 260],
  'CAIS VELHO': [0, 560, 420, 200],
  'VILA NEBLINA': [0, 0, 300, 320],
};
export const NOMES_BAIRROS = Object.keys(BAIRROS);

/** Área útil do mapa para o marcador (48×72). */
export const MAPA = { largura: 1024, altura: 832, marcador: { largura: 48, altura: 72 } };

/** Cena exibida: 160×96 px de arte a 4×. */
export const CENA = { largura: 640, altura: 384 };

/** Quadro de cortiça. */
export const QUADRO = { largura: 1008, altura: 800 };

export interface Aparencia {
  pele: 'clara' | 'media' | 'escura';
  cabelo: 'curto' | 'longo' | 'coque' | 'careca';
  corCabelo: Cor;
  casaco: Cor;
  camisa: Cor;
  gravata?: Cor;
  chapeu?: Cor;
  faixaChapeu?: Cor;
  oculos?: boolean;
  bigode?: boolean;
  brinco?: boolean;
  labios?: Cor;
  sobrancelha?: Cor;
}

export interface Detetive {
  handle: string;
  /** Cor do autor: faixa das notas, alfinetes, nome no feed. */
  cor: string;
  aparencia: Aparencia;
}

/** Detetives simulados do marco 1 (autores de coopSimulado). */
export const DETETIVES_SIMULADOS: Record<string, Detetive> = {
  lupa_ana: { handle: 'lupa_ana', cor: '#4fd1c5', aparencia: { pele: 'clara', cabelo: 'curto', corCabelo: 'amberD', oculos: true, casaco: 'teal', camisa: 'paper' } },
  caju: { handle: 'caju', cor: '#9b6b3d', aparencia: { pele: 'escura', cabelo: 'curto', corCabelo: 'void', chapeu: 'cork', faixaChapeu: 'void', casaco: 'cork2', camisa: 'paper', gravata: 'red' } },
  nevoeiro: { handle: 'nevoeiro', cor: '#9e9fc9', aparencia: { pele: 'clara', cabelo: 'curto', corCabelo: 'fog', sobrancelha: 'haze', chapeu: 'haze', casaco: 'haze', camisa: 'white' } },
  'sgt.moreira': { handle: 'sgt.moreira', cor: '#d0bf99', aparencia: { pele: 'media', cabelo: 'curto', corCabelo: 'void', bigode: true, chapeu: 'void', faixaChapeu: 'slate', casaco: 'slate', camisa: 'paper', gravata: 'void' } },
};
export const HANDLES_SIMULADOS = Object.keys(DETETIVES_SIMULADOS) as [string, ...string[]];

/** Visuais que o jogador pode escolher na primeira visita. */
export const VISUAIS_JOGADOR: Record<string, Aparencia> = {
  vega: { pele: 'media', cabelo: 'longo', corCabelo: 'void', chapeu: 'slate', faixaChapeu: 'amber', casaco: 'paper3', camisa: 'paper2', labios: 'redD' },
  brasa: { pele: 'escura', cabelo: 'coque', corCabelo: 'void', casaco: 'redD', camisa: 'paper', brinco: true },
  lince: { pele: 'clara', cabelo: 'curto', corCabelo: 'cork2', chapeu: 'moss', faixaChapeu: 'teal', casaco: 'moss', camisa: 'paper', gravata: 'amber' },
  corvo: { pele: 'media', cabelo: 'curto', corCabelo: 'void', chapeu: 'void', faixaChapeu: 'red', casaco: 'deep', camisa: 'paper2', gravata: 'red', oculos: true },
};
export const COR_JOGADOR = '#ffb43a';
