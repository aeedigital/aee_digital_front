# Proposta de modelo de dados para `summary`

## 1. Objetivo

Este documento descreve como o dado de `summary` deveria ser estruturado no backend para
preservar um snapshot fiel do cadastro finalizado.

O problema atual não é apenas de exportação CSV. O `summary` hoje perde informação de
grupos múltiplos porque armazena uma lista achatada de perguntas e respostas. Quando uma
pergunta aparece em mais de uma ocorrência de um grupo `IS_MULTIPLE`, o snapshot guarda
apenas uma resposta escolhida para aquela pergunta.

O comportamento correto que precisa ser preservado é o que o usuário vê em:

```text
/cadastro?centroId=:centroId
```

Esse fluxo usa o formulário vigente, lê respostas de `/answers?CENTRO_ID=:centroId` e
monta grupos múltiplos alinhando as respostas por índice dentro de cada pergunta.

## 2. Papel correto do `summary`

O `summary` deveria ser um snapshot histórico e imutável do cadastro no momento da
finalização.

Ele deveria permitir:

- reabrir o histórico exatamente como foi finalizado;
- exportar o histórico sem consultar o estado atual de `/answers`;
- preservar a versão e a estrutura do formulário usado;
- preservar grupos múltiplos com todas as ocorrências;
- preservar respostas vazias quando elas fazem parte de uma ocorrência;
- aplicar filtros de privacidade por `QUESTION_ID` sem perder a estrutura;
- auditar quando, por quem e com qual versão de formulário o cadastro foi finalizado.

Ele não deveria depender do formulário atual nem do estado atual da coleção `answers` para
representar o passado.

## 3. Problema do modelo atual

O modelo atual documentado para `summaries` é:

```text
summaries
  _id
  FORM_ID
  CENTRO_ID
  QUESTIONS[]
    QUESTION
    ANSWER
  validatedByCoordAt
  createdAt
  updatedAt
```

No frontend, `components/ValidationTab.tsx` monta o payload assim:

```ts
const allAnswers = questions.flatMap((q) => q.GROUP || []).map((q) => {
  const answers = answersCache[q._id] || [];
  const currentAnswer = pickBestRequiredAnswer(answers);

  return {
    QUESTION: q._id,
    ANSWER: currentAnswer?.ANSWER ?? "",
  };
});
```

Consequências:

- a estrutura de páginas, quizzes e grupos é descartada;
- `IS_MULTIPLE` é descartado;
- a ocorrência do grupo é descartada;
- cada pergunta vira uma única entrada em `QUESTIONS`;
- answers repetidos por pergunta são reduzidos a uma resposta;
- respostas vazias que compõem uma ocorrência podem desaparecer;
- `FORM_ID` existe, mas não existe snapshot da estrutura do formulário;
- alterações futuras no formulário podem mudar a interpretação de summaries antigos.

## 4. Decisão principal

O backend deve tratar `summary` como snapshot estrutural, não como lista achatada.

O dado recomendado é hierárquico:

```text
summary
  metadata do cadastro
  snapshot do centro
  snapshot do formulário
  páginas
    quizzes
      grupos
        perguntas
        ocorrências
          respostas
```

Essa estrutura preserva a mesma regra visual de `/cadastro`: um grupo múltiplo tem N
ocorrências, e cada ocorrência contém uma resposta por pergunta do grupo.

## 5. Modelo recomendado

### 5.1 Documento raiz

```ts
type SummaryV2 = {
  _id: string;
  schemaVersion: 2;

  CENTRO_ID: string;
  FORM_ID: string;
  FORM_VERSION: number;
  FORM_NAME: string;

  status: "submitted" | "validated_by_coord";
  submittedAt: string;
  submittedBy?: {
    userId?: string;
    role?: string;
  };

  validatedByCoordAt?: string;
  validatedByCoordBy?: {
    userId?: string;
    role?: string;
  };

  centroSnapshot?: {
    id: string;
    nomeCentro?: string;
    nomeCurto?: string;
    regionalId?: string;
    regionalNome?: string;
  };

  formSnapshot: SummaryFormSnapshot;
  answersFlat?: SummaryFlatAnswer[];

  createdAt: string;
  updatedAt: string;
};
```

### 5.2 Snapshot do formulário e respostas

