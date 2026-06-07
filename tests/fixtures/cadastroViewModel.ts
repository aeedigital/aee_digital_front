import { Centro } from "@/interfaces/centro.interface";
import { Answer, Form, Question } from "@/interfaces/form.interface";

function question(value: Question): Question {
  return value;
}

export const questions = {
  bool: question({
    _id: "q_bool",
    ANSWER_TYPE: "Boolean",
    IS_REQUIRED: false,
    PRESET_VALUES: [],
    QUESTION: "Aceita divulgação?",
  }),
  coord: question({
    _id: "q_coord",
    ANSWER_TYPE: "String",
    IS_REQUIRED: false,
    PRESET_VALUES: [],
    QUESTION: "Observação da coordenação",
  }),
  date: question({
    _id: "q_date",
    ANSWER_TYPE: "Date",
    IS_REQUIRED: false,
    PRESET_VALUES: [],
    QUESTION: "Data da atividade",
  }),
  memberName: question({
    _id: "q_member_name",
    ANSWER_TYPE: "String",
    IS_REQUIRED: false,
    PRESET_VALUES: [],
    QUESTION: "Nome do integrante",
  }),
  memberRole: question({
    _id: "q_member_role",
    ANSWER_TYPE: "Option",
    IS_REQUIRED: false,
    PRESET_VALUES: ["Coordenação", "Apoio"],
    QUESTION: "Função do integrante",
  }),
  text: question({
    _id: "q_text",
    ANSWER_TYPE: "String",
    IS_REQUIRED: true,
    PRESET_VALUES: [],
    QUESTION: "Nome do responsável",
  }),
};

export const cadastroForm: Form = {
  _id: "form_current",
  CREATEDBY: "tester",
  NAME: "Cadastro de Informações Anual",
  VERSION: 3,
  PAGES: [
    {
      PAGE_NAME: "Dados gerais",
      QUIZES: [
        {
          CATEGORY: "Identificação",
          QUESTIONS: [
            {
              IS_MULTIPLE: false,
              GROUP: [questions.text],
            },
            {
              IS_MULTIPLE: false,
              GROUP: [questions.bool, questions.date],
            },
          ],
        },
        {
          CATEGORY: "Equipe",
          QUESTIONS: [
            {
              IS_MULTIPLE: true,
              GROUP: [questions.memberName, questions.memberRole],
            },
          ],
        },
      ],
    },
    {
      PAGE_NAME: "Coordenação",
      ROLE: "coord_regional",
      QUIZES: [
        {
          CATEGORY: "Análise",
          QUESTIONS: [
            {
              IS_MULTIPLE: false,
              GROUP: [questions.coord],
            },
          ],
        },
      ],
    },
  ],
};

export const olderCadastroForm: Form = {
  ...cadastroForm,
  _id: "form_old",
  VERSION: 2,
};

export const centroA: Centro = {
  _id: "centro_a",
  NOME_CENTRO: "Centro A",
  NOME_CURTO: "A",
};

export const centroB: Centro = {
  _id: "centro_b",
  NOME_CENTRO: "Centro B",
  NOME_CURTO: "B",
};

export const answersCentroA: Answer[] = [
  {
    _id: "a_text_first",
    ANSWER: "Primeiro visível",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.text._id,
    QUIZ_ID: "",
    createdAt: "2026-06-07T10:00:00.000Z",
  },
  {
    _id: "a_text_second",
    ANSWER: "Segundo ignorado",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.text._id,
    QUIZ_ID: "",
    createdAt: "2026-06-07T09:00:00.000Z",
  },
  {
    _id: "a_bool_false",
    ANSWER: "false",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.bool._id,
    QUIZ_ID: "",
  },
  {
    _id: "a_date",
    ANSWER: "2026-06-07T12:00:00.000Z",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.date._id,
    QUIZ_ID: "",
  },
  {
    _id: "a_member_name_1",
    ANSWER: "João",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.memberName._id,
    QUIZ_ID: "",
  },
  {
    _id: "a_member_role_1",
    ANSWER: "Coordenação",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.memberRole._id,
    QUIZ_ID: "",
  },
  {
    _id: "a_member_name_2",
    ANSWER: "Maria",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.memberName._id,
    QUIZ_ID: "",
  },
  {
    _id: "a_member_role_2",
    ANSWER: "Apoio",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.memberRole._id,
    QUIZ_ID: "",
  },
  {
    _id: "a_member_name_3",
    ANSWER: " ",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.memberName._id,
    QUIZ_ID: "",
  },
  {
    _id: "a_coord",
    ANSWER: "Não aparece no cadastro",
    CENTRO_ID: centroA._id,
    QUESTION_ID: questions.coord._id,
    QUIZ_ID: "",
  },
];

export const answersCentroB: Answer[] = [
  {
    _id: "b_text",
    ANSWER: "=valor sensível",
    CENTRO_ID: centroB._id,
    QUESTION_ID: questions.text._id,
    QUIZ_ID: "",
  },
  {
    _id: "b_bool_true",
    ANSWER: "true",
    CENTRO_ID: centroB._id,
    QUESTION_ID: questions.bool._id,
    QUIZ_ID: "",
  },
];
