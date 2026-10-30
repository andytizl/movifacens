import { Injectable, signal, computed } from '@angular/core';
import { Usuario } from '../models/usuario';
import { emailFacensValido } from '../utils/validar-email-facens';
import { supabase } from '../supabase';

const CHAVE = 'movifacens_usuario';

@Injectable({ providedIn: 'root' })
export class Auth {
  private _usuario = signal<Usuario | null>(this.carregar());

  usuario = this._usuario.asReadonly();
  logado = computed(() => this._usuario() !== null);
  
  constructor() {
  supabase.auth.getSession().then(({ data }) => {
    if (!data.session) {
      this._usuario.set(null);
      localStorage.removeItem(CHAVE);
    }
  });
}

  estaLogado(): boolean {
    return this.logado();
  }

  async login(email: string, senha: string): Promise<void> {
    if (!emailFacensValido(email)) {
      throw new Error('Use seu email institucional da Facens.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error || !data.user) {
      throw new Error('Email ou senha incorretos.');
    }
    this.definirUsuario({
      id: data.user.id,
      nome: data.user.user_metadata?.['nome'] ?? email.split('@')[0],
      email: data.user.email ?? email,
    });
  }

  async cadastrar(nome: string, email: string, senha: string): Promise<void> {
    if (!emailFacensValido(email)) {
      throw new Error('Use seu email institucional da Facens.');
    }
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    this._usuario.set(null);
    localStorage.removeItem(CHAVE);
  }

  private definirUsuario(u: Usuario) {
    this._usuario.set(u);
    localStorage.setItem(CHAVE, JSON.stringify(u));
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