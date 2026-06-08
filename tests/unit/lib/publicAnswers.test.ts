import { describe, expect, it } from "vitest";

import { filterResponsesForPublic, filterSummaryForPublic } from "@/lib/publicAnswers";

const sampleSummary = {
    _id: "summary_1",
    FORM_ID: "form_current",
    QUESTIONS: [
        { _id: "secret_question", QUESTION: "CPF", ANSWER: "123" },
        { _id: "visible_question", QUESTION: "Nome do centro", ANSWER: "Centro A" },
    ],
};

const sampleResponses = [
    { _id: "secret_question", QUESTION: "CPF", ANSWER: "123" },
    { _id: "visible_question", QUESTION: "Nome do centro", ANSWER: "Centro A" },
];

const hideRules = [{ questionId: "secret_question" }];

describe("publicAnswers LGPD filtering", () => {
    it("filters public summary questions using LGPD hide rules", () => {
        const filtered = filterSummaryForPublic(sampleSummary as any, hideRules);

        expect(filtered.QUESTIONS).toHaveLength(1);
        expect(filtered.QUESTIONS?.[0]._id).toBe("visible_question");
    });

    it("filters isolated public responses using LGPD hide rules", () => {
        const filtered = filterResponsesForPublic(sampleResponses as any, hideRules);

        expect(filtered).toHaveLength(1);
        expect(filtered[0]._id).toBe("visible_question");
    });
});
