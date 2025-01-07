"use client";

import { useEffect, useState } from 'react';
import Regional_Card from '@/components/Regional_Card';
import { appendDatePeriod, Period } from '@/helpers/datePeriodHelper';
import { Regional } from '@/interfaces/centro.interface';

interface SummaryProps {
  params: {
    start: string;
    end: string;
  };
}

export default function Summary_Alianca({ params }: SummaryProps) {
  const { start, end } = params;
  const period: Period = { start, end };

  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegionais() {
      try {
        let apiPath = `/api/regionais`;

        // Aplica os parâmetros de período à URL
        apiPath = appendDatePeriod(apiPath, period);

        const regionaisData: Regional[] = await fetch(apiPath).then((res) => res.json());

        // Ordena os regionais
        const sortedRegionais = regionaisData.sort((a, b) =>
          a.NOME_REGIONAL.localeCompare(b.NOME_REGIONAL)
        );

        setRegionais(sortedRegionais);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchRegionais();
  }, []);

  if (error) {
    return <div>Erro ao carregar regionais: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {regionais.map((regional) => (
        <Regional_Card
          key={regional._id}
          nome={regional.NOME_REGIONAL}
          pais={regional.PAIS}
          regionalId={regional._id}
        />
      ))}
    </div>
  );
}
