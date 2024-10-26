// components/HouseRow.js

type HouseRowType = {
  centro: any;
  summaries: any;
  avaliacaoResponses: any
}

export default function HouseRow({ centro, summaries, avaliacaoResponses }: HouseRowType) {
  const summary = summaries.find((s:any) => s.CENTRO_ID === centro._id);
  const response = avaliacaoResponses[centro._id] || {};

  return (
    <div className="form row" style={{ backgroundColor: summary ? 'rgb(159, 234, 191)' : 'rgb(255, 160, 160)' }}>
      <span className="border col-md-2">
        <div className="form-group">
          <p>
            <a href={`/cadastro_alianca?ID=${centro._id}&page=0`}>{centro.NOME_CENTRO}</a>
          </p>
        </div>
      </span>
      <span className="border col-md-2">
        <div className="form-group">
          <p>{centro.NOME_CURTO}</p>
        </div>
      </span>
      {/* Add other columns similarly */}
    </div>
  );
}
