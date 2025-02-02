"use client";

import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
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
import { Centro } from "@/interfaces/centro.interface";

import { Skeleton } from "@/components/ui/skeleton";


// Registra os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, BarElement, ChartDataLabels);

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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
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
      anchor: "end",
      align: "top",
      formatter: (value: number) => `${value.toFixed(1)}%`,
      color: "black",
      font: {
        weight: "bold",
      },
    },
  },
  scales: {
    y: { beginAtZero: true, max: 100, ticks: { callback: (value: number) => `${value}%` } },
  },
};

const SummariesGraphComponent: React.FC<SummariesGraphProps> = ({ startDate, endDate }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [chartDataBar, setChartDataBar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os dados da API
  const fetchData = async () => {
    try {
      const summariesPath = `/api/summaries?fields=FORM_ID,CENTRO_ID,createdAt,updatedAt&dateFrom=${startDate}&dateTo=${endDate}`;
      const centrosPath = `/api/centros`;

      const [summaries, centros]: [Summary[], Centro[]] = await Promise.all([
        fetch(summariesPath).then(res => res.json()),
        fetch(centrosPath).then(res => res.json())
      ]);

      const allDates = generateDateRange(startDate, endDate);
      const summariesGroupedData = groupEventsByDay(summaries);

      const totalUniqueSummariesByCentro = summaries.reduce((acc: Record<string, number>, summary: Summary) => {
        acc[summary.CENTRO_ID] = (acc[summary.CENTRO_ID] || 0) + 1;
        return acc;
      }, {});

      const filledData = allDates.map((date) => summariesGroupedData[date] || 0);

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

      const pendente = 100 - (Object.keys(totalUniqueSummariesByCentro).length / centros.length * 100);

      setChartDataBar({
        labels: ["Faltando", "Respondido"],
        datasets: [
          {
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
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

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
