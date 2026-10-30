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

  modo = signal<'login' | 'cadastro'>('login');
  carregando = signal(false);
  erro = signal('');

  form = this.fb.nonNullable.group({
    nome: [''],
    email: ['', [Validators.required, emailFacensValidator]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  alternarModo() {
    const novo = this.modo() === 'login' ? 'cadastro' : 'login';
    this.modo.set(novo);
    this.erro.set('');

    const nome = this.form.controls.nome;
    if (novo === 'cadastro') {
      nome.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      nome.clearValidators();
    }
    nome.updateValueAndValidity();
  }

  async enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    this.erro.set('');
    try {
      const { nome, email, senha } = this.form.getRawValue();
      if (this.modo() === 'cadastro') {
        await this.auth.cadastrar(nome.trim(), email, senha);
      }
      await this.auth.login(email, senha);
      this.router.navigate(['/home']);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro ao entrar.');
    } finally {
      this.carregando.set(false);
    }
  }
}