# Relatório técnico: funcionamento de `/cadastro`

## 1. Escopo analisado

Este relatório descreve o fluxo principal aberto por:

```text
/cadastro?centroId=:centroId
```

Esse é o destino da ação `Ver Respostas` em `components/House_Card.tsx` e representa
os dados atuais que o usuário vê e edita para um centro.

Também foi analisado o modo histórico:

```text
/cadastro?centroId=:centroId&summaryId=:summaryId
```

Ele possui fonte de respostas diferente e limitações relevantes, descritas na seção 8.

## 2. Arquivos do fluxo

- `app/cadastro/page.tsx`
  - carrega formulário e respostas;
  - constrói o cache por pergunta;
  - filtra páginas visíveis;
  - controla navegação e validação.
- `components/QuizComponent.tsx`
  - preserva a ordem dos quizzes e grupos do formulário.
- `components/GroupQuestionComponent.tsx`
  - transforma arrays de answers em ocorrências visíveis;
  - adiciona e remove ocorrências múltiplas.
- `components/QuestionComponent.tsx`
  - cria ou atualiza answers na API.
- `components/FormInput.tsx`
  - define a apresentação de cada `ANSWER_TYPE`.
- `components/ValidationTab.tsx`
  - valida obrigatórias e cria o summary.
- `lib/requiredAnswers.ts`
  - seleciona respostas para validação e snapshot.
- `lib/fetchWithCache.ts`
  - evita buscas repetidas do formulário na mesma sessão.

## 3. Carregamento do formulário

`/cadastro` não usa o `FORM_ID` de um summary para montar a tela.

Ele executa:

```text
GET /forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual
```

e seleciona `formResponse[0]`.

Consequências:

- a tela usa o formulário anual mais recente retornado pela API;
- nome, versão, páginas, quizzes, grupos e perguntas vêm desse formulário;
- todos os centros abertos no fluxo normal usam a mesma estrutura atual;
- o `FORM_ID` de summaries antigos não determina a estrutura da tela.

## 4. Carregamento das respostas atuais

No fluxo sem `summaryId`, a página executa:

```text
GET /answers?CENTRO_ID=:centroId
```

O array retornado é percorrido na ordem recebida. Cada answer é anexado ao array de sua
pergunta:

```text
answersCache[QUESTION_ID].push(answer)
```

O cache resultante tem o formato:

```text
Record<QUESTION_ID, Answer[]>
```

Não existe no carregamento:

- ordenação por `createdAt`;
- ordenação por `updatedAt`;
- seleção pelo answer mais recente;
- associação por `QUIZ_ID`;
- associação por summary;
- alias entre IDs antigos e atuais.

A ordem fornecida por `/answers` torna-se, na prática, parte do comportamento visual da
página.

## 5. Páginas e perguntas visíveis

A página mantém duas coleções:

- `allPages`: todas as páginas do formulário;
- `pages`: páginas cuja propriedade `ROLE` não é `coord_regional`.

Somente `pages` é renderizada para o usuário.

Portanto, o conteúdo visível segue esta ordem:

```text
PAGES filtradas
  -> QUIZES
    -> QUESTIONS (grupos)
      -> GROUP (perguntas)
```

As páginas com `ROLE === "coord_regional"` não fazem parte da visualização normal de
`/cadastro`, embora `allPages` seja usado pela aba de validação.

## 6. Projeção dos grupos

### 6.1 Grupo não múltiplo

Para `IS_MULTIPLE: false`:

- sempre é renderizada uma ocorrência;
- cada pergunta usa `answersCache[questionId]?.[0]`;
- se não houver answer no índice zero, é criado apenas um objeto vazio local para
  apresentação;
- answers adicionais da mesma pergunta não aparecem.

Assim, a resposta visível de um grupo simples é a primeira resposta na ordem retornada
pela API, e não necessariamente a mais recente por timestamp.

### 6.2 Grupo múltiplo

Para `IS_MULTIPLE: true`, a quantidade de ocorrências visíveis é:

```text
max(tamanho dos arrays de answers das perguntas do grupo, 1)
```

Para cada ocorrência `i`, a página monta:

```text
questionGroup.GROUP.map(question =>
  answersCache[question._id]?.[i] || answerVazio
)
```

Isso significa que:

- a ocorrência é definida pelo índice do answer dentro do array da pergunta;
- perguntas diferentes são alinhadas pelo mesmo índice;
- arrays menores recebem campos vazios nas ocorrências ausentes;
- sempre existe ao menos uma ocorrência visual;
- não há `GROUP_INSTANCE_ID` persistido.

Exemplo:

