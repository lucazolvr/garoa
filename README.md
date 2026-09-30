# GAROA · Detetives em Rede

Jogo cooperativo de mistérios numa cidade noir em pixel art. Cada caso é um ponto no mapa: você examina a cena, interroga suspeitos, monta o quadro de investigação com outros detetives e faz a acusação.

**Marco 1 (atual):** jogável sozinho no navegador. Os "outros detetives" são simulados e o progresso fica salvo no navegador. O código já separa o estado compartilhado do caso do estado privado do jogador, para o marco 2 (multiplayer com Supabase) trocar só a camada de dados.

## Rodar

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar. Em `#/?raiox=1`, o mapa mostra as camadas de debug da animação.

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | checa os tipos e gera `dist/` (site estático) |
| `npm test` | testes (regras, validador, repositório) |
| `npm run validar-caso [arquivo]` | valida todos os casos, ou só o arquivo informado |
| `npm run esquema` | regera `docs/caso.schema.json` a partir do esquema Zod |
| `npm run catalogo` | lista cenários, âncoras, ícones, bairros e casos existentes |

## Criar um caso novo

No Claude Code, dentro desta pasta:

```
/gerar-caso um sumiço no porto durante a regata
```

A skill (`.claude/skills/gerar-caso`) escreve o JSON em `src/casos/dados/`, roda o validador até passar e mostra um resumo para você revisar. Também dá para escrever à mão seguindo `docs/caso.schema.json` e os dois casos de exemplo.

O validador reprova um caso quando: uma referência não existe; o culpado não é um suspeito; o motivo certo não está nas opções; uma pista ou pergunta nunca pode ser alcançada (ele simula o jogo); a evidência aceita não pode ser obtida; ou os eventos simulados são jogadas impossíveis. Caso inválido não quebra o jogo: fica fora do mapa, com o motivo no console.

## Estrutura

```
src/
  arte/      pixel.js (sprites, retratos, cenários, mapa animado) e acesso tipado
  casos/     esquema Zod, catálogo, validador, carregamento e os casos (dados/*.json)
  jogo/      regras puras: estado derivado dos eventos, acusação, XP, diário, quadro
  dados/     repositório (localStorage no marco 1) e hooks React
  ui/        peças do guia de estilo: botão, painel, retrato, topo, janela, avisos
  telas/     mapa, caso, interrogatório, quadro, acusação, perfil
ferramentas/ validar-caso, exportar-esquema, catalogo
design/      protótipos originais do Claude Design
prototipo/   primeira versão estática do mapa (referência)
docs/        design do marco 1 e o JSON Schema dos casos
```

O estado de um caso é a **soma dos eventos** (examinou, perguntou, nota, fio, teoria, voto…). No marco 2, esses eventos viram linhas numa tabela do Supabase com tempo real; as telas continuam iguais.
