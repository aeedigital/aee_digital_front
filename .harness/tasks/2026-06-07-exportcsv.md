# Tarefa: Exportação CSV com paridade com `/cadastro`

## Objetivo

Gerar CSVs que reflitam a mesma estrutura e os mesmos valores exibidos em
`/cadastro?centroId=:centroId` para os escopos de centro, regional e Aliança.

## Escopo

- Extrair regras compartilhadas de `/cadastro` para um view model testável.
- Exportar uma linha por centro.
- Usar o formulário anual atual retornado por
  `/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual`.
- Usar `GET /answers?CENTRO_ID=:centroId` como fonte canônica de respostas.
- Preservar a ordem dos answers retornada pela API.
- Excluir páginas com `ROLE === "coord_regional"` do CSV.
- Expandir grupos `IS_MULTIPLE` por índice, exatamente como a página.
- Preservar autorização existente dos fluxos de resumo.

## Criterios de aceite

- [ ] CSV de centro corresponde aos valores visíveis em `/cadastro?centroId=:id`.
- [ ] CSV regional gera uma linha por centro carregado na regional.
- [ ] CSV da Aliança inclui a coluna `Regional`.
- [ ] Grupos simples usam o answer no índice zero.
- [ ] Grupos múltiplos alinham ocorrências por índice e preservam lacunas vazias.
- [ ] Páginas `coord_regional` não aparecem no CSV.
- [ ] Summary não é usado para escolher formulário nem valores.
- [ ] Perfis de usuário relevantes preservados.
- [ ] Regras LGPD revisadas no fluxo público.
- [ ] `npm run harness:check` concluído.

## Validacao manual

- Abrir `/cadastro?centroId=:id` e comparar célula por célula com CSV do centro.
- Validar centro sem answers.
- Validar centro com grupos simples.
- Validar grupo simples com answers duplicados.
- Validar grupo múltiplo com uma ocorrência.
- Validar grupo múltiplo com três ocorrências.
- Validar grupo múltiplo com quantidade desigual entre perguntas.
- Validar valor `" "` criado ao adicionar grupo.
- Validar booleano verdadeiro e falso.
- Validar data, opção, texto longo e horário.
- Validar answer de pergunta ausente no formulário atual.
- Validar regional com centros completos, parciais e vazios.
- Validar Aliança com pelo menos duas regionais.
- Validar ausência de exportação pública em `/respostas`.
- Validar que perguntas ocultas por LGPD continuam ocultas em `/respostas`.

## Riscos

- `/answers` não declara ordenação; a paridade atual depende da ordem retornada pela API.
- Não existe identificador persistido de ocorrência de grupo.
- O CSV intentionally reproduz o primeiro answer em grupos simples, mesmo quando há duplicatas.
- Exportações regionais e de Aliança podem fazer muitas chamadas de answers.
- Answers antigos fora do formulário atual são ignorados, como na página.
- Corrigir summaries históricos e persistência de `GROUP_INSTANCE_ID` está fora do escopo.
