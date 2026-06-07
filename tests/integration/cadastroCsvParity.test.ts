import { describe, expect, it } from "vitest";

import { buildCadastroAnswersCache, projectCadastroPages } from "@/lib/cadastroViewModel";
import { buildCadastroCsvContent } from "@/lib/summaryCsv";
import { answersCentroA, cadastroForm, centroA } from "../fixtures/cadastroViewModel";

describe("cadastro CSV parity", () => {
  it("exports the same projected values that /cadastro would display", () => {
    const cache = buildCadastroAnswersCache(answersCentroA);
    const projectedPages = projectCadastroPages(cadastroForm, cache, { centroId: centroA._id });
    const displayedSimpleValue =
      projectedPages[0].quizzes[0].groups[0].occurrences[0].questionsAnswered[0].answer.ANSWER;
    const displayedSecondOccurrence =
      projectedPages[0].quizzes[1].groups[0].occurrences[1].questionsAnswered[0].answer.ANSWER;

    const content = buildCadastroCsvContent({
      rows: [
        {
          centroId: centroA._id,
          centroNome: centroA.NOME_CENTRO,
          centroNomeCurto: centroA.NOME_CURTO,
          form: cadastroForm,
          projectedPages,
        },
      ],
    });

    expect(displayedSimpleValue).toBe("Primeiro visível");
    expect(displayedSecondOccurrence).toBe("Maria");
    expect(content).toContain('"Primeiro visível"');
    expect(content).toContain('"Maria"');
  });
});
