import { describe, expect, it } from "vitest";

import {
  buildCadastroAnswersCache,
  getCadastroVisiblePages,
  projectCadastroPages,
  projectCadastroQuestionGroup,
  selectCurrentCadastroForm,
} from "@/lib/cadastroViewModel";
import {
  answersCentroA,
  cadastroForm,
  olderCadastroForm,
  questions,
} from "../../fixtures/cadastroViewModel";

describe("cadastroViewModel", () => {
  it("selects the first form returned by the cadastro query", () => {
    expect(selectCurrentCadastroForm([cadastroForm, olderCadastroForm])).toBe(cadastroForm);
  });

  it("filters out coord_regional pages and preserves visible page order", () => {
    const visiblePages = getCadastroVisiblePages(cadastroForm);

    expect(visiblePages).toHaveLength(1);
    expect(visiblePages[0].PAGE_NAME).toBe("Dados gerais");
  });

  it("builds the answers cache preserving API order", () => {
    const cache = buildCadastroAnswersCache(answersCentroA);

    expect(cache[questions.text._id].map((answer) => answer.ANSWER)).toEqual([
      "Primeiro visível",
      "Segundo ignorado",
    ]);
    expect(cache[questions.memberName._id].map((answer) => answer.ANSWER)).toEqual(["João", "Maria", " "]);
  });

  it("projects a simple group with only answer index zero", () => {
    const cache = buildCadastroAnswersCache(answersCentroA);
    const group = cadastroForm.PAGES[0].QUIZES[0].QUESTIONS[0];
    const projected = projectCadastroQuestionGroup(group, cache, { centroId: "centro_a" });

    expect(projected.occurrences).toHaveLength(1);
    expect(projected.occurrences[0].questionsAnswered[0].answer.ANSWER).toBe("Primeiro visível");
  });

  it("projects a multiple group by index-aligned occurrences", () => {
    const cache = buildCadastroAnswersCache(answersCentroA);
    const group = cadastroForm.PAGES[0].QUIZES[1].QUESTIONS[0];
    const projected = projectCadastroQuestionGroup(group, cache, { centroId: "centro_a" });

    expect(projected.occurrences).toHaveLength(3);
    expect(projected.occurrences[0].questionsAnswered.map(({ answer }) => answer.ANSWER)).toEqual([
      "João",
      "Coordenação",
    ]);
    expect(projected.occurrences[1].questionsAnswered.map(({ answer }) => answer.ANSWER)).toEqual([
      "Maria",
      "Apoio",
    ]);
    expect(projected.occurrences[2].questionsAnswered.map(({ answer }) => answer.ANSWER)).toEqual([" ", ""]);
  });

  it("projects visible cadastro pages without coord_regional content", () => {
    const cache = buildCadastroAnswersCache(answersCentroA);
    const pages = projectCadastroPages(cadastroForm, cache, { centroId: "centro_a" });

    expect(pages).toHaveLength(1);
    expect(pages[0].quizzes.map((quiz) => quiz.category)).toEqual(["Identificação", "Equipe"]);
  });
});
