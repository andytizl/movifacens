import { Injectable, signal } from '@angular/core';
import { BuscaCarona, OfertaCarona, ResultadoCarona } from '../models/carona';
import { distanciaKm, minutosDoDia } from '../utils/distancia';

// Coordenadas aproximadas, ajuste depois
const FACENS = { lat: -23.5, lng: -47.46, descricao: 'Facens' };

const RAIO_MAX_KM = 2;
const JANELA_MAX_MIN = 20;

@Injectable({ providedIn: 'root' })
export class CaronaService {
  // MOCK: depois troque por chamadas ao Supabase/API
  private ofertas = signal<OfertaCarona[]>([
    {
      id: 1, motoristaId: 10, motoristaNome: 'Mariana',
      origem: { lat: -23.4900, lng: -47.4500, descricao: 'Centro' },
      destino: FACENS, sentido: 'IDA',
      diasSemana: [1, 2, 3, 4, 5], horario: '18:30', vagas: 3,
    },
    {
      id: 2, motoristaId: 11, motoristaNome: 'Lucas',
      origem: { lat: -23.5100, lng: -47.4300, descricao: 'Vila Hortência' },
      destino: FACENS, sentido: 'IDA',
      diasSemana: [1, 3, 5], horario: '18:40', vagas: 2,
    },
    {
      id: 3, motoristaId: 12, motoristaNome: 'Ana',
      origem: FACENS,
      destino: { lat: -23.4900, lng: -47.4500, descricao: 'Centro' },
      sentido: 'VOLTA',
      diasSemana: [1, 2, 3, 4, 5], horario: '22:30', vagas: 2,
    },
  ]);

  listar(): OfertaCarona[] {
    return this.ofertas();
  }

  oferecer(nova: Omit<OfertaCarona, 'id'>): OfertaCarona {
    const oferta = { ...nova, id: Date.now() };
    this.ofertas.update(lista => [...lista, oferta]);
    return oferta;
  }

  buscar(busca: BuscaCarona): ResultadoCarona[] {
    const alvo = minutosDoDia(busca.horario);

    return this.ofertas()
      .filter(o => o.sentido === busca.sentido && o.vagas > 0 && o.diasSemana.includes(busca.diaSemana))
      .map(o => {
        // Na IDA compara a origem; na VOLTA compara o destino
        const ponto = busca.sentido === 'IDA' ? o.origem : o.destino;
        return {
          oferta: o,
          distanciaKm: distanciaKm(busca.origem.lat, busca.origem.lng, ponto.lat, ponto.lng),
          diferencaMin: Math.abs(minutosDoDia(o.horario) - alvo),
        };
      })
      .filter(r => r.distanciaKm <= RAIO_MAX_KM && r.diferencaMin <= JANELA_MAX_MIN)
      .sort((a, b) => a.distanciaKm - b.distanciaKm || a.diferencaMin - b.diferencaMin);
  }
}