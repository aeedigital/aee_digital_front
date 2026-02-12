import { GroupQuestionComponent } from './GroupQuestionComponent';
import { Answer, Quiz } from '@/interfaces/form.interface';

interface QuizProps {
  quiz: Quiz;
  centroId: string;
  initialCache: Record<string, Answer[]>;
  onAnswerChange: (questionId: string, answerId: string | null, newAnswer: Answer | null) => void; // Função para atualizar respostas
}

export function QuizComponent({ quiz, centroId, initialCache, onAnswerChange }: QuizProps) {
  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-xl font-semibold">{quiz.CATEGORY}</h2>
      {quiz.QUESTIONS.map((questionGroup) => {
        const questionIds = questionGroup.GROUP.map((question) => question._id).join("-");
        const groupKey = `${quiz.CATEGORY}-${questionIds}-${questionGroup.IS_MULTIPLE ? "multi" : "single"}`;

        return (
          <GroupQuestionComponent
            key={groupKey}
            centroId={centroId}
            questionGroup={questionGroup}
            initialCache={initialCache}
            onAnswerChange={onAnswerChange}
          />
        );
      })}
    </div>
  );
}
