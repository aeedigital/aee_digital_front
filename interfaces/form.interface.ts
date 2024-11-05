// src/interfaces/form.interface.ts
export interface Question {
  _id: string;
  QUESTION: string;
  ANSWER_TYPE: 'String' | 'Boolean' | 'Option' | 'Date';
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
}

export interface Form {
  _id: string;
  NAME: string;
  PAGES: Page[];
  CREATEDBY: string;
  VERSION: number;
}
