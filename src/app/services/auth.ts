import { Injectable, signal, computed } from '@angular/core';
import { Usuario } from '../models/usuario';
import { emailFacensValido } from '../utils/validar-email-facens';

const CHAVE = 'movifacens_usuario';

@Injectable({ providedIn: 'root' })
export class Auth {
  private _usuario = signal<Usuario | null>(this.carregar());

  usuario = this._usuario.asReadonly();
  logado = computed(() => this._usuario() !== null);

  estaLogado(): boolean {
    return this.logado();
  }

  // MOCK: depois troque o corpo por supabase.auth.signInWithPassword(...)
  async login(email: string, senha: string): Promise<void> {
    await new Promise(r => setTimeout(r, 500)); // simula rede

    if (!emailFacensValido(email)) {
      throw new Error('Use seu email institucional da Facens.');
    }
    if (senha.length < 6) {
      throw new Error('Senha inválida.');
    }

    const usuario: Usuario = {
      id: 1,
      nome: email.split('@')[0],
      email: email.toLowerCase(),
    };
    this._usuario.set(usuario);
    localStorage.setItem(CHAVE, JSON.stringify(usuario));
  }

  logout(): void {
    this._usuario.set(null);
    localStorage.removeItem(CHAVE);
  }

  private carregar(): Usuario | null {
    try {
      const salvo = localStorage.getItem(CHAVE);
      return salvo ? (JSON.parse(salvo) as Usuario) : null;
    } catch {
      return null;
    }
  }
}