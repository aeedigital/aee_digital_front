import { GroupQuestionComponent } from './GrouQuestionComponent';
import { Quiz } from '@/interfaces/form.interface';

interface QuizProps {
  quiz: Quiz;
  centroId: string;
}

export function QuizComponent({ quiz, centroId }: QuizProps) {
  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-xl font-semibold">{quiz.CATEGORY}</h2>
      {quiz.QUESTIONS.map((questions, questionIndex) => (
        <GroupQuestionComponent
          key={questionIndex}
          centroId={centroId}
          questionGroup={questions}
        />
      ))}
    </div>
  );
}
