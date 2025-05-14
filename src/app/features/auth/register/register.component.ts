import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoaderComponent],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1 class="register-title">Cadastro</h1>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nome</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name" 
              class="form-control"
              [class.is-invalid]="isFieldInvalid('name')"
            />
            @if (isFieldInvalid('name')) {
              <div class="error-message">Nome é obrigatório.</div>
            }
          </div>
          
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
                @if (registerForm.get('email')?.hasError('required')) {
                  E-mail é obrigatório.
                } @else if (registerForm.get('email')?.hasError('email')) {
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
                @if (registerForm.get('password')?.hasError('required')) {
                  Senha é obrigatória.
                } @else if (registerForm.get('password')?.hasError('minlength')) {
                  A senha deve ter pelo menos 6 caracteres.
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar Senha</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword" 
              class="form-control"
              [class.is-invalid]="isFieldInvalid('confirmPassword')"
            />
            @if (isFieldInvalid('confirmPassword')) {
              <div class="error-message">
                @if (registerForm.get('confirmPassword')?.hasError('required')) {
                  Confirmação de senha é obrigatória.
                } @else if (registerForm.get('confirmPassword')?.hasError('passwordMismatch')) {
                  As senhas não coincidem.
                }
              </div>
            }
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="registerForm.invalid || isLoading"
          >
            Cadastrar
          </button>
        </form>
        
        @if (isLoading) {
          <app-loader></app-loader>
        }
        
        <p class="login-link">
          Já tem uma conta? 
          <a routerLink="/auth/login">Entre aqui</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    .register-card {
      width: 100%;
      max-width: 400px;
      padding: 30px;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .register-title {
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
    
    .login-link {
      margin-top: 20px;
      text-align: center;
      color: #666666;
    }
    
    .login-link a {
      color: #4318D1;
      text-decoration: none;
    }
    
    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  
  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });
  
  isLoading = false;
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    const { name, email, password } = this.registerForm.value;
    
    this.isLoading = true;
    
    this.authService.signup({ name, email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notificationService.showSuccess(response.message);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError(
          error.error?.message || 'Registration failed. Please try again.'
        );
      }
    });
  }
  
  isFieldInvalid(field: string): boolean {
    const formControl = this.registerForm.get(field);
    return !!formControl && formControl.invalid && formControl.touched;
  }
  
  private passwordMatchValidator(form: FormGroup): { passwordMismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
} 