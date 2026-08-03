// src/interfaces/form.interface.ts
export interface Question {
  _id: string;
  QUESTION: string;
  ANSWER_TYPE: 'String' | 'LongText' | 'Boolean' | 'Option' | 'Radio' | 'Switch' | 'Date' | 'Time';
  IS_REQUIRED: boolean;
  PRESET_VALUES: string[];
}

export interface QuestionGroup {
  GROUP: Question[];
  IS_MULTIPLE: boolean;
}

export interface Quiz {
  QUESTIONS: QuestionGroup[];
  CATEGORY: string;
}

export interface Page {
  QUIZES: Quiz[];
  PAGE_NAME: string;
  ROLE?: string;
}

export interface Answer {
  _id: string;
  CENTRO_ID: string;
  QUIZ_ID: string;
  QUESTION_ID: string;
  ANSWER: string;
  FORM_ID?: string;
  GROUP_KEY?: string;
  GROUP_INSTANCE_ID?: string;
  GROUP_OCCURRENCE_ORDER?: number;
  QUESTION_ORDER?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Form {
  _id: string;
  NAME: string;
  PAGES: Page[];
  CREATEDBY: string;
  VERSION: number;
}

export interface SummaryResponse {
  ANSWER: string;
  QUESTION: string
  _id: string
  ANSWER_ID?: string;
  GROUP_KEY?: string;
  GROUP_INSTANCE_ID?: string;
  OCCURRENCE_ORDER?: number;
  QUESTION_ORDER?: number;
  QUESTION_LABEL?: string;
  ANSWER_TYPE?: string;
}

export interface SummarySnapshotAnswer {
  questionId: string;
  answerId?: string;
  rawValue: string;
  displayValue: string;
  sourceCreatedAt?: string;
  sourceUpdatedAt?: string;
}

export interface SummaryFormSnapshot {
  id: string;
  name: string;
  version: number;
  pages: Array<{
    pageKey: string;
    pageName: string;
    role?: string;
    order: number;
    quizzes: Array<{
      quizKey: string;
      category: string;
      order: number;
      groups: Array<{
        groupKey: string;
        isMultiple: boolean;
        order: number;
        questions: Array<{
          questionId: string;
          label: string;
          answerType: string;
          isRequired: boolean;
          presetValues: string[];
          order: number;
        }>;
        occurrences: Array<{
          occurrenceId: string;
          order: number;
          answers: SummarySnapshotAnswer[];
        }>;
      }>;
    }>;
  }>;
}

export interface SummaryAttendance {
  ATIVIDADES: Array<{
    CODIGO: string;
    NOME: string;
    PUBLICO?: string;
    ENCONTROS: Array<{ DIA: string; HORARIO_INICIO: string; GROUP_INSTANCE_ID: string }>;
  }>;
  PUBLICOS: unknown[];
}

export interface Summary {
  _id: string;
  CENTRO_ID: string;
  FORM_ID: string;
  QUESTIONS: SummaryResponse[];
  createdAt: string;
  updatedAt: string;
  validatedByCoordAt?: string;
  schemaVersion?: number;
  FORM_SNAPSHOT?: SummaryFormSnapshot;
  COORDINATION_SNAPSHOT?: SummaryFormSnapshot;
  ATENDIMENTOS?: SummaryAttendance;
  DIVULGACAO_AUTORIZADA?: boolean;
}

export interface QuestionAnswer {
  question: Question;
  answer?: Answer;
}
