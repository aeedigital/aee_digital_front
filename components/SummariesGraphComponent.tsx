"use client";

import { useCallback, useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { apiUrl } from "@/lib/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import { Summary } from "@/interfaces/form.interface";


// Registra os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, BarElement, ChartDataLabels);

const EXCLUDED_REGIONAL_IDS = ["670db855de561168547206da"];

interface SummariesGraphProps {
  startDate: string; // Data no formato brasileiro "dd/mm/yyyy"
  endDate: string;   // Data no formato brasileiro "dd/mm/yyyy"
}

// Função para converter datas do formato brasileiro (dd/mm/yyyy) para ISO (yyyy-mm-dd)
function convertDateToISO(date: string): string {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day).toISOString().split("T")[0];
}

// Função para gerar intervalo de datas
function generateDateRange(start: string, end: string): string[] {
  const startDate = new Date(convertDateToISO(start));
  const endDate = new Date(convertDateToISO(end));
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]); // Formato "yyyy-mm-dd"
    currentDate.setDate(currentDate.getDate() + 1); // Incrementa um dia
  }
  return dates;
}

// Função para agrupar eventos por dia
function groupEventsByDay(data: Summary[]): Record<string, number> {
  return data.reduce((counts: Record<string, number>, event: Summary) => {
    const date = new Date(event.createdAt).toISOString().split("T")[0];
    counts[date] = (counts[date] || 0) + 1;
    return counts;
  }, {});
}

function filterSummariesByPeriod(
  summaries: Summary[],
  dateFromISO: string,
  dateToISO: string
): Summary[] {
  return summaries.filter((summary) => {
    const eventDate = new Date(summary.createdAt);
    if (Number.isNaN(eventDate.getTime())) return false;
    const dateKey = eventDate.toISOString().split("T")[0];
    return dateKey >= dateFromISO && dateKey <= dateToISO;
  });
}

type ExcludedRegionalStats = {
  excludedEventsByDay: Record<string, number>;
  excludedTotalCentros: number;
  excludedRespondedCount: number;
};

async function fetchExcludedRegionalStats(
  dateFromISO: string,
  dateToISO: string
): Promise<ExcludedRegionalStats> {
  const excludedEventsByDay: Record<string, number> = {};
  const respondedCentros = new Set<string>();
  let excludedTotalCentros = 0;

  await Promise.all(
    EXCLUDED_REGIONAL_IDS.map(async (regionalId) => {
      const centrosParams = new URLSearchParams();
      centrosParams.append("REGIONAL", regionalId);
      centrosParams.append("STATUS", "Pendente,Integrada,Inscrita");

      const [summariesResponse, centrosResponse] = await Promise.all([
        fetch(apiUrl(`/regionais/${regionalId}/summaries`)),
        fetch(apiUrl(`/centros?${centrosParams.toString()}`)),
      ]);

      if (!summariesResponse.ok || !centrosResponse.ok) {
        throw new Error(`Falha ao buscar dados da regional ${regionalId}`);
      }

      const summariesData = await summariesResponse.json();
      const centrosData = await centrosResponse.json();

      const summaries = Array.isArray(summariesData)
        ? summariesData
        : Array.isArray(summariesData?.summaries)
          ? summariesData.summaries
          : [];
      const centros = Array.isArray(centrosData)
        ? centrosData
        : Array.isArray(centrosData?.centros)
          ? centrosData.centros
          : [];

      excludedTotalCentros += centros.length;

      const filteredSummaries = filterSummariesByPeriod(
        summaries as Summary[],
        dateFromISO,
        dateToISO
      );

      filteredSummaries.forEach((summary) => {
        if (summary.CENTRO_ID) {
          respondedCentros.add(summary.CENTRO_ID);
        }
      });

      const groupedByDay = groupEventsByDay(filteredSummaries);
      Object.entries(groupedByDay).forEach(([date, value]) => {
        excludedEventsByDay[date] = (excludedEventsByDay[date] || 0) + value;
      });
    })
  );

  return {
    excludedEventsByDay,
    excludedTotalCentros,
    excludedRespondedCount: respondedCentros.size,
  };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "Eventos por Dia" },
  },
  scales: {
    x: { title: { display: true, text: "Dias" }, ticks: { maxTicksLimit: 10, autoSkip: true } },
    y: { title: { display: true, text: "Quantidade de Eventos" }, beginAtZero: true },
  },
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: true },
    title: { display: true, text: "Porcentagem de Respostas Pendentes" },
    datalabels: {
      anchor: "end" as const,
      align: "end" as const,
      formatter: (value: number) => `${value.toFixed(1)}%`,
      color: "black",
      font: {
        weight: "bold" as const,
      },
    },
  },
  scales: {
    y: { beginAtZero: true, max: 100, ticks: { callback: function (value: number | string) { return `${value}%`; } } },
  },
};

