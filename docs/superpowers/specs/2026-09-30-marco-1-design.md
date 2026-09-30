# GAROA · Marco 1: design

Data: 30/09/2026. Base visual: protótipos do Claude Design em `design/` (mapa, caso, quadro, interrogatório, acusação, perfil, guia de estilo).

## Decisões

| Pergunta | Decisão |
|---|---|
| O que é "real" no marco 1 | Híbrido: jogável sozinho, sem servidor, com o código pronto para trocar os dados locais por servidor. |
| Plataforma | Só desktop. Telas desenhadas a 1440px e ajustadas à janela com CSS `zoom`. Mobile vira marco próprio. |
| Conteúdo | Dois casos escritos à mão (0412 O Relógio Parado, completo; 0421 Apagão no Cine Estrela, curto). |
| Casos gerados por agente | Offline agora (skill `gerar-caso` + validador). Dentro do site só no marco 2, porque a chave da API precisa ficar num servidor. |
| Stack | Vite + React + TypeScript, Zod, React Router (hash), Vitest. |

## Arquitetura

- **Dados só pelo repositório** (`src/dados/repositorio.ts`). As telas nunca tocam no armazenamento.
- **Estado compartilhado do caso** = eventos (examinou, perguntou, marcou-trecho, pausou, nota, pista-no-quadro, foto-cena, recorte, item-movido, item-removido, fio, fio-removido, teoria, voto). `derivarEstado` refaz o estado dobrando os eventos; eventos impossíveis são ignorados.
- **Estado privado do jogador**: perfil (nome e visual) e acusações (seladas). XP e rank são sempre calculados, nunca guardados.
- **Detetives simulados**: o bloco `coopSimulado` de cada caso vira eventos datados a partir da primeira visita. No marco 2, some.
- Dados salvos levam versão; corrompido ou antigo é descartado com aviso na tela.

## Caso (formato)

Esquema em `src/casos/esquema.ts` (JSON Schema exportado em `docs/caso.schema.json`). Pontos principais:

- A cena usa um **cenário do catálogo** e âncoras nomeadas; o caso não tem coordenadas nem arte própria.
- Retratos são gerados a partir de traços (`aparencia`), então caso novo não precisa de arte.
- Perguntas têm `requer`/`mostra` (pistas exigidas) e `revela` (pistas novas); respostas são listas de frases, para marcar trechos.
- Solução: culpado, motivo (entre 3 e 6 opções) e uma lista de evidências aceitas.

## Regras

- Examinar um ponto revela a pista dele. Perguntar exige as pistas de `requer`/`mostra`.
- Progresso do caso = pistas encontradas ÷ total.
- Acusação: culpado + motivo + evidência, 3 tentativas. O retorno diz quantos dos 3 elementos estavam certos. Errar as 3 arquiva o caso para o jogador e revela a solução, sem bônus.
- XP: 5 por ação (nota 10, teoria 15, voto 1), 15 por pista encontrada primeiro, bônus de resolução 100 + 50×dificuldade − 40 por tentativa errada (mínimo 50). Nível L começa em 50·L·(L−1) XP. Ranks: RECRUTA, AGENTE (3), DETETIVE (6), DETETIVE SÊNIOR (10), CHEFE DE INVESTIGAÇÃO (15).

## Validador

Reprova: formato inválido; ids repetidos; referência inexistente; âncora fora do cenário; culpado/motivo/evidência inválidos; pergunta que revela o que ela mesma exige; pista ou pergunta inalcançável (simulação: examinar tudo, liberar perguntas até não haver nada novo); evidência inalcançável; eventos simulados impossíveis na ordem do tempo.
Avisa: suspeito sem pergunta liberada no início; nenhuma pista importante; caso resolvível só pela cena; marcador fora do bairro; coop revelando mais de 3/4 das pistas; marcadores sobrepostos.

## Fora do marco 1

Botões visíveis com aviso "EM BREVE": abas Meus Casos/Quadros/Arquivo, busca, abrir caso, mensagens, seguir caso, zoom do mapa, conquistas. Também ficam para depois: mobile, multiplayer real, gerador dentro do site, a mecânica do infiltrado.
