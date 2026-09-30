---
name: gerar-caso
description: Escreve um caso novo de mistério para o GAROA (arquivo JSON em src/casos/dados) e só termina quando o validador aprova. Use quando pedirem um caso, mistério ou história nova para o jogo, com ou sem tema.
argument-hint: "[tema ou premissa opcional]"
---

# Gerar caso do GAROA

Você vai escrever um caso jogável: um arquivo JSON que o jogo carrega sozinho. O formato é rígido e existe um validador que simula o jogo para garantir que o caso tem solução. **O trabalho só termina quando `npm run validar-caso` passa sem erros.**

Tema pedido: $ARGUMENTS (se vazio, escolha um que combine com uma cidade noir chuvosa dos anos 40).

## 1. Leia antes de escrever

1. `npm run catalogo` — cenários e suas âncoras, ícones, cores, bairros (com a faixa válida de `mapa.x`/`mapa.y`), detetives simulados e os casos que já existem (números e posições no mapa já usados).
2. `docs/caso.schema.json` — o formato exato. Se não existir ou estiver velho, rode `npm run esquema`.
3. Os dois casos de exemplo em `src/casos/dados/`:
   - `0412-relogio-parado.json`: completo, com `coopSimulado` (detetives simulados já trabalhando no caso).
   - `0421-apagao-cine-estrela.json`: menor, sem `coopSimulado` (caso novo, ninguém entrou).

## 2. Escreva de trás para frente

Um mistério justo nasce da solução. Nesta ordem:

1. **Solução**: culpado, motivo e o que aconteceu de verdade, minuto a minuto.
2. **Cadeia de prova**: 2 ou 3 pistas que, juntas, provam a culpa. Pelo menos uma delas deve vir de **depoimento** (não só da cena). Isso vira `solucao.evidencias` (qualquer uma delas é aceita como "evidência principal").
3. **Pistas falsas**: cada suspeito inocente precisa de algo que o faça parecer culpado, e de uma pergunta que explique esse algo (como a chave mestra do Caio ou as pegadas do Rui no caso 0412).
4. **Cena**: escolha um cenário do catálogo e distribua as pistas pelas âncoras dele. A arte do cenário é fixa: use âncoras cujo objeto combine com a pista (a xícara na âncora `xicara`, o fusível na `quadro-forca`). Um ou dois pontos sem pista (só `texto`) deixam a cena mais natural.
5. **Interrogatórios**: 4 a 6 perguntas por suspeito. Perguntas com `requer`/`mostra` só aparecem depois que a equipe acha a pista; é assim que a investigação avança. Uma frase por item em `resposta` (o jogador marca frases).
6. Por último: relatório policial, resumo do mapa, motivos (4 ou 5, um certo e os outros plausíveis) e o relatório final.

## 3. Regras de conteúdo

- Português do Brasil, tom noir, frases curtas. Nada de gore.
- `id` do caso: 4 dígitos, maior que os existentes. Nome do arquivo: `<id>-<titulo-em-kebab>.json`.
- `mapa`: dentro da faixa do bairro escolhido e a pelo menos 48px (x) ou 72px (y) dos marcadores existentes.
- Motivos não podem se sobrepor: se "herança" é o certo, não ofereça também "dinheiro da família".
- O relatório final explica **cada** pista falsa, não só a do culpado.
- Aparência dos suspeitos: combine os traços do esquema para que cada um seja reconhecível (cores de casaco diferentes, chapéu/óculos/bigode variados).
- `coopSimulado` é opcional. Se usar, os eventos precisam ser jogadas possíveis na ordem do tempo (quem pergunta algo que exige pista precisa ter a pista antes) e não podem revelar mais de 3/4 das pistas.

## 4. Valide até passar

```bash
npm run validar-caso src/casos/dados/<arquivo>.json
```

Leia cada `ERRO`, corrija e rode de novo. Leve os `aviso` a sério: "todas as evidências estão na cena" significa que o caso se resolve sem interrogar ninguém; mude isso.

## 5. Entregue um resumo para revisão humana

O validador garante que o caso **tem solução**, não que ele é **bom**. Termine mostrando:

- culpado, motivo e a cadeia de prova (quais pistas, onde cada uma aparece);
- as pistas falsas e o que as explica;
- o caminho mínimo até a solução (quantos pontos e perguntas);
- o que pode estar fácil ou difícil demais, e sugestões.

Não altere os casos existentes nem o código do jogo.
