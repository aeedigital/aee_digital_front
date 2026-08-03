'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import  Summary_Card  from '@/components/Summary_Card';
import { apiUrl } from '@/lib/api';

export default function HistoricoWrapper() {
    return (
        <Suspense fallback={<div>Carregando histórico...</div>}>
            <Historico />
        </Suspense>
    );
}

function Historico() {
    
    const searchParams = useSearchParams();
    const centroId = searchParams.get("centroId");

    const[summaries, setSummaries] = useState([]);

    useEffect(()=>{
        async function fetchData(){
            if (!centroId) {
                return;
            }
            const res = await fetch(apiUrl(`/centros/${centroId}/summaries?sortBy=updatedAt:desc`));
            const data = await res.json();

            const filteredDataOrderedByCreatedDate = data.sort((a:any, b:any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setSummaries(filteredDataOrderedByCreatedDate);
        }
        fetchData();
    },[centroId])


    return (
        !centroId ? <div>Centro não informado.</div> :
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {summaries.map((summary:any) => (
                <Summary_Card 
                    key={summary._id}
                    createdAt={summary.createdAt}
                    updatedAt={summary.updatedAt}
                    formId={summary.FORM_ID}
                    answers={summary.QUESTIONS}
                    _id={summary._id}
                    centroId={summary.CENTRO_ID}
                />
            ))}
        </div>
    )


}
