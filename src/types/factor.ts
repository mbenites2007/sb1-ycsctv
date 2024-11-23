export interface Factor {
  id: string;
  cod_fator: number;
  descricao_fator: string;
  subitems: FactorSubItem[];
}

export interface FactorSubItem {
  id: string;
  cod_subitem: number;
  descricao_subitem: string;
  valor: number;
  fator_id: string;
}