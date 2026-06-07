"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import House_Card from '@/components/House_Card';
import { Question, Summary, Answer } from '@/interfaces/form.interface'
import ValidacaoCoordenacao from '@/components/ValidacaoCoordenacao';
import { getCadastroInfo } from "@/app/actions/cadastroInfo";
import { Centro } from '@/interfaces/centro.interface';
import { Pessoa } from '@/interfaces/pessoas.interface';
import { apiUrl } from '@/lib/api';
import {
  normalizeSummaries,
} from '@/lib/summaries';
import { extractCoordinatorFormData } from '@/lib/coordinatorQuestions';
import { buildCadastroCsvContentForCentros } from '@/lib/cadastroCsvExport';
import { downloadCsvFile } from '@/lib/summaryCsv';


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import CentroDialog from '@/components/CreateCentro';
import { LoadingPlaceholder } from "@/components/LoadingPlaceholder";

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
    <Suspense fallback={<LoadingPlaceholder message="Carregando regional..." lines={4} />}>
      <MainPage />
    </Suspense>
  );
}

function MainPage() {
  const searchParams = useSearchParams();
  const regionalId = searchParams.get('regionalId') || searchParams.get('regionalid') || searchParams.get('regionalID');
  const debugResumo = searchParams.get("debugResumo") === "1";

  const { user } = useUser();

  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const [centros, setCentros] = useState<Centro[]>([]);
  const [coordenadores, setCoordenadores] = useState<Pessoa[]>([]);
  const [selectedCoordenador, setSelectedCoordenador] = useState<string | undefined>("");
  const [regionalInfo, setRegionalInfo] = useState<any>({});
  const [periodLabel, setPeriodLabel] = useState<string | null>(null);

  const [totalRespostas, setTotalRespostas] = useState(0);
  const [totalCentros, setTotalCentros] = useState(0);
  const [summaryByCentroId, setSummaryByCentroId] = useState<Record<string, Summary[]>>({});
  const [answersByCentroId, setAnswersByCentroId] = useState<{ [key: string]: Answer[] }>({});
  const [exportingCsv, setExportingCsv] = useState(false);

  const hasLoadedRef = useRef(false); // Use useRef instead of useState
  const [avaliacaoQuestion, setAvaliacaoQuestion] = useState<Question>({
    _id: "",
    QUESTION: "",
    ANSWER_TYPE: "String",
    IS_REQUIRED: false,
    PRESET_VALUES: []
  })
  const [questoes_coordenador, setCoordenadorQuestoes] = useState<Question[]>([{
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
  const canExport = !loading && centros.length > 0 && !exportingCsv;

  useEffect(() => {
    async function fetchData() {

      if (hasLoadedRef.current || !regionalId) {
        return;
      }

      hasLoadedRef.current = true; // Set ref value to true to prevent further calls

      const cadastroInfo = await getCadastroInfo();

      // Converter datas do formato brasileiro para ISO
      const convertDateToISOFormat = (date: string): string => {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
          const [d, m, y] = date.split("/");
          return `${y}-${m}-${d}`;
        }
        return date;
      };

      const formatDateLabel = (date: string | undefined) => {
        if (!date) return null;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date;
        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime())
          ? null
          : parsed.toLocaleDateString("pt-BR", { timeZone: "UTC" });
      };

      const dateFromISO = cadastroInfo?.start ? convertDateToISOFormat(cadastroInfo.start) : undefined;
      const dateToISO = cadastroInfo?.end ? convertDateToISOFormat(cadastroInfo.end) : undefined;
      const startLabel = formatDateLabel(cadastroInfo?.start || dateFromISO);
      const endLabel = formatDateLabel(cadastroInfo?.end || dateToISO);
      setPeriodLabel(
        startLabel || endLabel
          ? `${startLabel || "Início não definido"} até ${endLabel || "sem término"}`
          : null
      );

      const params = new URLSearchParams();
      if (dateFromISO) params.append("dateFrom", dateFromISO);
      if (dateToISO) params.append("dateTo", dateToISO);
      params.append("include", "answers,summaries");
      params.append("sortBy", "updatedAt:desc");

      try {
        const centrosWithAnswersUrl = params.toString()
          ? apiUrl(`/regionais/${regionalId}/centros-with-answers?${params.toString()}`)
          : apiUrl(`/regionais/${regionalId}/centros-with-answers`);


        console.log("CadastroInfo", cadastroInfo, `/forms?_id=${cadastroInfo.formId}`);

        const [regionalData, formData, pessoasData, centrosWithAnswers] = await Promise.all([
          fetch(apiUrl(`/regionais/${regionalId}`)).then(safeJson),
          fetch(apiUrl(`/forms/${cadastroInfo.formId}`)).then(safeJson),
          fetch(apiUrl(`/pessoas`)).then(safeJson),
          fetch(centrosWithAnswersUrl).then(safeJson),
        ]);

        console.log("Fetched form data:", formData);

        const form = Array.isArray(formData) ? formData[0] : formData;
        setFormulario(form);

        // Extrair questões; se faltar, tenta fallback no formulário original
        let { autoavaliacaoQuestion, questoes } = extractCoordinatorFormData(form);

        setCoordenadores(Array.isArray(pessoasData) ? pessoasData : []);

        if (autoavaliacaoQuestion) {
          setAvaliacaoQuestion(autoavaliacaoQuestion);
        }
        setCoordenadorQuestoes(questoes && questoes.length ? questoes : []);

        const coordenadorPessoa = Array.isArray(pessoasData)
          ? pessoasData.find((p: Pessoa) => p._id === regionalData?.COORDENADOR_ID)
          : undefined;
        setSelectedCoordenador(coordenadorPessoa?.NOME ?? "");
        const centros = centrosWithAnswers?.centros || [];
        setCentros(centros);
        setRegionalInfo(regionalData || {});

        // Processar answers/summaries da rota agregada (centros-with-answers)
        const answersBycentro: Record<string, Answer[]> = {};
        const summariesBycentro: Record<string, Summary[]> = {};
        for (const centro of centros) {
          const cid = centro._id;
          answersBycentro[cid] = Array.isArray((centro as any).answers) ? (centro as any).answers : [];
          summariesBycentro[cid] = normalizeSummaries((centro as any).summaries);
        }

        if (debugResumo) {
          const summariesCountByCentro = Object.fromEntries(
            centros.map((centro: Centro) => [centro._id, (summariesBycentro[centro._id] || []).length])
          );

          console.groupCollapsed("[Resumo/Coordenador] debugResumo=1");
          console.log("formId atual:", cadastroInfo?.formId);
          console.log("Contagem summaries da rota centros-with-answers por centro:", summariesCountByCentro);
          console.groupEnd();
        }

        setSummaryByCentroId(summariesBycentro);
        setAnswersByCentroId(answersBycentro);

        const centrosComSummaries = Object.values(summariesBycentro).filter((arr) => arr.length > 0).length;
        setTotalRespostas(centrosComSummaries);
        setTotalCentros(centros.length || 0);

        setLoading(false); // Finaliza o estado de carregamento

      } catch (error) {
        console.error("Erro ao buscar dados da regional:", error);
        setLoading(false);
      }

    }

    fetchData();
  }, [regionalId, debugResumo])


  function handleCentroCreated(newCentro: Centro) {
    setCentros([...centros, newCentro]);
    setTotalCentros(prev => prev + 1);
  }

  async function UpdateCoordinator(nameCoordinator: string) {
    try {
      if (!regionalId) {
        throw new Error("Regional não informada");
      }

      let coordenador: Pessoa | undefined = coordenadores.find((coordenador: Pessoa) => coordenador.NOME === nameCoordinator);
      const coordenadorId = coordenador?._id;

      const response = await fetch(apiUrl(`/regionais/${regionalId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ COORDENADOR_ID: coordenadorId }),
      });
      const data = await response.json();
      console.log("data", data)

      setSelectedCoordenador(coordenador?.NOME);

    } catch (error) {
      console.log("Erro ao atualizar coordenador", error)
      throw new Error("Erro ao atualizar coordenador")
    }
  }

  const exportCadastroCsv = async () => {
    if (!centros.length || exportingCsv) {
      return;
    }

    try {
      setExportingCsv(true);

      const csvContent = await buildCadastroCsvContentForCentros({
        centros,
      });

      downloadCsvFile("cadastro_regional.csv", csvContent);
    } catch (error: unknown) {
      console.error("[Resumo/Coordenador] Falha ao exportar CSV", error);
      const message = error instanceof Error ? error.message : "Não foi possível exportar os dados exibidos.";
      alert(message);
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-4">
      {!regionalId ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
          Selecione uma regional para visualizar os dados.
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-44 bg-gray-200 rounded" />
            <div className="h-10 w-56 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">Regional</p>
                <h2 className="text-xl font-semibold text-gray-900">{regionalInfo?.NOME_REGIONAL || "—"}</h2>
                {periodLabel && <p className="text-sm text-gray-600 mt-1">Período: {periodLabel}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={exportCadastroCsv}
                  disabled={!canExport}
                  className={`px-4 py-2 rounded text-white transition ${canExport ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                >
                  {exportingCsv ? "Exportando CSV..." : "Exportar dados exibidos (CSV)"}
                </button>
                {user?.role === "admin" && (
                  <CentroDialog regional={regionalInfo} onCentroCreated={handleCentroCreated} />
                )}
              </div>
            </div>
          </div>

          <ValidacaoCoordenacao
            coordenador={
              user?.role === "admin" ? (
                <Select
                  value={selectedCoordenador}
                  onValueChange={(newValue) => {
                    UpdateCoordinator(newValue);
                  }}
                  disabled={false}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um coordenador" />
                  </SelectTrigger>
                  <SelectContent>
                    {coordenadores.map((coordenador) => (
                      <SelectItem key={coordenador._id} value={coordenador.NOME}>
                        {coordenador.NOME}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                selectedCoordenador
              )
            }
            totalRespostas={totalRespostas}
            totalCentros={totalCentros}
            regionalId={regionalId}
            regionalName={regionalInfo?.NOME_REGIONAL}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centros.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
                Nenhum centro encontrado para esta regional.
              </div>
            ) : (
              centros.map((centro: Centro) => (
                <House_Card
                  key={centro._id}
                  centro={centro}
                  avaliacao_question={avaliacaoQuestion}
                  coordenador_questions={questoes_coordenador}
                  form={formulario}
                  summaries={summaryByCentroId[centro._id] || []}
                  answers={answersByCentroId[centro._id]}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
