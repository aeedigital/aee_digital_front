import { GroupQuestionComponent } from './GroupQuestionComponent';
import { Quiz } from '@/interfaces/form.interface';

interface QuizProps {
  quiz: Quiz;
  centroId: string;
  answers: any[]
}

export function QuizComponent({ quiz, centroId, answers }: QuizProps) {
  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-xl font-semibold">{quiz.CATEGORY}</h2>
      {quiz.QUESTIONS.map((questions, questionIndex) => (
        <GroupQuestionComponent
          key={questionIndex}
          centroId={centroId}
          questionGroup={questions}
          answers={answers}
        />
      ))}
    </div>
  );
}
