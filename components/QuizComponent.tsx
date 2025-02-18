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
      {quiz.QUESTIONS.map((questions, questionIndex) => (
        <GroupQuestionComponent
          key={questionIndex}
          centroId={centroId}
          questionGroup={questions}
          initialCache = {initialCache}
          onAnswerChange = {onAnswerChange}
        />
      ))}
    </div>
  );
}
