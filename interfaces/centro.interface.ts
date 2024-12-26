export interface Centro {
  _id: string;
  NOME_CENTRO: string;
  NOME_CURTO: string;
  auto_avaliacao: string;
  data_avaliacao: string;
}


export interface Regional {
  _id: string;
  NOME_REGIONAL: string;
  PAIS: string;
  COORDENADOR_ID: string;
}
