export type PublicDataHideRule = {
  /**
   * ID da pergunta (quando disponível no payload).
   */
  questionId?: string;
  /**
   * Texto exato da pergunta a ser ocultada.
   */
  question?: string;
  /**
   * Trecho do texto da pergunta para correspondência parcial (case-insensitive).
   */
  partial?: string;
};

/**
 * Algumas respostas não são exibidas por questão de LGPD.
 * Adicione regras aqui ou em PUBLIC_HIDDEN_EXTRA (lista separada por vírgula).
 */
const ENV_EXTRA = process.env.PUBLIC_HIDDEN_EXTRA;

const envRules: PublicDataHideRule[] = ENV_EXTRA
  ? ENV_EXTRA.split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((questionId) => ({ questionId }))
  : [];

export const PUBLIC_DATA_HIDE_RULES: PublicDataHideRule[] = [
  { question: "Seu Nome" },
  { question: "Seu Telefone" },
  { question: "Seu E-mail" },
  { partial: "Nome do Presidente" },
  { partial: "Telefone do Presidente" },
  { partial: "E-mail do Presidente" },
  { partial: "Nome do Responsável" },
  { partial: "Telefone do Responsável" },
  { partial: "E-mail do Responsável" },
  ...envRules,
];
