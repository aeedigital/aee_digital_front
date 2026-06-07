# Plano técnico: CSV com paridade com `/cadastro`

## 1. Objetivo técnico

Fazer com que o CSV represente a mesma estrutura e os mesmos valores exibidos em:

```text
/cadastro?centroId=:centroId
```

A implementação será baseada no contrato documentado em
`docs/features/2026-06-07-exportcsv/cadastro-data-flow-report.md`.

O objetivo não é criar uma segunda interpretação dos dados. A página e o exportador
deverão compartilhar as funções que:

- selecionam o formulário anual atual;
- filtram as páginas visíveis;
- constroem o cache de answers;
- transformam grupos simples e múltiplos em ocorrências.

## 2. Premissas corrigidas

O plano anterior usava o summary mais recente para identificar o formulário e ordenava
answers por timestamp. Isso não corresponde ao funcionamento de `/cadastro`.

O novo plano adota:

- formulário: primeiro resultado de
  `/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual`;
- respostas: `GET /answers?CENTRO_ID=:centroId`;
- ordem: exatamente a ordem do array retornado pela API;
- estrutura visível: páginas com `ROLE !== "coord_regional"`;
- grupo simples: answer no índice zero;
- grupo múltiplo: alinhamento dos arrays de answers pelo índice;
- summary: não participa da seleção de formulário nem dos valores exportados.

## 3. Decisões técnicas

### 3.1 Modelo compartilhado de visualização

Será criado um módulo puro para representar o mesmo modelo consumido por `/cadastro`:

```text
CadastroViewModel
  form
  visiblePages
  answersCache
  projectedGroups
```

`app/cadastro/page.tsx` e o exportador usarão esse módulo. Isso evita copiar regras que
podem divergir no futuro.

As funções principais serão:

- `selectCurrentCadastroForm(forms)`;
- `getCadastroVisiblePages(form)`;
- `buildCadastroAnswersCache(answers)`;
- `projectCadastroQuestionGroup(questionGroup, answersCache)`;
- `projectCadastroPages(form, answersCache)`.

Todas serão puras e cobertas por testes unitários.

### 3.2 Formulário de referência

O exportador carregará uma vez:

```text
GET /forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual
```

e usará o primeiro item, como `/cadastro`.

Não haverá:

- busca de formulário por `summary.FORM_ID`;
- união de versões diferentes de formulários;
- estrutura específica por summary;
- fallback silencioso para outro formulário.

Se o formulário atual não existir ou estiver sem páginas, a exportação será cancelada
com mensagem em português.

### 3.3 Centros incluídos

Cada linha representará um centro retornado pelo escopo selecionado:

- centro: uma linha;
- regional: uma linha por centro da regional;
- Aliança: uma linha por centro das regionais acessíveis.

O centro não precisará ter summary. `/cadastro` pode ser aberto para um centro em
preenchimento e mostra as respostas atuais ou campos vazios.

Centros sem answers serão incluídos com células de resposta vazias, reproduzindo a
página vazia que o usuário veria.

### 3.4 Carregamento dos answers

Para garantir paridade, a fonte canônica será:

```text
GET /answers?CENTRO_ID=:centroId
```

O array será entregue diretamente a `buildCadastroAnswersCache`, sem ordenação.

Os answers da rota agregada
`/regionais/:id/centros-with-answers` não serão considerados automaticamente
equivalentes, porque a consulta regional usa filtros de período e pode alterar o
conjunto ou a ordem.

O plano inicial prioriza exatidão:

- centro: uma consulta de answers;
- regional: consultas com concorrência limitada por centro;
- Aliança: consultas com concorrência global limitada por centro.

Uma otimização futura só poderá reutilizar answers agregados após um teste de contrato
demonstrar que conteúdo e ordem são idênticos ao endpoint usado por `/cadastro`.

### 3.5 Ordem e grupos

O exportador deverá usar a mesma projeção de `GroupQuestionComponent`.

#### Grupo não múltiplo

- criar um bloco de colunas;
- usar `answersCache[questionId]?.[0]`;
- ignorar answers adicionais da pergunta;
- usar célula vazia quando o índice zero não existir.

Não será usado `pickCurrentAnswer`.

#### Grupo múltiplo

- calcular `max(length dos arrays das perguntas, 1)`;
- criar um bloco completo de colunas por ocorrência;
- para a ocorrência `i`, usar `answersCache[questionId]?.[i]`;
- preencher ausências com vazio;
- não ordenar por timestamp ou `_id`.

No CSV de vários centros, o número de blocos de um grupo será o maior número de
ocorrências projetado entre os centros do arquivo, com mínimo de um.

