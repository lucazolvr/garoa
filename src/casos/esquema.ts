// Esquema do arquivo de caso e dos eventos do jogo. Fonte única: valida os casos no
// jogo e gera o JSON Schema que a skill gerar-caso entrega ao agente.
import { z } from 'zod';
import { CORES, NOMES_ICONES, NOMES_CENARIOS, NOMES_BAIRROS, HANDLES_SIMULADOS, QUADRO } from './catalogo';

const Id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'use kebab-case: letras minúsculas, números e hífens');
const Texto = z.string().trim().min(1);
const Cor = z.enum(CORES);

/** Referência a um item do quadro de investigação. */
export const RefItem = z
  .string()
  .regex(/^(vitima|(suspeito|pista|nota|cena|recorte):[a-z0-9]+(-[a-z0-9]+)*)$/, 'use vitima, suspeito:<id>, pista:<id>, nota:<id>, cena:<ancora> ou recorte:<id>');

const X = z.int().min(0).max(QUADRO.largura - 40).describe('px no quadro (1008×800)');
const Y = z.int().min(0).max(QUADRO.altura - 40).describe('px no quadro (1008×800)');

export const Aparencia = z.object({
  pele: z.enum(['clara', 'media', 'escura']),
  cabelo: z.enum(['curto', 'longo', 'coque', 'careca']),
  corCabelo: Cor,
  casaco: Cor,
  camisa: Cor,
  gravata: Cor.optional(),
  chapeu: Cor.optional(),
  faixaChapeu: Cor.optional(),
  oculos: z.boolean().optional(),
  bigode: z.boolean().optional(),
  brinco: z.boolean().optional(),
  labios: Cor.optional(),
  sobrancelha: Cor.optional(),
});

// ---------- Eventos (o que um detetive faz num caso) ----------

export const DadosEvento = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('examinou'), ancora: Id }),
  z.object({ tipo: z.literal('perguntou'), suspeito: Id, pergunta: Id }),
  z.object({ tipo: z.literal('marcou-trecho'), suspeito: Id, pergunta: Id, trecho: z.int().min(0).describe('índice da frase em resposta') }),
  z.object({ tipo: z.literal('pausou'), suspeito: Id }),
  z.object({ tipo: z.literal('nota'), nota: Id, texto: z.string().trim().min(1).max(280), x: X, y: Y }),
  z.object({ tipo: z.literal('pista-no-quadro'), pista: Id, x: X, y: Y }),
  z.object({ tipo: z.literal('foto-cena'), ancora: Id, legenda: z.string().trim().min(1).max(40), x: X, y: Y }),
  z.object({ tipo: z.literal('recorte'), recorte: Id, fonte: Texto, titulo: Texto, texto: Texto, x: X, y: Y }),
  z.object({ tipo: z.literal('item-movido'), item: RefItem, x: X, y: Y }),
  z.object({ tipo: z.literal('item-removido'), item: RefItem }),
  z.object({ tipo: z.literal('fio'), de: RefItem, para: RefItem }),
  z.object({ tipo: z.literal('fio-removido'), de: RefItem, para: RefItem }),
  z.object({
    tipo: z.literal('teoria'),
    teoria: Id,
    titulo: z.string().trim().min(1).max(60),
    texto: z.string().trim().min(1).max(280),
    suspeito: Id.optional().describe('suspeito que a teoria aponta, se houver'),
    votosBase: z.int().min(0).default(0).describe('votos de outros detetives fora da simulação'),
  }),
  z.object({ tipo: z.literal('voto'), teoria: Id, valor: z.union([z.literal(-1), z.literal(0), z.literal(1)]) }),
]);
export type DadosEvento = z.infer<typeof DadosEvento>;

/** Evento gravado: quem fez e quando. */
export const Evento = z.intersection(
  DadosEvento,
  z.object({ id: z.string().min(1), autor: z.string().min(1), em: z.number() }),
);
export type Evento = z.infer<typeof Evento>;

const EventoSimulado = z.intersection(
  DadosEvento,
  z.object({
    autor: z.enum(HANDLES_SIMULADOS),
    minutosAtras: z.int().min(0).describe('há quantos minutos, contados a partir da primeira visita do jogador'),
  }),
);

