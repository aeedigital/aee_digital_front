"use client";

import { useEffect, useRef, useState } from 'react';

import House_Card from '@/components/House_Card';
import { Question} from '@/interfaces/form.interface'
import ValidacaoCoordenacao from '@/components/ValidacaoCoordenacao';
import { getCadastroInfo } from "@/app/actions/cadastroInfo";
import { appendDatePeriod, Period } from '@/app/helpers/datePeriodHelper';
import { Centro } from '@/interfaces/centro.interface';


const SkeletonCard = () => (
  <div style={{ width: "300px", height: "200px", margin: "10px", background: "#e0e0e0", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
);

export default function MainPage({params}:any) {
  const { regionalId } = params;

  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const [centros, setCentros] = useState([]);
  const [coordenador, setCoordenador] = useState("");
  const [totalRespostas, setTotalRespostas] = useState(0);
  const [totalCentros, setTotalCentros] = useState(0);
  const [summaryByCentroId, setSummaryByCentroId] = useState<{ [key: string]: any }>({});
  
  const hasLoadedRef = useRef(false); // Use useRef instead of useState
  const [avaliacaoQuestion, setAvaliacaoQuestion] = useState<Question >({
    _id: "",
  QUESTION: "",
  ANSWER_TYPE: "String",
  IS_REQUIRED: false,
  PRESET_VALUES: []
  })
  const [questoes_coordenador, setCoordenadorQuestoes]= useState<Question[]>([{
    _id: "",
  QUESTION: "",
  ANSWER_TYPE: "String",
  IS_REQUIRED: false,
  PRESET_VALUES: []
  }])
  const [formulario, setFormulario] = useState({})

  function findQuestionByCategory(form: any, category: string) {

    // Iterar sobre as páginas
    for (const page of form.PAGES) {
      // Iterar sobre os quizzes em cada página
      for (const quiz of page.QUIZES) {
        if (quiz.CATEGORY === category) {
          // Se a categoria corresponder, procurar pela questão
          return quiz;
        }
      }
    }
  }

  useEffect(()=>{
    async function fetchData() {

      if (hasLoadedRef.current) {
        return;
      }

      hasLoadedRef.current = true; // Set ref value to true to prevent further calls

      const cadastroInfo = await getCadastroInfo();

      let summariesPath = `/api/regionais/${regionalId}/summaries`;

      if (cadastroInfo?.start && cadastroInfo?.end) {
        summariesPath = appendDatePeriod(summariesPath, { start: cadastroInfo.start, end: cadastroInfo.end });
        }

      let [regionalData, centrosData, summariesData, formData] = await Promise.all([
        fetch(`/api/regionais/${regionalId}`).then((res) => res.json()),
        fetch(`/api/centros?REGIONAL=${regionalId}`).then((res) => res.json()),
        fetch(summariesPath).then((res) => res.json()),
        fetch(`/api/forms?_id=${cadastroInfo.formId}`).then((res) => res.json())
      ])

      const coordenador = await fetch(`/api/pessoas/${regionalData.COORDENADOR_ID}`).then((res) => res.json())

      const form = formData[0]

      setFormulario(form)
      const avaliacaoCategory = findQuestionByCategory(form, "Auto Avaliação")
      let coord_quiz = findQuestionByCategory(form,"Coordenador");


      let autoavaliacaoQuestion = avaliacaoCategory.QUESTIONS[0].GROUP[0];
      let questoes = coord_quiz.QUESTIONS[0].GROUP;

      setAvaliacaoQuestion(autoavaliacaoQuestion)
      setCoordenadorQuestoes(questoes);

      setCoordenador(coordenador.NOME);
      setCentros(centrosData);


      const UniqueSummariesDataByCentroId = summariesData.reduce((acc: any, summary: any) => {
        if (!acc[summary.CENTRO_ID]) {
          acc[summary.CENTRO_ID] = summary;
        }
        return acc;
      }
      , {});


      const summaries: { [key: string]: any[] } = {}
      for (const summary of summariesData) {
        if(!summaries[summary.CENTRO_ID]){
          summaries[summary.CENTRO_ID] = []
        }
        summaries[summary.CENTRO_ID].push(summary)
      }

      setSummaryByCentroId(summaries);

      setTotalRespostas(Object.keys(UniqueSummariesDataByCentroId).length);
      setTotalCentros(centrosData.length);

      setLoading(false); // Finaliza o estado de carregamento

    }

    fetchData();
  },[regionalId])

  return (
    <div>
      {loading ? (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <SkeletonCard />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <ValidacaoCoordenacao
            coordenador={coordenador}
            totalRespostas={totalRespostas}
            totalCentros={totalCentros}
            regionalId={regionalId}
          />

          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {centros.map((centro: Centro) => (
              <House_Card
                key={centro._id}
                centro={centro}
                avaliacao_question={avaliacaoQuestion}
                coordenador_questions={questoes_coordenador}
                form={formulario}
                summaries = {summaryByCentroId[centro._id]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