### 3.6 Páginas e colunas

As colunas dinâmicas seguirão:

```text
PAGES com ROLE !== "coord_regional"
  -> QUIZES
    -> QUESTIONS
      -> GROUP
```

Páginas de coordenação não serão exportadas, pois não aparecem no fluxo normal de
`/cadastro`.

O cabeçalho incluirá contexto suficiente para perguntas repetidas:

```text
Página / Categoria / Grupo N / Ocorrência N / Pergunta
```

As chaves internas usarão posições estruturais e `QUESTION_ID`, sem aliases. `/cadastro`
faz associação somente por igualdade exata de IDs.

### 3.7 Apresentação dos valores

Será criada uma função compartilhada de formatação para CSV baseada na apresentação de
`FormInput`:

- `String`, `LongText`, `Option`, `Radio` e `Time`: texto armazenado;
- `Boolean` e `Switch`: `SIM` para `true`, `NÃO` para `false`;
- `Date`: `dd/MM/yyyy` quando o valor for parseável;
- ausente, `null`, `undefined` ou somente espaços: vazio.

A função não alterará o valor usado pela tela. Ela somente produzirá a representação
textual do CSV.

### 3.8 Estrutura do CSV

As colunas fixas serão:

- `Regional` apenas no escopo da Aliança;
- `Centro ID`;
- `Centro`;
- `Nome curto`;
- `Formulário ID`;
- `Formulário`;
- `Versão do formulário`.

Não serão incluídas colunas de summary, porque summary não participa da visualização
normal de `/cadastro`.

O arquivo usará:

- separador `;`;
- linhas `CRLF`;
- valores entre aspas;
- escape de aspas internas;
- BOM UTF-8 no download;
- proteção contra CSV injection para valores iniciados por `=`, `+`, `-` ou `@`.

### 3.9 Coleta por escopo

#### Centro

- ação adicionada ao card do centro;
- recebe metadados do centro;
- carrega o modelo atual e answers pelo endpoint canônico;
- gera uma linha.

#### Regional

- reutiliza a lista de centros já carregada em `app/resumo/coordenador/page.tsx`;
- não usa `summaryByCentroId` para montar valores ou filtrar linhas;
- carrega answers de todos os centros com concorrência limitada;
- gera uma linha por centro.

#### Aliança

- reutiliza a lista de regionais e a coleta dos centros;
- carrega answers pelo endpoint canônico, com concorrência global limitada;
- mantém retry somente para `429` e `5xx`;
- inclui a coluna `Regional`;
- não usa `summary.QUESTIONS`.

### 3.10 Modo histórico

`/cadastro?centroId=:id&summaryId=:id` fica fora do contrato desta exportação.

Esse modo usa `summary.QUESTIONS`, que perde ocorrências múltiplas, e ainda exibe a
estrutura do formulário atual. Exportá-lo como histórico completo produziria dados
incorretos.

### 3.11 Autorização, LGPD e export estático

- A geração continuará no navegador.
- Não será criada API Route, preservando `output: "export"`.
- Chamadas novas usarão `apiFetch` e validarão `response.ok`.
- Centro e regional permanecerão nos perfis com `viewRegionalSummary`.
- Aliança permanecerá restrita a `viewAllianceSummary`.
- `app/respostas/*`, `lib/publicAnswers.ts` e os filtros LGPD não serão alterados.
- O conteúdo dos answers e do CSV não será registrado em console.

## 4. Arquivos que serão criados

### Documentação

- `docs/features/2026-06-07-exportcsv/cadastro-data-flow-report.md`
  - relatório do comportamento atual de `/cadastro`;
  - contrato de paridade usado por este plano.

### Código

- `lib/cadastroViewModel.ts`
  - seleção do formulário atual;
  - filtro de páginas visíveis;
  - construção do `answersCache`;
  - projeção compartilhada de grupos e ocorrências.
- `lib/cadastroCsvExport.ts`
  - carregamento do formulário e answers;
  - concorrência, retry e montagem dos registros por escopo.
- `components/ExportCenterCadastroCsvButton.tsx`
  - ação de exportação de um centro.

### Testes

- `vitest.config.ts`
  - configuração do Vitest e aliases.
- `tests/fixtures/cadastroViewModel.ts`
  - formulários, centros e answers sintéticos.
- `tests/unit/lib/cadastroViewModel.test.ts`
  - regras compartilhadas com `/cadastro`.
- `tests/unit/lib/summaryCsv.test.ts`
  - serialização e segurança do CSV.
- `tests/integration/lib/cadastroCsvExport.test.ts`
  - coleta de centro, regional e Aliança.
