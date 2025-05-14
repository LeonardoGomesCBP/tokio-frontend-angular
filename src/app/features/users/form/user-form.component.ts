import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  template: `
    <div class="user-form-container">
      <h2>{{ isEditMode() ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
      
      @if (isLoading()) {
        <app-loader></app-loader>
      } @else {
        <div class="form-card">
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
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
                  @if (userForm.get('email')?.hasError('required')) {
                    E-mail é obrigatório.
                  } @else if (userForm.get('email')?.hasError('email')) {
                    Por favor, insira um e-mail válido.
                  }
                </div>
              }
            </div>
            
            <div class="form-group">
              <label for="password">{{ isEditMode() ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha' }}</label>
              <input 
                type="password" 
                id="password" 
                formControlName="password" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('password')"
              />
              @if (isFieldInvalid('password')) {
                <div class="error-message">
                  @if (userForm.get('password')?.hasError('required')) {
                    Senha é obrigatória.
                  } @else if (userForm.get('password')?.hasError('minlength')) {
                    A senha deve ter pelo menos 6 caracteres.
                  }
                </div>
              }
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary"
                (click)="cancel()"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="userForm.invalid || isSaving()"
              >
                Salvar
              </button>
            </div>
          </form>
          
          @if (isSaving()) {
            <app-loader></app-loader>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .user-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 30px;
    }
    
    h2 {
      font-size: 24px;
      margin-bottom: 30px;
    }
    
    .form-card {
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
    
    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }
    
    .btn {
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
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #5a6268;
    }
    
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  
  userForm!: FormGroup;
  userId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  
  ngOnInit(): void {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(+id);
      this.isEditMode.set(true);
      this.loadUser(+id);
    }
  }
  
  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }
    
    this.isSaving.set(true);
    
    const userData: User = {
      name: this.userForm.value.name,
      email: this.userForm.value.email,
    };
    
    if (this.userForm.value.password) {
      userData.password = this.userForm.value.password;
    }
    
    if (this.isEditMode()) {
      this.updateUser(userData);
    } else {
      this.createUser(userData);
    }
  }
  
  cancel(): void {
    this.router.navigate(['/dashboard/users']);
  }
  
  isFieldInvalid(field: string): boolean {
    const formControl = this.userForm.get(field);
    return !!formControl && formControl.invalid && formControl.touched;
  }
  
  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['ROLE_USER', Validators.required],
      active: [true]
    });
  }
  
  private loadUser(id: number): void {
    this.isLoading.set(true);
    
    this.userService.getUserById(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.userForm.patchValue({
          name: response.data.name,
          email: response.data.email
        });
        
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.setValidators(Validators.minLength(6));
        this.userForm.get('password')?.updateValueAndValidity();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.showError(
          error.error?.message || 'Failed to load user. Please try again.'
        );
        this.router.navigate(['/dashboard/users']);
      }
    });
  }
  
  private createUser(userData: User): void {
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.notificationService.showSuccess(response.message);
        this.router.navigate(['/dashboard/users']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.notificationService.showError(
          error.error?.message || 'Failed to create user. Please try again.'
        );
      }
    });
  }
  
  private updateUser(userData: User): void {
    if (!this.userId()) {
      return;
    }
    
    this.userService.updateUser(this.userId()!, userData).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.notificationService.showSuccess(response.message);
        this.router.navigate(['/dashboard/users']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.notificationService.showError(
          error.error?.message || 'Failed to update user. Please try again.'
        );
      }
    });
  }
} 