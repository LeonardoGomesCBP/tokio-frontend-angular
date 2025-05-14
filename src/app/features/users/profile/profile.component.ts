import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  template: `
    <div class="profile-container">
      <h2>Meu Perfil</h2>
      
      @if (isLoading()) {
        <app-loader></app-loader>
      } @else {
        <div class="profile-card">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
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
                [attr.disabled]="isAdmin ? null : ''"
              />
              @if (isFieldInvalid('email')) {
                <div class="error-message">
                  @if (profileForm.get('email')?.hasError('required')) {
                    E-mail é obrigatório.
                  } @else if (profileForm.get('email')?.hasError('email')) {
                    Por favor, insira um e-mail válido.
                  }
                </div>
              }
              @if (!isAdmin) {
                <div class="info-message">E-mail só pode ser alterado por um administrador.</div>
              }
            </div>
            
            <div class="form-group">
              <label for="password">Nova Senha (deixe em branco para manter a atual)</label>
              <input 
                type="password" 
                id="password" 
                formControlName="password" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('password')"
              />
              @if (isFieldInvalid('password')) {
                <div class="error-message">
                  A senha deve ter pelo menos 6 caracteres.
                </div>
              }
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirmar Nova Senha</label>
              <input 
                type="password" 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('confirmPassword')"
              />
              @if (isFieldInvalid('confirmPassword')) {
                <div class="error-message">
                  As senhas não coincidem.
                </div>
              }
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="profileForm.invalid || isSaving()"
            >
              Salvar Alterações
            </button>
          </form>
          
          @if (isSaving()) {
            <app-loader></app-loader>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    h2 {
      font-size: 24px;
      margin-bottom: 30px;
    }
    
    .profile-card {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
    
    .form-control[disabled] {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .info-message {
      color: #6c757d;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .btn {
      display: inline-block;
      padding: 10px 20px;
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
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  
  profileForm!: FormGroup;
  userId = this.authService.currentUser()?.id as number;
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  
  get isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
  
  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
  }
  
  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }
    
    this.isSaving.set(true);
    
    const userData: User = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email,
    };
    
    this.userService.updateUser(this.userId, userData).subscribe({
      next: (response) => {
        if (this.profileForm.value.password) {
          this.updatePassword();
        } else {
          this.handleSuccess(response.message);
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        this.notificationService.showError(
          error.error?.message || 'Failed to update profile. Please try again.'
        );
      }
    });
  }
  
  isFieldInvalid(field: string): boolean {
    const formControl = this.profileForm.get(field);
    return !!formControl && formControl.invalid && formControl.touched;
  }
  
  private initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{value: '', disabled: !this.isAdmin}, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }
  
  private loadUserData(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.profileForm.patchValue({
          name: response.data.name,
          email: response.data.email
        });
        
        if (!this.isAdmin) {
          this.profileForm.get('email')?.disable();
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.showError(
          error.error?.message || 'Failed to load profile. Please try again.'
        );
      }
    });
  }
  
  private updatePassword(): void {
    this.userService.updatePassword(this.userId, this.profileForm.value.password).subscribe({
      next: (response) => {
        this.handleSuccess('Profile and password updated successfully.');
      },
      error: (error) => {
        this.isSaving.set(false);
        this.notificationService.showError(
          error.error?.message || 'Failed to update password. Please try again.'
        );
      }
    });
  }
  
  private handleSuccess(message: string): void {
    this.isSaving.set(false);
    this.notificationService.showSuccess(message);
    this.profileForm.get('password')?.reset();
    this.profileForm.get('confirmPassword')?.reset();
  }
  
  private passwordMatchValidator(form: FormGroup): { passwordMismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (!password) {
      return null;
    }
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
} 