import { describe, expect, it } from "vitest";

import { buildCadastroCsvContentForCentros, buildCadastroCsvRowsForCentros } from "@/lib/cadastroCsvExport";
import {
  answersCentroA,
  answersCentroB,
  cadastroForm,
  centroA,
  centroB,
} from "../../fixtures/cadastroViewModel";

describe("cadastroCsvExport", () => {
  it("builds one row per center with injected canonical answer loading", async () => {
    const rows = await buildCadastroCsvRowsForCentros({
      centros: [centroA, centroB],
      form: cadastroForm,
      loadAnswers: async (centroId) => (centroId === centroA._id ? answersCentroA : answersCentroB),
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].centroId).toBe(centroA._id);
    expect(rows[1].centroId).toBe(centroB._id);
  });

  it("includes regional column for Alliance exports", async () => {
    const content = await buildCadastroCsvContentForCentros({
      centros: [{ ...centroA, regionalNome: "Regional A" }],
      form: cadastroForm,
      includeRegional: true,
      loadAnswers: async () => answersCentroA,
    });

    expect(content.split("\r\n")[0]).toContain('"Regional";"Centro ID"');
    expect(content).toContain('"Regional A";"centro_a"');
  });
});