// ---------- Caso ----------

export const Pergunta = z.object({
  id: Id,
  texto: Texto.describe('o que o detetive pergunta; em perguntas com "mostra", o nome da pista já aparece como MOSTRAR <pista>'),
  resposta: z.array(Texto).min(1).describe('uma frase por item: cada frase pode ser marcada como trecho'),
  requer: z.array(Id).default([]).describe('pistas necessárias para a pergunta aparecer liberada'),
  mostra: Id.optional().describe('pista mostrada ao suspeito; conta como exigida'),
  revela: z.array(Id).default([]).describe('pistas que a resposta revela'),
  tensao: z.enum(['baixa', 'media', 'alta']),
});

export const Suspeito = z.object({
  id: Id,
  nome: Texto,
  curto: Texto.describe('nome curto para a etiqueta do diálogo e o quadro, ex.: "Rui"'),
  papel: Texto.describe('ex.: "Gerente do hotel"'),
  genero: z.enum(['f', 'm']),
  alibi: Texto,
  abertura: z.array(Texto).min(1).describe('fala inicial, antes da primeira pergunta'),
  aparencia: Aparencia,
  perguntas: z.array(Pergunta).min(3).max(6),
});

export const Pista = z.object({
  id: Id,
  nome: z.string().trim().min(1).max(28),
  descricao: Texto,
  icone: z.enum(NOMES_ICONES as [string, ...string[]]),
  importante: z.boolean().default(false),
});

export const Caso = z.object({
  id: z.string().regex(/^\d{4}$/, 'quatro dígitos, ex.: "0412"'),
  titulo: z.string().trim().min(1).max(32),
  bairro: z.enum(NOMES_BAIRROS as [string, ...string[]]),
  local: Texto.describe('ex.: "Hotel Alvorada"'),
  dificuldade: z.int().min(1).max(5),
  urgente: z.boolean().default(false),
  mapa: z.object({ x: z.int().min(0).max(976), y: z.int().min(0).max(760) }).describe('canto superior esquerdo do marcador no mapa (1024×832)'),
  resumo: Texto.describe('1 ou 2 frases para o cartão do mapa'),
  relatorio: z.array(Texto).min(1).describe('relatório policial, um parágrafo por item'),
  acusacao: Texto.describe('pergunta da tela de acusação, ex.: "Quem parou o relógio?"'),
  vitima: z.object({ nome: Texto, curto: Texto, aparencia: Aparencia }),
  cena: z.object({
    cenario: z.enum(NOMES_CENARIOS as [string, ...string[]]),
    titulo: Texto.describe('ex.: "QUARTO 304"'),
    contexto: Texto.describe('linha abaixo da cena, ex.: "Encontrado às 23:40 · chuva forte"'),
    pontos: z
      .array(z.object({ ancora: Id, texto: Texto.describe('o que o detetive vê ao examinar'), pista: Id.optional() }))
      .min(3),
  }),
  suspeitos: z.array(Suspeito).min(3).max(4),
  pistas: z.array(Pista).min(4),
  motivos: z.array(z.object({ id: Id, texto: z.string().trim().min(1).max(40) })).min(3).max(6),
  solucao: z.object({
    culpado: Id,
    motivo: Id,
    evidencias: z.array(Id).min(1).describe('pistas aceitas como evidência principal'),
    relatorio: z.array(Texto).min(1).describe('relatório final, um parágrafo por item'),
  }),
  coopSimulado: z
    .object({
      abertoPor: z.enum(HANDLES_SIMULADOS).optional(),
      eventos: z.array(EventoSimulado).default([]),
    })
    .default({ eventos: [] })
    .describe('o que os detetives simulados já fizeram no caso (substituído por jogadores reais no marco 2)'),
});
export type Caso = z.infer<typeof Caso>;
export type Suspeito = z.infer<typeof Suspeito>;
export type Pergunta = z.infer<typeof Pergunta>;
export type Pista = z.infer<typeof Pista>;
export type EventoSimulado = z.infer<typeof EventoSimulado>;
