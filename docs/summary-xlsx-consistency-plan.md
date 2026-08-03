# Plano: Summary completo e exportacao XLSX

## Objetivo

Garantir que o historico finalizado preserve todas as respostas dos grupos repetiveis e
que as exportacoes administrativas representem exatamente esse snapshot, sem consultar
o estado editavel atual de `/answers`.

## Solucao

- Cada ocorrencia de grupo recebe `GROUP_INSTANCE_ID`, compartilhado por todas as suas
  respostas.
- O backend monta `schemaVersion: 2`, `FORM_SNAPSHOT` e o indice achatado `QUESTIONS`.
- `QUESTIONS` admite IDs de pergunta repetidos e inclui metadados de grupo, ocorrencia,
  ordem e `ANSWER_ID`.
- Respostas posteriores da coordenacao ficam em `COORDINATION_SNAPSHOT`, sem alterar o
  cadastro originalmente finalizado.
- As exportacoes de centro, regional e Alianca passam a gerar `.xlsx` a partir do ultimo
  summary do periodo.
- O workbook possui abas `Centros`, `Respostas` e `Atendimentos`; `Respostas` usa formato
  longo, com uma linha para cada resposta de cada ocorrencia.
- O arquivo usa filtros, cabecalhos, datas tipadas, congelamento da primeira linha,
  quebra de texto e protecao contra interpretacao de valores como formulas.

## Aceite

- O total exportado e reconciliado com as respostas do snapshot.
- Testes cobrem zero, uma e varias ocorrencias, respostas vazias, cadastro, coordenacao e
  os tres escopos de exportacao.
- O XLSX e reaberto por teste e passa por verificacao estrutural e visual antes do deploy.
