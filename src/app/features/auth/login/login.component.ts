import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoaderComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">Login</h1>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              [class.is-invalid]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <div class="error-message">
                @if (loginForm.get('email')?.hasError('required')) {
                  E-mail é obrigatório.
                } @else if (loginForm.get('email')?.hasError('email')) {
                  Por favor, insira um e-mail válido.
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label for="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-control"
              [class.is-invalid]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <div class="error-message">
                Senha é obrigatória.
              </div>
            }
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="loginForm.invalid || isLoading"
          >
            Entrar
          </button>
        </form>
        
        @if (isLoading) {
          <app-loader></app-loader>
        }
        
        <p class="register-link">
          Não tem uma conta? 
          <a routerLink="/auth/register">Cadastre-se aqui</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 30px;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .login-title {
      font-size: 30px;
      font-weight: 700;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #000;
      border-radius: 8px;
      font-size: 16px;
    }
    
    .form-control.is-invalid {
      border-color: #dc3545;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .btn {
      display: block;
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-primary {
      background-color: #4318D1;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #3512b3;
    }
    
    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    
    .register-link {
      margin-top: 20px;
      text-align: center;
      color: #666666;
    }
    
    .register-link a {
      color: #4318D1;
      text-decoration: none;
    }
    
    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  
  isLoading = false;
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notificationService.showSuccess(response.message);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError(
          error.error?.message || 'Login failed. Please try again.'
        );
      }
    });
  }
  
  isFieldInvalid(field: string): boolean {
    const formControl = this.loginForm.get(field);
    return !!formControl && formControl.invalid && formControl.touched;
  }
} 