```ts
type SummaryFormSnapshot = {
  id: string;
  name: string;
  version: number;
  pages: SummaryPageSnapshot[];
};

type SummaryPageSnapshot = {
  pageKey: string;
  pageName: string;
  role?: string;
  order: number;
  quizzes: SummaryQuizSnapshot[];
};

type SummaryQuizSnapshot = {
  quizKey: string;
  category: string;
  order: number;
  groups: SummaryGroupSnapshot[];
};

type SummaryGroupSnapshot = {
  groupKey: string;
  isMultiple: boolean;
  order: number;
  questions: SummaryQuestionSnapshot[];
  occurrences: SummaryGroupOccurrenceSnapshot[];
};

type SummaryQuestionSnapshot = {
  questionId: string;
  label: string;
  answerType: string;
  isRequired: boolean;
  presetValues?: string[];
  order: number;
};

type SummaryGroupOccurrenceSnapshot = {
  occurrenceId: string;
  order: number;
  answers: SummaryAnswerSnapshot[];
};

type SummaryAnswerSnapshot = {
  questionId: string;
  answerId?: string;
  rawValue: string;
  displayValue?: string;
  sourceCreatedAt?: string;
  sourceUpdatedAt?: string;
};
```

### 5.3 Índice achatado opcional

O campo `answersFlat` é opcional e deve ser derivado do snapshot hierárquico. Ele ajuda
consultas, relatórios e exportações, mas não deve ser a fonte canônica do histórico.

```ts
type SummaryFlatAnswer = {
  pageKey: string;
  pageName: string;
  pageOrder: number;

  quizKey: string;
  category: string;
  quizOrder: number;

  groupKey: string;
  groupOrder: number;
  isMultiple: boolean;

  occurrenceId: string;
  occurrenceOrder: number;

  questionId: string;
  questionLabel: string;
  questionOrder: number;
  answerType: string;

  answerId?: string;
  rawValue: string;
  displayValue?: string;
};
```

## 6. Exemplo de documento

```json
{
  "_id": "665f00000000000000000001",
  "schemaVersion": 2,
  "CENTRO_ID": "61b0ba8171572500128b85e1",
  "FORM_ID": "665e00000000000000000001",
  "FORM_VERSION": 2026,
  "FORM_NAME": "Cadastro de Informações Anual",
  "status": "submitted",
  "submittedAt": "2026-06-08T12:00:00.000Z",
  "centroSnapshot": {
    "id": "61b0ba8171572500128b85e1",
    "nomeCentro": "Centro Exemplo",
    "nomeCurto": "Exemplo",
    "regionalId": "61b0b90071572500128b85d0",
    "regionalNome": "Regional Exemplo"
  },
  "formSnapshot": {
    "id": "665e00000000000000000001",
    "name": "Cadastro de Informações Anual",
    "version": 2026,
    "pages": [
      {
        "pageKey": "page:0",
        "pageName": "Identificação",
        "order": 0,
        "quizzes": [
          {
            "quizKey": "page:0/quiz:0",
            "category": "Dados gerais",
            "order": 0,
            "groups": [
              {
                "groupKey": "page:0/quiz:0/group:0",
                "isMultiple": false,
                "order": 0,
                "questions": [
                  {
                    "questionId": "q_nome_presidente",
                    "label": "Nome do presidente",
                    "answerType": "String",
                    "isRequired": true,
                    "order": 0
                  }
                ],
                "occurrences": [
                  {
                    "occurrenceId": "page:0/quiz:0/group:0/occurrence:0",
                    "order": 0,
                    "answers": [
                      {
                        "questionId": "q_nome_presidente",
                        "answerId": "ans_001",
                        "rawValue": "Maria Silva",
                        "displayValue": "Maria Silva"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "pageKey": "page:1",
        "pageName": "Atividades",
        "order": 1,
        "quizzes": [
          {
            "quizKey": "page:1/quiz:0",
            "category": "Grupos de estudo",
            "order": 0,
            "groups": [
              {
                "groupKey": "page:1/quiz:0/group:0",
                "isMultiple": true,
                "order": 0,
                "questions": [
                  {
                    "questionId": "q_nome_grupo",
                    "label": "Nome do grupo",
                    "answerType": "String",
                    "isRequired": true,
                    "order": 0
                  },
                  {
                    "questionId": "q_dia_grupo",
                    "label": "Dia da semana",
                    "answerType": "Option",
                    "isRequired": false,
                    "order": 1
                  }
                ],
                "occurrences": [
                  {
                    "occurrenceId": "page:1/quiz:0/group:0/occurrence:0",
                    "order": 0,
                    "answers": [
                      {
                        "questionId": "q_nome_grupo",
                        "answerId": "ans_101",
                        "rawValue": "Evangelho",
                        "displayValue": "Evangelho"
                      },
                      {
                        "questionId": "q_dia_grupo",
                        "answerId": "ans_102",
                        "rawValue": "Terça-feira",
                        "displayValue": "Terça-feira"
                      }
                    ]
                  },
                  {
                    "occurrenceId": "page:1/quiz:0/group:0/occurrence:1",
                    "order": 1,
                    "answers": [
                      {
                        "questionId": "q_nome_grupo",
                        "answerId": "ans_103",
                        "rawValue": "Mocidade",
                        "displayValue": "Mocidade"
                      },
                      {
                        "questionId": "q_dia_grupo",
                        "answerId": "ans_104",
                        "rawValue": "",
                        "displayValue": ""
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "createdAt": "2026-06-08T12:00:00.000Z",
  "updatedAt": "2026-06-08T12:00:00.000Z"
}
```

