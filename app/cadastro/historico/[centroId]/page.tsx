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

            const filteredDataOrderedByCreatedDate = data.sort((a:any, b:any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            console.log("SUMMARIEAS", filteredDataOrderedByCreatedDate);

            setSummaries(filteredDataOrderedByCreatedDate);
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
                    _id={summary._id}
                    centroId={summary.CENTRO_ID}
                />
            ))}
        </div>
    )


}