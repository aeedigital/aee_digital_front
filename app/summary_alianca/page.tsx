import React from 'react';
import Regional_Card from '../../components/Regional_Card';
import { appendDatePeriod, Period } from '../helpers/datePeriodHelper'

async function getRegionais(period: Period) {
  let apiPath = 'http://162.214.123.133:5000/regionais';

  appendDatePeriod(apiPath, period)

  let res = await fetch(apiPath, { cache: 'no-store' });
   
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  const regionaisData = await res.json();

  const sortedRegionais = regionaisData.sort((a: Regional, b: Regional) => 
    a.NOME_REGIONAL.localeCompare(b.NOME_REGIONAL)
  );

   
  return sortedRegionais;
}

interface Regional {
  _id: string;
  NOME_REGIONAL: string;
  PAIS: string;
  COORDENADOR_ID: string;
}


export default async function Summary_Alianca({params}:any) {
  const {start, end} = params
  const period: Period = {
    start,
    end
  }

  const regionais = await getRegionais(period);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {regionais.map((d: Regional) => (
                <Regional_Card key={d._id} nome={d.NOME_REGIONAL} pais={d.PAIS} regionalId={d._id} />
      ))}
    </div>
  );
}
