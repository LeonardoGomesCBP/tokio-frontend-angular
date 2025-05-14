import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface CepInfo {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly VIA_CEP_URL = 'https://viacep.com.br/ws/';

  constructor(private http: HttpClient) {}

  validateCep(cep: string): boolean {
    if (!cep) return false;
    
    const cleanedCep = cep.replace(/\D/g, '');
    return cleanedCep.length === 8;
  }

  getCepInfo(cep: string): Observable<CepInfo> {
    if (!cep) {
      return throwError(() => new Error('CEP não pode ser vazio'));
    }
    
    const cleanedCep = cep.replace(/\D/g, '');
    
    if (cleanedCep.length !== 8) {
      return throwError(() => new Error('O CEP deve ter 8 dígitos'));
    }
    
    return this.http.get<CepInfo>(`${this.VIA_CEP_URL}${cleanedCep}/json/`)
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            return throwError(() => new Error('CEP não encontrado'));
          }
          return throwError(() => new Error('Erro ao consultar o CEP. Tente novamente.'));
        })
      );
  }
} 