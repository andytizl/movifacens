import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CaronaService } from '../../services/carona';
import { Sentido } from '../../models/carona';
import { BAIRROS, FACENS } from '../../utils/locais';

@Component({
  selector: 'app-oferecer-carona',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './oferecer-carona.html',
  styleUrl: './oferecer-carona.scss',
})
export class OferecerCarona {
  private fb = inject(FormBuilder);
  private carona = inject(CaronaService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  bairros = BAIRROS;
  dias = [
    { valor: 1, nome: 'Segunda' }, { valor: 2, nome: 'Terça' }, { valor: 3, nome: 'Quarta' },
    { valor: 4, nome: 'Quinta' }, { valor: 5, nome: 'Sexta' }, { valor: 6, nome: 'Sábado' },
  ];

  carregando = signal(false);
  erro = signal('');

  form = this.fb.nonNullable.group({
    sentido: ['IDA' as Sentido, Validators.required],
    bairro: ['', Validators.required],
    dias: [[1, 2, 3, 4, 5] as number[], Validators.required],
    horario: ['18:30', Validators.required],
    vagas: [3, [Validators.required, Validators.min(1), Validators.max(6)]],
  });

  async enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const bairro = this.bairros.find(b => b.descricao === v.bairro)!;

    this.carregando.set(true);
    this.erro.set('');
    try {
      await this.carona.oferecer({
        origem: v.sentido === 'IDA' ? bairro : FACENS,
        destino: v.sentido === 'IDA' ? FACENS : bairro,
        sentido: v.sentido,
        diasSemana: v.dias,
        horario: v.horario,
        vagas: v.vagas,
      });
      this.snack.open('Carona publicada!', 'OK', { duration: 3000 });
      this.router.navigate(['/home']);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro ao publicar a carona.');
    } finally {
      this.carregando.set(false);
    }
  }
}