const SummariesGraphComponent: React.FC<SummariesGraphProps> = ({ startDate, endDate }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [chartDataBar, setChartDataBar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os dados da API
  const fetchData = useCallback(async () => {
    try {
      console.log("Buscando dados para o gráfico com datas:", { startDate, endDate });

      // Converter datas do formato brasileiro para ISO
      const convertDateToISOFormat = (date: string): string => {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
          const [d, m, y] = date.split("/");
          return `${y}-${m}-${d}`;
        }
        return date;
      };

      const dateFromISO = convertDateToISOFormat(startDate);
      const dateToISO = convertDateToISOFormat(endDate);

      // Usar nova rota /summaries/stats com dados agregados
      const params = new URLSearchParams();
      params.append("dateFrom", dateFromISO);
      params.append("dateTo", dateToISO);
      // Enviar status como array (múltiplos parâmetros)
      ["Pendente", "Integrada", "Inscrita"].forEach(status => {
        params.append("status", status);
      });

      const statsResponse = await fetch(apiUrl(`/summaries/stats?${params.toString()}`));
      if (!statsResponse.ok) {
        throw new Error(`Erro ao buscar estatísticas (${statsResponse.status})`);
      }
      const stats = await statsResponse.json();

      console.log("Dados de stats recebidos:", stats);

      const globalEventsByDay: Record<string, number> = stats.eventsByDay || {};
      let adjustedEventsByDay: Record<string, number> = { ...globalEventsByDay };
      let adjustedRespondedCount = Number(stats.respondedCount || 0);
      let adjustedTotalCentros = Number(stats.totalCentros || 0);

      try {
        const {
          excludedEventsByDay,
          excludedTotalCentros,
          excludedRespondedCount
        } = await fetchExcludedRegionalStats(dateFromISO, dateToISO);

        const allDates = new Set([
          ...Object.keys(globalEventsByDay),
          ...Object.keys(excludedEventsByDay),
        ]);

        adjustedEventsByDay = {};
        allDates.forEach((date) => {
          const globalValue = globalEventsByDay[date] || 0;
          const excludedValue = excludedEventsByDay[date] || 0;
          adjustedEventsByDay[date] = Math.max(0, globalValue - excludedValue);
        });

        adjustedTotalCentros = Math.max(0, adjustedTotalCentros - excludedTotalCentros);
        adjustedRespondedCount = Math.max(0, adjustedRespondedCount - excludedRespondedCount);
        adjustedRespondedCount = Math.min(adjustedRespondedCount, adjustedTotalCentros);
      } catch (excludedError) {
        console.warn(
          "[SummariesGraphComponent] Falha ao excluir regionais configuradas; usando dados globais.",
          excludedError
        );
      }

      // Gerar intervalo de datas para preencher os gaps
      const allDates = generateDateRange(startDate, endDate);
      const filledData = allDates.map((date) => adjustedEventsByDay[date] || 0);

      setChartData({
        labels: allDates,
        datasets: [
          {
            label: "Eventos por Dia",
            data: filledData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.2,
            pointRadius: 2,
            fill: false,
          },
        ],
      });

      const pendenteRaw =
        adjustedTotalCentros > 0
          ? 100 - (adjustedRespondedCount / adjustedTotalCentros) * 100
          : 0;
      const pendente = Math.min(100, Math.max(0, pendenteRaw));

      setChartDataBar({
        labels: ["Faltando", "Respondido"],
        datasets: [
          {
            label: "Centros",
            data: [pendente, 100 - pendente],
            backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(75, 192, 192, 0.5)"],
            borderColor: ["rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"],
            borderWidth: 1,
          },
        ],
      });

    } catch (err) {
      console.error("Erro ao criar gráfico:", err);
      setError("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>;

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-bold mb-4">Gráficos</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2" style={{ height: "350px" }}>
          {chartData ? <Line data={chartData} options={chartOptions} /> : <p>Nenhum dado disponível.</p>}
        </div>
        <div className="w-full md:w-1/2" style={{ height: "350px" }}>
          {chartDataBar ? <Bar data={chartDataBar} options={barOptions} /> : <p>Nenhum dado disponível.</p>}
        </div>
      </div>
    </div>
  );
};

export default SummariesGraphComponent;