- `tests/integration/cadastroCsvParity.test.ts`
  - compara a projeção usada pela página com os valores enviados ao CSV.

### Harness

- `.harness/tasks/2026-06-07-exportcsv.md`
  - contrato funcional e roteiro de comparação página versus CSV.

## 5. Arquivos que serão alterados

- `app/cadastro/page.tsx`
  - usar `selectCurrentCadastroForm`, `getCadastroVisiblePages` e
    `buildCadastroAnswersCache`;
  - preservar o comportamento visual atual;
  - validar `response.ok` nas buscas.
- `components/GroupQuestionComponent.tsx`
  - usar a projeção compartilhada de ocorrências;
  - manter criação, atualização e remoção como estão.
- `lib/summaryCsv.ts`
  - deixar de ler `summary.QUESTIONS`;
  - receber colunas e linhas projetadas do modelo de cadastro;
  - remover aliases que não existem em `/cadastro`;
  - adicionar formatação por tipo e proteção contra CSV injection.
- `interfaces/form.interface.ts`
  - completar `ANSWER_TYPE` com os tipos tratados por `FormInput`;
  - adicionar timestamps opcionais ao tipo `Answer`;
  - evitar novos usos de `any`.
- `components/AcoesCoordenadorCentro.tsx`
  - incluir `Exportar dados exibidos (CSV)`.
- `components/House_Card.tsx`
  - passar metadados do centro ao botão de exportação.
- `app/resumo/coordenador/page.tsx`
  - trocar a exportação baseada em summaries pela coleta canônica de answers;
  - incluir todos os centros e atualizar textos da ação.
- `components/ExportAllianceSummariesButton.tsx`
  - renomear o componente ou substituir sua implementação;
  - usar formulário atual e answers canônicos;
  - não selecionar summaries.
- `package.json`
  - adicionar `test` e `test:run`.
- `package-lock.json`
  - registrar Vitest.
- `.harness/scripts/check.sh`
  - executar testes no `harness:check:quick`.

Não há mudança prevista em:

- `components/ValidationTab.tsx`;
- persistência de summaries;
- backend ou schemas;
- consulta pública e filtros LGPD;
- deploy.

## 6. Testes unitários necessários

### Seleção e páginas

- seleciona `forms[0]`;
- falha quando não há formulário;
- preserva a ordem de `PAGES`;
- exclui somente páginas com `ROLE === "coord_regional"`;
- preserva a ordem de quizzes, grupos e perguntas.

### Construção do cache

- agrupa por `QUESTION_ID`;
- preserva a ordem recebida da API;
- não ordena por timestamps;
- não aplica aliases;
- não altera o array original;
- mantém answers duplicados com IDs diferentes.

### Grupo simples

- cria exatamente uma ocorrência;
- usa o answer de índice zero;
- ignora segundo e terceiro answers;
- produz vazio quando não há answer.

### Grupo múltiplo

- usa no mínimo uma ocorrência;
- usa o maior tamanho entre arrays das perguntas;
- alinha perguntas pelo índice;
- preenche lacunas com vazio;
- preserva valor `"false"`;
- trata valor composto somente por espaços como vazio;
- não ordena por timestamp ou ObjectId.

### Formatação CSV

- texto, opção, radio e horário preservados;
- booleanos convertidos para `SIM` e `NÃO`;
- data formatada como `dd/MM/yyyy`;
- valores vazios permanecem vazios;
- `;`, aspas, quebras de linha e acentos são escapados;
- prefixos de fórmula são neutralizados;
- CRLF e BOM seguem o contrato.

## 7. Testes de integração necessários

- o loader usa exatamente a consulta de formulário usada por `/cadastro`;
- o loader usa `GET /answers?CENTRO_ID` para cada centro;
- centro sem summary é exportado;
- centro sem answers gera linha vazia;
- grupo simples com answers fora de ordem temporal usa o primeiro da API;
- grupo múltiplo gera os mesmos valores e ocorrências que a projeção da página;
- answers de perguntas ausentes no formulário atual são ignorados;
- páginas `coord_regional` não aparecem no CSV;
- regional gera uma linha por centro, sem depender de summaries;
- Aliança inclui regional e uma linha por centro;
- concorrência nunca ultrapassa o limite configurado;
- `429` e `5xx` são repetidos; `4xx` definitivo não é;
- falha de um centro cancela o arquivo, evitando CSV parcial;
- formulário ausente cancela o download;
- o conteúdo entregue a `downloadCsvFile` coincide com o modelo projetado para
  `/cadastro`.

