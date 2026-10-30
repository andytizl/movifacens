import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../services/auth';
import { CaronaService } from '../../services/carona';

// Estimativa: ~10 km por trajeto x ~0,12 kg de CO2 por km de carro
const KG_CO2_POR_CARONA = 1.2;

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  auth = inject(Auth);
  private carona = inject(CaronaService);

  aceitas = signal(0);
  pendentes = signal(0);
  co2 = computed(() => (this.aceitas() * KG_CO2_POR_CARONA).toFixed(1).replace('.', ','));

  async ngOnInit() {
    try {
      const [recebidas, enviadas] = await Promise.all([
        this.carona.solicitacoesRecebidas(),
        this.carona.solicitacoesEnviadas(),
      ]);
      this.aceitas.set([...recebidas, ...enviadas].filter(s => s.status === 'ACEITA').length);
      this.pendentes.set(recebidas.filter(s => s.status === 'PENDENTE').length);
    } catch {

    }
  }
}