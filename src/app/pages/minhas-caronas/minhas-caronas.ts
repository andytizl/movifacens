import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CaronaService, SolicitacaoView } from '../../services/carona';
import { OfertaCarona } from '../../models/carona';

@Component({
  selector: 'app-minhas-caronas',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './minhas-caronas.html',
  styleUrl: './minhas-caronas.scss',
})
export class MinhasCaronas implements OnInit {
  private carona = inject(CaronaService);
  private snack = inject(MatSnackBar);

  ofertas = signal<OfertaCarona[]>([]);
  recebidas = signal<SolicitacaoView[]>([]);
  enviadas = signal<SolicitacaoView[]>([]);
  carregando = signal(true);

  ngOnInit() {
    this.carregar();
  }

  async carregar() {
    this.carregando.set(true);
    try {
      const [o, r, e] = await Promise.all([
        this.carona.minhasOfertas(),
        this.carona.solicitacoesRecebidas(),
        this.carona.solicitacoesEnviadas(),
      ]);
      this.ofertas.set(o);
      this.recebidas.set(r);
      this.enviadas.set(e);
    } catch (err) {
      this.snack.open(err instanceof Error ? err.message : 'Erro ao carregar.', 'OK', { duration: 4000 });
    } finally {
      this.carregando.set(false);
    }
  }

  async responder(s: SolicitacaoView, aceitar: boolean) {
    try {
      await this.carona.responder(s, aceitar);
      this.snack.open(aceitar ? 'Solicitação aceita!' : 'Solicitação recusada.', 'OK', { duration: 3000 });
      await this.carregar();
    } catch (err) {
      this.snack.open(err instanceof Error ? err.message : 'Erro ao responder.', 'OK', { duration: 4000 });
    }
  }
}