// pages/index.js
"use client";

import { useEffect, useRef, useState } from 'react';

import House_Card from '@/components/House_Card';
import { Question} from '@/interfaces/form.interface'


export default function MainPage({params}:any) {
  const { regionalId } = params;

  const [centros, setCentros] = useState([]);
  const [coordenador, setCoordenador] = useState("");
  const [avaliacaoResponses, setAvaliacaoResponses] = useState({});
  const [totalRespostas, setTotalRespostas] = useState(0);
  const [totalCentros, setTotalCentros] = useState(0);
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


  function HandleInput(a:any){
  }

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


      // Fetch centros, summaries, and avaliacao responses
      // Replace the fetch URLs with your backend endpoints

      let [regionalData, centrosData, summariesData, formData] = await Promise.all([
        fetch(`/api/regionais/${regionalId}`).then((res) => res.json()),
        fetch(`/api/centros?REGIONAL=${regionalId}`).then((res) => res.json()),
        fetch(`/api/regionais/${regionalId}/summaries`).then((res) => res.json()),
        fetch(`/api/forms?NAME=Cadastro de Informações Anual&sortBy=VERSION:desc`).then((res) => res.json())
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

      setTotalRespostas(summariesData.length);
      setTotalCentros(centrosData.length);


    }

    fetchData();
  },[])

  useEffect(() => {
    async function fetchData() {

      if (hasLoadedRef.current) {
        return;
      }

      hasLoadedRef.current = true; // Set ref value to true to prevent further calls


      // Fetch centros, summaries, and avaliacao responses
      // Replace the fetch URLs with your backend endpoints

      let [regionalData, centrosData, summariesData, formData] = await Promise.all([
        fetch(`/api/regionais/${regionalId}`).then((res) => res.json()),
        fetch(`/api/centros?REGIONAL=${regionalId}`).then((res) => res.json()),
        fetch(`/api/regionais/${regionalId}/summaries`).then((res) => res.json()),
        fetch(`/api/forms?NAME=Cadastro de Informações Anual&sortBy=VERSION:desc`).then((res) => res.json())
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

      setTotalRespostas(summariesData.length);
      setTotalCentros(centrosData.length);


    }

    fetchData();
  }, [regionalId]);

  return (
    <div>

    
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>

      <div className="cadastrar-titulo">
        <h2>Validação de Informações - Coordenação Regional</h2>
      </div>
      <div className="validacao-coord-dados">
      <div className="form row">
        {/* Coordination Status Content */}
        <p>Coordenador: {coordenador}</p>
        <p>Total Respostas: {totalRespostas > 0 ? totalRespostas : 'Carregando ...'}</p>
        <p>Total Centros: {totalCentros > 0 ? totalCentros: 'Carregando ...'}</p>
      </div>
    </div>
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap' }}>


    {centros.map((centro: any) => (
      <House_Card key={centro._id} centro={centro} avaliacao_question={avaliacaoQuestion} coordenador_questions={questoes_coordenador} form={formulario}></House_Card>
    ))}
      
    {/* <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Nome da Casa</th>
            <th className={styles.th}>Apelido</th>
            <th className={styles.th}>Auto Avaliação</th>
            <th className={styles.th}>Situação</th>
            <th className={styles.th}>Part. Reuniões (%)</th>
            <th className={styles.th}>Data da Avaliação</th>
            <th className={styles.th}>Perguntas Faltantes</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {centros.map((centro: any) => (
            
            <tr key={centro._id} className={styles.tr}>
              <td className={styles.td}>{centro.NOME_CENTRO} </td>
              <td className={styles.td}>{centro.NOME_CURTO}</td>
              <td className={styles.td}>{centro.auto_avaliacao || 'N/A'}</td>
              <td className={styles.td}><FormInput type={'select'} name={'nome'} value={centro.situacao} onChange={HandleInput} options={situacaoOption}></FormInput></td>
              <td className={styles.td}> <FormInput type={"text"} name={"participação"} value={centro.participacao} onChange={undefined} options={undefined}></FormInput></td>
              <td className={styles.td}>{centro.data_avaliacao || 'Não Finalizado'}</td>
              <td className={styles.td}>
                {centro.perguntas_faltantes && centro.perguntas_faltantes.length > 0 ? (
                  <ul>
                    {centro.perguntas_faltantes.map((question: any, index: any) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                ) : (
                  'Nenhuma'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}



    </div>

    </div>
  );
}
