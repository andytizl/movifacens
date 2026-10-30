export interface Ponto {
  lat: number;
  lng: number;
  descricao: string;
}

// IDA = casa para Facens | VOLTA = Facens para casa
export type Sentido = 'IDA' | 'VOLTA';

export interface OfertaCarona {
  id: number;
  motoristaId: string;
  motoristaNome: string;
  origem: Ponto;
  destino: Ponto;
  sentido: Sentido;
  diasSemana: number[]; // 0 = domingo ... 6 = sábado
  horario: string;      // 'HH:mm'
  vagas: number;
}

export interface BuscaCarona {
  origem: Ponto;
  sentido: Sentido;
  diaSemana: number;
  horario: string;
}

export interface ResultadoCarona {
  oferta: OfertaCarona;
  distanciaKm: number;
  diferencaMin: number;
}