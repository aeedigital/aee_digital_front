'use client';

import {useEffect, useState} from 'react';

import  Summary_Card  from '@/components/Summary_Card';

export default function Historico({params}:any) {
    
    const {centroId} = params;

    const[summaries, setSummaries] = useState([]);

    useEffect(()=>{
        async function fetchData(){
            const res = await fetch(`/api/centros/${centroId}/summaries?sortBy=updatedAt:desc`);
            const data = await res.json();
            setSummaries(data);
        }
        fetchData();
    },[])


    return (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {summaries.map((summary:any) => (
                <Summary_Card 
                    key={summary._id}
                    createdAt={summary.createdAt}
                    updatedAt={summary.updatedAt}
                    formId={summary.FORM_ID}
                    answers={summary.QUESTIONS}
                />
            ))}
        </div>

    )


}