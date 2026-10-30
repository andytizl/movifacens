import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';
import { emailFacensValidator } from '../../utils/validar-email-facens';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  carregando = signal(false);
  erro = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, emailFacensValidator]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  async entrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    this.erro.set('');
    try {
      const { email, senha } = this.form.getRawValue();
      await this.auth.login(email, senha);
      this.router.navigate(['/home']);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro ao entrar.');
    } finally {
      this.carregando.set(false);
    }
  }
}