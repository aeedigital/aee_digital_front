import { describe, expect, it } from "vitest";

import { buildCadastroAnswersCache, projectCadastroPages } from "@/lib/cadastroViewModel";
import { buildCadastroCsvContent, escapeCsvValue, formatCadastroAnswerForCsv } from "@/lib/summaryCsv";
import {
  answersCentroA,
  answersCentroB,
  cadastroForm,
  centroA,
  centroB,
  questions,
} from "../../fixtures/cadastroViewModel";

function buildRow(centro: typeof centroA, answers = answersCentroA) {
  const cache = buildCadastroAnswersCache(answers);

  return {
    centroId: centro._id,
    centroNome: centro.NOME_CENTRO,
    centroNomeCurto: centro.NOME_CURTO,
    form: cadastroForm,
    projectedPages: projectCadastroPages(cadastroForm, cache, { centroId: centro._id }),
    regionalNome: "Regional Teste",
  };
}

describe("summaryCsv cadastro serialization", () => {
  it("serializes projected cadastro rows instead of summaries", () => {
    const content = buildCadastroCsvContent({
      rows: [buildRow(centroA)],
    });

    expect(content).toContain('"Centro ID";"Centro";"Nome curto";"Formulário ID"');
    expect(content).toContain('"Primeiro visível"');
    expect(content).not.toContain("Segundo ignorado");
    expect(content).not.toContain("Não aparece no cadastro");
  });

  it("expands multiple group columns to the maximum occurrence count across rows", () => {
    const content = buildCadastroCsvContent({
      includeRegional: true,
      rows: [buildRow(centroA), buildRow(centroB, answersCentroB)],
    });

    expect(content).toContain("Equipe / Grupo 1 / Ocorrência 3 / Nome do integrante");
    expect(content).toContain('"Regional Teste";"centro_a"');
    expect(content).toContain('"Regional Teste";"centro_b"');
  });

  it("formats values by answer type", () => {
    expect(formatCadastroAnswerForCsv(answersCentroA[2], questions.bool)).toBe("NÃO");
    expect(formatCadastroAnswerForCsv(answersCentroB[1], questions.bool)).toBe("SIM");
    expect(formatCadastroAnswerForCsv(answersCentroA[3], questions.date)).toBe("07/06/2026");
    expect(formatCadastroAnswerForCsv(answersCentroA[8], questions.memberName)).toBe("");
  });

  it("escapes values and neutralizes formula prefixes", () => {
    expect(escapeCsvValue('valor "A"; B')).toBe('"valor ""A""; B"');
    expect(escapeCsvValue("=1+1")).toBe('"\'=1+1"');
  });
});
