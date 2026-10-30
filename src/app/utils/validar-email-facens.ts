import { AbstractControl, ValidationErrors } from '@angular/forms';

export const DOMINIOS_FACENS = ['facens.br', 'alunos.facens.br'];

export function emailFacensValido(email: string): boolean {
  const partes = email.trim().toLowerCase().split('@');
  return partes.length === 2 && partes[0].length > 0 && DOMINIOS_FACENS.includes(partes[1]);
}

export function emailFacensValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  if (!valor) return null; // "required" cuida do vazio
  return emailFacensValido(valor) ? null : { emailFacens: true };
}