## 8. Cenários de harness necessários

### Automáticos

1. `npm run harness:check:quick`
   - lint;
   - typecheck;
   - testes unitários;
   - testes de integração e paridade.
2. `npm run harness:preflight`
   - confirmar acesso à API.
3. `npm run harness:check`
   - executar as verificações rápidas;
   - gerar build estático;
   - validar `/resumo/alianca`, `/resumo/coordenador` e `/cadastro`.

### Comparação manual página versus CSV

Para cada cenário:

1. abrir `/cadastro?centroId=:id`;
2. percorrer todas as páginas visíveis;
3. anotar ordem, quantidade de ocorrências e valores;
4. exportar o CSV;
5. comparar célula por célula.

Cenários obrigatórios:

- centro sem answers;
- centro com grupos simples;
- grupo simples com answers duplicados;
- grupo múltiplo com uma ocorrência;
- grupo múltiplo com três ocorrências;
- grupo múltiplo com quantidade desigual entre perguntas;
- valor `" "` criado ao adicionar grupo;
- booleano verdadeiro e falso;
- data, opção, texto longo e horário;
- answer de pergunta de formulário antigo;
- página com `ROLE === "coord_regional"`;
- regional com centros completos, parciais e vazios;
- Aliança com pelo menos duas regionais.

### Falhas e perfis

- API de formulário indisponível;
- API de answers indisponível;
- resposta inválida da API;
- `admin`, `coord_geral` e `coord_regional` em seus escopos;
- ausência da ação para `presidente`;
- navegação pública sem novo botão;
- perguntas LGPD continuam ocultas em `/respostas`.

## 9. Riscos e mitigações

### Ordem não declarada pela API

`/cadastro` depende da ordem retornada por `/answers`, mas o endpoint não recebe
`sortBy`.

Mitigação: preservar a ordem sem transformação para garantir paridade atual. Registrar
como dívida técnica a necessidade de ordem explícita ou `GROUP_INSTANCE_ID`.

### Ausência de identificador da ocorrência

Grupos múltiplos são alinhados apenas por índice.

Mitigação: reutilizar exatamente a mesma função na página e no CSV. A correção
definitiva depende de alteração do modelo no backend.

### Duplicatas em grupo simples

A página mostra somente o primeiro answer.

Mitigação: o CSV fará o mesmo. Um teste de paridade impedirá que passe a selecionar o
mais recente sem mudança equivalente na página.

### Custo de consultas

Regional e Aliança exigirão uma chamada de answers por centro para garantir equivalência
com `/cadastro`.

Mitigação: concorrência limitada, retry transitório e cache por `CENTRO_ID` durante a
exportação. Otimizações dependem de contrato comprovado da rota agregada.

### Mudança do formulário atual

Answers antigos podem não pertencer ao formulário selecionado.

Mitigação: ignorá-los da mesma forma que a página. O CSV deve representar a tela atual,
não tentar recuperar estrutura histórica.

### Divergência futura

Alterações em `GroupQuestionComponent` poderiam mudar a tela e deixar o CSV defasado.

Mitigação: extrair a projeção para `lib/cadastroViewModel.ts` e manter teste de paridade.

### CSV injection e dados pessoais

Answers podem conter fórmulas e dados sensíveis.

Mitigação: neutralização de fórmulas, rotas autenticadas, ausência de logs de conteúdo e
nenhuma alteração no fluxo público.

## 10. Sequência de implementação

1. Adicionar Vitest, configuração e fixtures.
2. Criar testes que reproduzem o comportamento atual de `/cadastro`.
3. Extrair seleção de formulário, filtro de páginas e cache para
   `lib/cadastroViewModel.ts`.
4. Extrair a projeção de grupos e fazer `GroupQuestionComponent` consumi-la.
5. Confirmar que `/cadastro` não mudou visualmente.
6. Adaptar `lib/summaryCsv.ts` para o modelo projetado.
7. Implementar `lib/cadastroCsvExport.ts`.
8. Integrar exportação de centro.
9. Migrar exportação regional.
10. Migrar exportação da Aliança.
11. Adicionar contrato de harness.
12. Executar validações automáticas e comparação manual página versus CSV.

## 11. Fora de escopo

- corrigir `summary.QUESTIONS`;
- exportar histórico de summaries;
- usar `summary.FORM_ID` para estruturar o CSV;
- ordenar answers por timestamp;
- adicionar aliases ausentes em `/cadastro`;
- alterar backend ou adicionar `GROUP_INSTANCE_ID`;
- exportação pública;
- exportação XLSX;
- geração no servidor;
- alterar autorização ou filtros LGPD.