```text
Pergunta A: [A1, A2]
Pergunta B: [B1]
Pergunta C: [C1, C2]

Ocorrência 1: A1, B1, C1
Ocorrência 2: A2, vazio, C2
```

## 7. Edição e manutenção da ordem

### Atualização

Quando um answer já possui `_id`, `QuestionComponent` executa:

```text
PATCH /answers/:answerId
```

O answer atualizado substitui o item de mesmo `_id` no cache, preservando sua posição.

### Criação simples

Quando não há `_id`, executa:

```text
POST /answers
```

com:

```text
ANSWER
CENTRO_ID
QUESTION_ID
```

O answer retornado é anexado ao final do array da pergunta.

### Nova ocorrência múltipla

O botão de adição cria um answer com valor `" "` para cada pergunta do grupo. Cada
answer retornado é anexado ao respectivo array, formando a nova ocorrência no último
índice.

### Remoção

O botão de remoção executa `DELETE /answers/:answerId` para cada answer da ocorrência e
remove esses IDs dos arrays do cache.

### Deduplicação

`app/cadastro/page.tsx` deduplica por `_id` sem reordenar os itens existentes. Answers
locais sem `_id` permanecem depois dos answers persistidos.

## 8. Modo histórico com `summaryId`

Ao receber `summaryId`, a página:

1. ainda carrega o formulário anual mais recente;
2. busca `GET /summaries/:summaryId`;
3. converte `summary.QUESTIONS` em answers locais;
4. constrói o mesmo `answersCache`.

Esse modo não representa corretamente grupos múltiplos porque o summary atual armazena
somente uma resposta por pergunta.

Além disso, a estrutura exibida continua sendo o formulário mais recente, não
necessariamente o `FORM_ID` do summary.

Conclusão: o modo histórico não pode ser usado como referência de fidelidade para a
exportação solicitada. A referência correta é o fluxo normal sem `summaryId`.

## 9. Apresentação dos valores

`FormInput` apresenta os valores conforme `ANSWER_TYPE`:

- `String`: texto em input;
- `LongText`: texto em textarea;
- `Option`: opção selecionada;
- `Boolean`: checkbox marcado quando o valor é `true` ou `"true"`;
- `Radio`: opção selecionada;
- `Switch`: ligado quando o valor é `true` ou `"true"`;
- `Date`: data formatada como `dd/MM/yyyy` quando parseável;
- `Time`: horário no formato aceito pelo input.

Valores ausentes usam apresentação vazia. O valor `" "` criado ao adicionar um grupo é
visualmente vazio e deve ser tratado como vazio na exportação.

## 10. Validação e criação do summary

A aba de validação usa todos os grupos de `allPages`, inclusive páginas não visíveis
com `ROLE === "coord_regional"`.

Para obrigatórias, basta existir algum answer preenchido para a pergunta.

Ao finalizar, `ValidationTab` seleciona apenas uma resposta por pergunta com
`pickBestRequiredAnswer` e cria:

```text
POST /summaries
```

Esse é o ponto em que ocorrências múltiplas são descartadas no snapshot. A perda não
ocorre no `answersCache` nem na tela principal.

## 11. Contrato de paridade para o CSV

Para refletir o que o usuário vê em `/cadastro?centroId=:id`, o exportador deve:

1. carregar o mesmo formulário atual e selecionar o primeiro resultado;
2. aplicar o mesmo filtro `page.ROLE !== "coord_regional"`;
3. carregar answers pelo mesmo endpoint de centro;
4. construir o cache preservando a ordem recebida;
5. usar o primeiro answer para grupos não múltiplos;
6. usar o maior tamanho dos arrays e alinhamento por índice para grupos múltiplos;
7. criar ao menos um bloco de colunas por grupo;
8. representar ausências e valores compostos apenas por espaços como células vazias;
9. seguir a ordem estrutural do formulário;
10. não usar `summary.QUESTIONS`, timestamps ou aliases para escolher valores.

## 12. Riscos observados

- A API não declara ordenação no `GET /answers`; alterar a ordem no backend mudaria a
  composição visual dos grupos múltiplos.
- Não há identificador persistido da ocorrência do grupo.
- Grupo não múltiplo com answers duplicados mostra somente o primeiro.
- O formulário atual pode não conter perguntas de answers antigos; esses answers não
  aparecem na tela.
- O modo histórico não reproduz grupos múltiplos.
- A página não valida `response.ok` nas buscas diretas de answers e summaries.

Esses riscos devem ser preservados como comportamento quando necessários à paridade ou
tratados por uma refatoração compartilhada entre `/cadastro` e o exportador, para evitar
que os dois fluxos passem a produzir resultados diferentes.
