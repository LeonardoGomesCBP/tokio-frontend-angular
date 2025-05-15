import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  AuthResponse, 
  LoginRequest, 
  SignupRequest 
} from '../models/auth.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private isBrowser: boolean;
  
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_DATA_KEY = 'user_data';
  
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<AuthResponse | null>(null);
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.isAuthenticated.set(this.hasToken());
      this.currentUser.set(this.getUserData());
    }
  }

  login(loginRequest: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.API_URL}/login`, 
      loginRequest
    ).pipe(
      tap(response => {
        console.log('API Response:', response);
        if (response.result === 'SUCCESS' || response.result.toLowerCase() === 'success') {
          const authData = response.data || response;
          console.log('Auth data to set:', authData);
          this.setSession(authData);
        }
      })
    );
  }

  signup(signupRequest: SignupRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.API_URL}/signup`, 
      signupRequest
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_DATA_KEY);
    }
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  hasRole(role: string): boolean {
    const userData = this.getUserData();
    return userData?.roles?.includes(role) ?? false;
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  private setSession(authResult: AuthResponse): void {
    if (this.isBrowser) {
      // console.log('Setting session - token type:', typeof authResult.token, 'exists:', !!authResult.token);
      // console.log('Setting session - user data:', authResult);
      
      if (authResult && authResult.token) {
        localStorage.setItem(this.TOKEN_KEY, authResult.token);
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(authResult));
        
        console.log('Session set - token in storage:', 
          localStorage.getItem(this.TOKEN_KEY)?.substring(0, 15) + '...');
        
        this.isAuthenticated.set(true);
        this.currentUser.set(authResult);
        console.log('isAuthenticated signal:', this.isAuthenticated());
      } else {
        console.error('Token não encontrado na resposta:', authResult);
      }
    }
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private getUserData(): AuthResponse | null {
    if (!this.isBrowser) {
      return null;
    }
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }
} 