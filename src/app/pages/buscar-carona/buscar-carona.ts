import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auth } from '../../services/auth';
import { CaronaService } from '../../services/carona';
import { ResultadoCarona, Sentido } from '../../models/carona';
import { BAIRROS } from '../../utils/locais';

@Component({
  selector: 'app-buscar-carona',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './buscar-carona.html',
  styleUrl: './buscar-carona.scss',
})
export class BuscarCarona {
  private fb = inject(FormBuilder);
  private carona = inject(CaronaService);
  private auth = inject(Auth);
  private snack = inject(MatSnackBar);

  bairros = BAIRROS;
  dias = [
    { valor: 0, nome: 'Domingo' }, { valor: 1, nome: 'Segunda' }, { valor: 2, nome: 'Terça' },
    { valor: 3, nome: 'Quarta' }, { valor: 4, nome: 'Quinta' }, { valor: 5, nome: 'Sexta' },
    { valor: 6, nome: 'Sábado' },
  ];

  resultados = signal<ResultadoCarona[] | null>(null);
  solicitadas = signal<Set<number>>(new Set());
  carregando = signal(false);
  erro = signal('');

  form = this.fb.nonNullable.group({
    sentido: ['IDA' as Sentido, Validators.required],
    bairro: ['', Validators.required],
    dia: [new Date().getDay(), Validators.required],
    horario: ['18:30', Validators.required],
  });

  async buscar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const bairro = this.bairros.find(b => b.descricao === v.bairro)!;

    this.carregando.set(true);
    this.erro.set('');
    try {
      const lista = await this.carona.buscar({
        origem: bairro,
        sentido: v.sentido,
        diaSemana: v.dia,
        horario: v.horario,
      });
      const meuId = this.auth.usuario()?.id;
      this.resultados.set(lista.filter(r => r.oferta.motoristaId !== meuId));
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro ao buscar caronas.');
    } finally {
      this.carregando.set(false);
    }
  }

  async solicitar(r: ResultadoCarona) {
    try {
      await this.carona.solicitar(r.oferta.id);
      this.solicitadas.update(s => new Set(s).add(r.oferta.id));
      this.snack.open('Vaga solicitada! Acompanhe em "Minhas caronas".', 'OK', { duration: 4000 });
    } catch (e) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao solicitar.', 'OK', { duration: 4000 });
    }
  }
}