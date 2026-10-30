import { Injectable } from '@angular/core';
import { supabase } from '../supabase';
import { BuscaCarona, OfertaCarona, ResultadoCarona } from '../models/carona';
import { distanciaKm, minutosDoDia } from '../utils/distancia';

const RAIO_MAX_KM = 2;
const JANELA_MAX_MIN = 20;

export interface SolicitacaoView {
  id: number;
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA';
  ofertaId: number;
  pessoa: string;
  trajeto: string;
  horario: string;
  sentido: string;
  vagas: number;
}

export type NovaOferta = Omit<OfertaCarona, 'id' | 'motoristaId' | 'motoristaNome'>;

@Injectable({ providedIn: 'root' })
export class CaronaService {
  private paraOferta(r: any): OfertaCarona {
    return {
      id: r.id,
      motoristaId: r.motorista_id,
      motoristaNome: r.profiles?.nome ?? 'Motorista',
      origem: { lat: r.origem_lat, lng: r.origem_lng, descricao: r.origem_desc },
      destino: { lat: r.destino_lat, lng: r.destino_lng, descricao: r.destino_desc },
      sentido: r.sentido,
      diasSemana: r.dias_semana,
      horario: String(r.horario).slice(0, 5),
      vagas: r.vagas,
    };
  }

  async oferecer(n: NovaOferta): Promise<void> {
    const { error } = await supabase.from('ofertas').insert({
      origem_lat: n.origem.lat,
      origem_lng: n.origem.lng,
      origem_desc: n.origem.descricao,
      destino_lat: n.destino.lat,
      destino_lng: n.destino.lng,
      destino_desc: n.destino.descricao,
      sentido: n.sentido,
      dias_semana: n.diasSemana,
      horario: n.horario,
      vagas: n.vagas,
    });
    if (error) throw new Error(error.message);
  }

  async buscar(busca: BuscaCarona): Promise<ResultadoCarona[]> {
    const { data, error } = await supabase
      .from('ofertas')
      .select('*, profiles(nome)')
      .eq('sentido', busca.sentido)
      .gt('vagas', 0)
      .contains('dias_semana', [busca.diaSemana]);
    if (error) throw new Error(error.message);

    const alvo = minutosDoDia(busca.horario);

    return (data ?? [])
      .map(r => this.paraOferta(r))
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

  async solicitar(ofertaId: number): Promise<void> {
    const { error } = await supabase.from('solicitacoes').insert({ oferta_id: ofertaId });
    if (error) {
      if (error.code === '23505') throw new Error('Você já solicitou vaga nesta carona.');
      throw new Error(error.message);
    }
  }
    private async uid(): Promise<string> {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error('Sessão expirada. Entre novamente.');
    return data.user.id;
  }

  private paraSolicitacao(r: any, pessoa: string): SolicitacaoView {
    return {
      id: r.id,
      status: r.status,
      ofertaId: r.oferta_id,
      pessoa,
      trajeto: `${r.oferta.origem_desc} → ${r.oferta.destino_desc}`,
      horario: String(r.oferta.horario).slice(0, 5),
      sentido: r.oferta.sentido,
      vagas: r.oferta.vagas,
    };
  }

  async minhasOfertas(): Promise<OfertaCarona[]> {
    const uid = await this.uid();
    const { data, error } = await supabase
      .from('ofertas')
      .select('*, profiles(nome)')
      .eq('motorista_id', uid)
      .order('criado_em', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(r => this.paraOferta(r));
  }

  async solicitacoesRecebidas(): Promise<SolicitacaoView[]> {
    const uid = await this.uid();
    const { data, error } = await supabase
      .from('solicitacoes')
      .select('id, status, oferta_id, passageiro:profiles(nome), oferta:ofertas(origem_desc, destino_desc, horario, sentido, vagas)')
      .neq('passageiro_id', uid)
      .order('criado_em', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => this.paraSolicitacao(r, r.passageiro?.nome ?? 'Passageiro'));
  }

  async solicitacoesEnviadas(): Promise<SolicitacaoView[]> {
    const uid = await this.uid();
    const { data, error } = await supabase
      .from('solicitacoes')
      .select('id, status, oferta_id, oferta:ofertas(origem_desc, destino_desc, horario, sentido, vagas, profiles(nome))')
      .eq('passageiro_id', uid)
      .order('criado_em', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => this.paraSolicitacao(r, r.oferta?.profiles?.nome ?? 'Motorista'));
  }

  async responder(s: SolicitacaoView, aceitar: boolean): Promise<void> {
    if (aceitar && s.vagas <= 0) throw new Error('Esta carona não tem mais vagas.');

    const { error } = await supabase
      .from('solicitacoes')
      .update({ status: aceitar ? 'ACEITA' : 'RECUSADA' })
      .eq('id', s.id);
    if (error) throw new Error(error.message);

    if (aceitar) {
      const { error: e2 } = await supabase
        .from('ofertas')
        .update({ vagas: s.vagas - 1 })
        .eq('id', s.ofertaId);
      if (e2) throw new Error(e2.message);
    }
  }
}