## 7. Identificadores estáveis

Hoje os grupos do formulário não têm `_id` próprio no frontend. Isso obriga a usar a
posição estrutural como chave:

```text
page:{pageIndex}/quiz:{quizIndex}/group:{groupIndex}
```

Esse caminho é suficiente para um snapshot histórico, porque o snapshot guarda a estrutura
congelada daquele momento.

Para evolução futura do backend, o ideal é que o formulário passe a armazenar IDs estáveis
para:

- página;
- quiz;
- grupo;
- ocorrência de grupo múltiplo.

O ponto mais importante é a ocorrência. A coleção `answers` deveria ganhar um campo como:

```text
GROUP_INSTANCE_ID
```

Assim, as respostas de uma mesma ocorrência não dependeriam mais de alinhamento por índice.

## 8. Mudança recomendada em `answers`

Embora seja possível criar um summary correto apenas no momento da finalização, a causa
estrutural do problema também existe em `/answers`: as respostas de grupos múltiplos não
possuem identificador de ocorrência.

Campos recomendados para `answers`:

```ts
type AnswerV2 = {
  _id: string;
  CENTRO_ID: string;
  FORM_ID: string;
  QUESTION_ID: string;
  QUIZ_ID?: string;

  GROUP_KEY: string;
  GROUP_INSTANCE_ID: string;
  GROUP_OCCURRENCE_ORDER: number;
  QUESTION_ORDER: number;

  ANSWER: string;
  createdAt: string;
  updatedAt: string;
};
```

Para grupos simples:

```text
GROUP_INSTANCE_ID = `${GROUP_KEY}/occurrence:0`
GROUP_OCCURRENCE_ORDER = 0
```

Para grupos múltiplos:

```text
GROUP_INSTANCE_ID = id gerado na criação da ocorrência
GROUP_OCCURRENCE_ORDER = posição visual da ocorrência
```

Essa mudança permitiria reconstruir ocorrências de forma explícita, sem depender da ordem
em que `/answers` retorna os documentos.

## 9. Onde montar o snapshot

Existem duas alternativas.

### Alternativa A: frontend monta o snapshot completo

O frontend enviaria para `POST /summaries` a estrutura completa de páginas, grupos,
ocorrências e respostas.

Vantagens:

- reutiliza exatamente a projeção visual de `/cadastro`;
- exige menos lógica nova no backend.

Riscos:

- o cliente vira responsável por um documento histórico sensível;
- alterações ou bugs no frontend podem gerar snapshots inconsistentes;
- fica mais difícil validar permissões e integridade no backend.

### Alternativa B: backend monta o snapshot completo

O frontend enviaria apenas:

```json
{
  "FORM_ID": "665e00000000000000000001",
  "CENTRO_ID": "61b0ba8171572500128b85e1"
}
```

O backend buscaria o formulário, buscaria as answers do centro e construiria o snapshot.

Vantagens:

- centraliza a regra de persistência;
- permite validar estrutura, permissões e integridade;
- evita confiar no cliente para montar o documento histórico;
- facilita migração para `GROUP_INSTANCE_ID`.

Riscos:

- o backend precisa implementar a mesma projeção usada pelo frontend;
- sem transação ou trava, answers podem mudar durante a geração do snapshot;
- enquanto `answers` não tiver `GROUP_INSTANCE_ID`, o backend ainda precisará respeitar a
  ordem atual dos arrays para manter compatibilidade.

Recomendação: usar a alternativa B. O snapshot histórico é responsabilidade do backend.
Se a implementação inicial precisar ser incremental, o frontend pode enviar um campo de
debug ou uma projeção auxiliar, mas o backend deve reconstruir e validar o documento antes
de persistir.

## 10. Contrato de API recomendado

### Criar summary

```text
POST /summaries
```

Payload mínimo:

```json
{
  "FORM_ID": "665e00000000000000000001",
  "CENTRO_ID": "61b0ba8171572500128b85e1"
}
```

Resposta:

