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
}

export interface Summary {
  _id: string;
  CENTRO_ID: string;
  FORM_ID: string;
  QUESTIONS: SummaryResponse[];
  createdAt: string;
  updatedAt: string;
  validatedByCoordAt?: string;
}

export interface QuestionAnswer {
  question: Question;
  answer?: Answer;
}
