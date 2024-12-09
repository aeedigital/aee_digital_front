import { useEffect, useState } from 'react';

export function ValidationTab({ questions, answersCache, formId, centroId }: { questions: any[]; answersCache: Record<string, any[]>, formId:string | undefined, centroId:string }) {
  const [invalidQuestions, setInvalidQuestions] = useState<any[]>([]);


console.log("BOTAO SUBMIT", questions, answersCache)

  useEffect(() => {
    const flattenedQuestions = questions.flatMap((q) => q.GROUP || []);

    const invalid = flattenedQuestions.filter((q) => {
      const answers = answersCache[q._id] || [];
      return q.IS_REQUIRED && (answers.length === 0 || answers.some((a) => !a.ANSWER || a.ANSWER.trim() === ''));
    });

    setInvalidQuestions(invalid);
  }, [questions, answersCache]);

  const handleSubmit = async () => {
    try {
      const allAnswers = questions.flatMap((q) => q.GROUP || []).map((q) => {
        const answers = answersCache[q._id] || [];
        console.log("AA",q._id, answers)
        return {
          QUESTION: q._id,
          ANSWER: answers.length > 0 ? answers[0].ANSWER : "",
        };
      });

      console.log("ANSWERS", allAnswers)

      const payload = {
        FORM_ID: formId, // Replace with the actual FORM_ID
        CENTRO_ID: centroId, // Replace with the actual CENTRO_ID
        QUESTIONS: allAnswers,
      };
      const response: Response = await fetch("http://localhost:5000/summaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao finalizar o formulário");
      }

      alert("Formulário finalizado com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar o formulário:", error);
      alert("Ocorreu um erro ao finalizar o formulário.");
    }
  };

  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-xl font-semibold mb-4">Validação ({invalidQuestions.length})</h2>
      {invalidQuestions.length === 0 ? (
        <div>
          <p className="text-green-500 mb-4">Todas as questões obrigatórias estão preenchidas.</p>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Finalizar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {invalidQuestions.map((q) => (
            <div key={q._id} className="border p-2 rounded-md">
              <p className="text-red-500 font-medium">{q.QUESTION}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
