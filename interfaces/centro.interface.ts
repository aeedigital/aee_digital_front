export interface Funcionamento {
  segunda: string[];
  terca: string[];
  quarta: string[];
  quinta: string[];
  sexta: string[];
  sabado: string[];
  domingo: string[];
}

export interface Centro {
  _id: string;
  NOME_CENTRO: string;
  NOME_CURTO: string;
  FUNCIONAMENTO?: Funcionamento;
  CNPJ_CENTRO?: string;
  DATA_FUNDACAO?: string;
  REGIONAL?: string;
  ENDERECO?: string;
  CEP?: string;
  BAIRRO?: string;
  CIDADE?: string;
  ESTADO?: string;
  PAIS?: string;
  STATUS?: string;
  auto_avaliacao?: string;
  data_avaliacao?: string;
}


export interface Regional {
  _id: string;
  NOME_REGIONAL: string;
  PAIS: string;
  COORDENADOR_ID: string;
}
