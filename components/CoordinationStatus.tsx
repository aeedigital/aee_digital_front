// components/CoordinationStatus.js

type CoordinatorStatusType = {
  summaries: any;
  centros: any;
}
export default function CoordinationStatus(data: CoordinatorStatusType) {
  const { summaries, centros } = data
  const totalRespostas = summaries.length;
  const totalCentros = centros.length;

  return (
    <div className="validacao-coord-dados">
      <div className="form row">
        {/* Coordination Status Content */}
        <p>Total Respostas: {totalRespostas !== null ? totalRespostas : 'Carregando ...'}</p>
        <p>Total Centros: {totalCentros}</p>
      </div>
    </div>
  );
}



