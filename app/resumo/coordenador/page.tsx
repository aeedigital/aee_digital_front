"use client";

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import House_Card from '@/components/House_Card';
import { Question, Summary} from '@/interfaces/form.interface'
import ValidacaoCoordenacao from '@/components/ValidacaoCoordenacao';
import { getCadastroInfo } from "@/app/actions/cadastroInfo";
import { appendDatePeriod, Period } from '@/app/helpers/datePeriodHelper';
import { Centro } from '@/interfaces/centro.interface';
import { Pessoa } from '@/interfaces/pessoas.interface';
import { apiUrl } from '@/lib/api';


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import CentroDialog from '@/components/CreateCentro';

const SkeletonCard = () => (
  <div style={{ width: "300px", height: "200px", margin: "10px", background: "#e0e0e0", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
);

async function safeJson(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Falha na requisição (${response.status})`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export default function ResumoCoordenadorWrapper() {
  return (
    <Suspense fallback={<div>Carregando regional...</div>}>
      <MainPage />
    </Suspense>
  );
}

function MainPage() {
  const searchParams = useSearchParams();
  const regionalId = searchParams.get('regionalId');

  const { user } = useUser();

  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const [centros, setCentros] = useState<Centro[]>([]);
  const [coordenadores, setCoordenadores] = useState<Pessoa[]>([]);
  const [selectedCoordenador, setSelectedCoordenador] = useState<string | undefined>("");
  const [regionalInfo, setRegionalInfo] = useState<any>({});

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

  const [openDialog, setOpenDialog] = useState(false);
  const [novoCentro, setNovoCentro] = useState({
    NOME_CENTRO: "",
    NOME_CURTO: "",
  });

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

      if (hasLoadedRef.current || !regionalId) {
        return;
      }

      hasLoadedRef.current = true; // Set ref value to true to prevent further calls

      const cadastroInfo = await getCadastroInfo();

      let summariesPath = apiUrl(`/regionais/${regionalId}/summaries`);

      if (cadastroInfo?.start && cadastroInfo?.end) {
        summariesPath = appendDatePeriod(summariesPath, { start: cadastroInfo.start, end: cadastroInfo.end });
        }

      let [regionalData, centrosData, summariesData, formData, pessoasData] = await Promise.all([
        fetch(apiUrl(`/regionais/${regionalId}`)).then(safeJson),
        fetch(apiUrl(`/centros?REGIONAL=${regionalId}&STATUS=Pendente,Integrada,Inscrita`)).then(safeJson),
        fetch(summariesPath).then(safeJson),
        fetch(apiUrl(`/forms?_id=${cadastroInfo.formId}`)).then(safeJson),
        fetch(apiUrl(`/pessoas`)).then(safeJson)
      ])

      const coordenador = regionalData?.COORDENADOR_ID
        ? await fetch(apiUrl(`/pessoas/${regionalData.COORDENADOR_ID}`)).then(safeJson)
        : null;

      const form = formData[0]

      setFormulario(form)
      const avaliacaoCategory = findQuestionByCategory(form, "Auto Avaliação")
      let coord_quiz = findQuestionByCategory(form,"Coordenador");


      let autoavaliacaoQuestion = avaliacaoCategory.QUESTIONS[0].GROUP[0];
      let questoes = coord_quiz.QUESTIONS[0].GROUP;

      setCoordenadores(pessoasData);

      setAvaliacaoQuestion(autoavaliacaoQuestion);
      setCoordenadorQuestoes(questoes);

      setSelectedCoordenador(coordenador?.NOME ?? "");
      setCentros(centrosData);
      setRegionalInfo(regionalData);

      summariesData.sort((a: any, b: any) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      const UniqueSummariesDataByCentroId = summariesData.reduce((acc: any, summary: any) => {
        if (!acc[summary.CENTRO_ID]) {
          acc[summary.CENTRO_ID] = summary;
        }
        return acc;
      }, {});

      const summaries: { [key: string]: any[] } = {};
      for (const summary of summariesData) {
        if (!summaries[summary.CENTRO_ID]) {
          summaries[summary.CENTRO_ID] = [];
        }
        summaries[summary.CENTRO_ID].push(summary);
      }

      setSummaryByCentroId(summaries);

      setTotalRespostas(Object.keys(UniqueSummariesDataByCentroId).length);
      setTotalCentros(centrosData.length);

      setLoading(false); // Finaliza o estado de carregamento

    }

    fetchData();
  },[regionalId])


  function handleCentroCreated(newCentro: Centro) {
    setCentros([...centros, newCentro]);
    setTotalCentros(prev => prev + 1);
  }

  async function UpdateCoordinator(nameCoordinator: string){
    try {
      if (!regionalId) {
        throw new Error("Regional não informada");
      }

      let coordenador: Pessoa|undefined = coordenadores.find((coordenador: Pessoa) => coordenador.NOME === nameCoordinator);
      const coordenadorId = coordenador?._id;

      const response = await fetch(apiUrl(`/regionais/${regionalId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({COORDENADOR_ID: coordenadorId}),
      });
      const data = await response.json();
      console.log("data", data)

      setSelectedCoordenador(coordenador?.NOME);
      
    } catch (error) {
      console.log("Erro ao atualizar coordenador", error)
      throw new Error("Erro ao atualizar coordenador")
    }
  }

  const collectQuestions = () => {
    const questions: Question[] = [];
    (formulario as any)?.PAGES?.forEach((page: any) => {
      page.QUIZES?.forEach((quiz: any) => {
        quiz.QUESTIONS?.forEach((group: any) => {
          group.GROUP?.forEach((q: Question) => questions.push(q));
        });
      });
    });
    return questions;
  };

  const exportLatestSummaries = () => {
    const questions = collectQuestions();
    if (!questions.length) {
      alert("Não foi possível encontrar perguntas para montar o arquivo.");
      return;
    }

    const headers = ["Centro", "Atualizado em", ...questions.map((q) => q.QUESTION)];
    const csvRows: string[] = [];
    const escape = (value: any) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    centros.forEach((centro) => {
      const summaries = summaryByCentroId[centro._id];
      if (!summaries || summaries.length === 0) {
        return;
      }

      const latest = summaries[summaries.length - 1];
      const answersMap = new Map<string, string>();
      latest.QUESTIONS?.forEach((q: any) => {
        answersMap.set(q.QUESTION, q.ANSWER);
      });

      const row = [
        centro.NOME_CENTRO || centro.NOME_CURTO || centro._id,
        latest.updatedAt || latest.createdAt || "",
        ...questions.map((q) => answersMap.get(q._id) ?? "")
      ];
      csvRows.push(row.map(escape).join(";"));
    });

    if (!csvRows.length) {
      alert("Nenhum resumo encontrado para exportar.");
      return;
    }

    const csvContent = [headers.map(escape).join(";"), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resumos_coordenador.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {!regionalId ? (
        <div>Selecione uma regional para visualizar os dados.</div>
      ) : loading ? (
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
            coordenador={
              user?.role === "admin" ? (
                  <Select
                    value={selectedCoordenador}
                    onValueChange={(newValue) => {
                      console.log("newValue", newValue)
                      UpdateCoordinator(newValue)
                    }}
                    disabled={false}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      {coordenadores.map((coordenador) => (
                        <SelectItem key={coordenador._id} value={coordenador.NOME}>
                          {coordenador.NOME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>)
        : (selectedCoordenador)}
            totalRespostas={totalRespostas}
            totalCentros={totalCentros}
            regionalId={regionalId}
          />

            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={exportLatestSummaries}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Exportar últimos resumos (CSV)
              </button>
              {user?.role === "admin" && (
                <CentroDialog regional={regionalInfo} onCentroCreated={handleCentroCreated} />
              )}
            </div>

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