```json
{
  "_id": "665f00000000000000000001",
  "schemaVersion": 2,
  "CENTRO_ID": "61b0ba8171572500128b85e1",
  "FORM_ID": "665e00000000000000000001",
  "createdAt": "2026-06-08T12:00:00.000Z"
}
```

### Buscar summary

```text
GET /summaries/:id
```

Deve retornar o documento v2 completo.

Para compatibilidade temporária, o backend pode manter `QUESTIONS` como campo derivado:

```ts
QUESTIONS?: Array<{
  QUESTION: string;
  ANSWER: string;
}>;
```

Esse campo legado não deve ser usado como fonte canônica. Ele só serve para telas antigas
até a migração.

### Validar por coordenação

```text
PATCH /summaries/:id/validated-by-coord
```

Deve atualizar metadados de validação sem regravar `formSnapshot`.

## 11. Modelo mínimo viável

Se o backend precisar de uma mudança menor antes do modelo hierárquico completo, o mínimo
aceitável é permitir duplicidade explícita em `QUESTIONS` com metadados de grupo:

```ts
type SummaryQuestionV2Minimal = {
  QUESTION: string;
  ANSWER: string;
  ANSWER_ID?: string;

  PAGE_KEY: string;
  QUIZ_KEY: string;
  GROUP_KEY: string;
  IS_MULTIPLE: boolean;
  OCCURRENCE_ID: string;
  OCCURRENCE_ORDER: number;
  QUESTION_ORDER: number;

  QUESTION_LABEL: string;
  ANSWER_TYPE: string;
};
```

Esse formato corrige a perda de dados repetidos, mas ainda é pior que o modelo
hierárquico porque:

- torna mais difícil renderizar o histórico como formulário;
- exige reagrupar dados em toda leitura;
- mistura estrutura e resposta no mesmo array;
- aumenta o risco de ordenação incorreta.

## 12. Migração

Plano recomendado:

1. Adicionar `schemaVersion`.
2. Manter leitura de summaries v1.
3. Fazer novas finalizações criarem summaries v2.
4. Atualizar telas históricas para preferirem `formSnapshot` quando `schemaVersion === 2`.
5. Manter `QUESTIONS` legado apenas como derivado temporário.
6. Depois de estabilizar v2, remover dependência de `QUESTIONS` nas telas.

Summaries v1 não podem ser migrados com fidelidade total quando já perderam ocorrências
múltiplas. O backend pode reconstruir um v2 aproximado a partir de `/answers`, mas esse
documento deve ser marcado:

```ts
reconstruction?: {
  source: "current_answers";
  reconstructedAt: string;
  historicalIntegrity: "approximate";
};
```

Isso evita tratar uma reconstrução do estado atual como histórico verdadeiro.

## 13. Índices sugeridos

```text
{ CENTRO_ID: 1, createdAt: -1 }
{ FORM_ID: 1, createdAt: -1 }
{ schemaVersion: 1, createdAt: -1 }
{ status: 1, createdAt: -1 }
```

Se houver consultas analíticas por pergunta, preferir materializar `answersFlat` e indexar:

```text
{ "answersFlat.questionId": 1, createdAt: -1 }
{ "answersFlat.groupKey": 1, createdAt: -1 }
```

Esses índices devem ser validados contra o volume real antes de entrar em produção.

## 14. Riscos e trade-offs

- Documento maior: duplicar estrutura do formulário aumenta o tamanho do summary.
- BSON 16 MB: improvável para o cadastro atual, mas deve ser monitorado.
- Consultas analíticas: estrutura hierárquica é melhor para histórico e renderização, mas
  pior para agregações; `answersFlat` mitiga isso.
- Evolução de formulário: snapshot deve preservar labels antigos mesmo que o formulário
  atual mude.
- LGPD: o summary v2 continua contendo dados sensíveis; filtros públicos devem ser
  aplicados na leitura, nunca removendo dados do snapshot interno.
- Ordem atual: enquanto `GROUP_INSTANCE_ID` não existir, snapshots novos ainda dependem da
  ordem retornada por `/answers`.

## 15. Decisões recomendadas

- Criar `summary.schemaVersion = 2`.
- Persistir `formSnapshot` completo e imutável.
- Persistir grupos múltiplos como `occurrences[]`.
- Manter `answersFlat` apenas como índice derivado.
- Montar o snapshot no backend durante `POST /summaries`.
- Evoluir `answers` para incluir `FORM_ID`, `GROUP_KEY`, `GROUP_INSTANCE_ID` e ordem.
- Manter compatibilidade temporária com `QUESTIONS`, mas não usá-lo como fonte canônica.

