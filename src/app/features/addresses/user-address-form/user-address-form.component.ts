import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from '../../../core/services/address.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Address, User } from '../../../core/models/user.model';
import { CepService } from '../../../core/services/cep.service';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { CepMaskDirective } from '../../../shared/directives/cep-mask.directive';
import { ApiResponse } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent, CepMaskDirective],
  template: `
    <div class="address-form-container">
      <h2>{{ isEditMode() ? 'Editar' : 'Novo' }} Endereço de {{ userInfo()?.name || 'Usuário' }}</h2>
      
      @if (isLoading()) {
        <app-loader></app-loader>
      } @else {
        <div class="form-card">
          <form [formGroup]="addressForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="zipCode">CEP</label>
              <div class="input-with-action">
                <input 
                  type="text" 
                  id="zipCode" 
                  formControlName="zipCode" 
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('zipCode') || cepError()"
                  placeholder="00000-000"
                  (blur)="validateAndFetchCep()"
                  appCepMask
                />
                <button 
                  type="button" 
                  class="btn-action"
                  (click)="validateAndFetchCep()"
                  [disabled]="isLoadingCep() || !addressForm.get('zipCode')?.value"
                >
                  @if (isLoadingCep()) {
                    <span class="loader-small"></span>
                  } @else {
                    Buscar
                  }
                </button>
              </div>
              @if (cepError()) {
                <div class="error-message">{{ cepError() }}</div>
              } 
              @else if (isFieldInvalid('zipCode')) {
                <div class="error-message">
                  @if (addressForm.get('zipCode')?.hasError('required')) {
                    CEP é obrigatório.
                  } @else if (addressForm.get('zipCode')?.hasError('invalidCepLength') || addressForm.get('zipCode')?.hasError('invalidCepLengthCustom')) {
                    O CEP deve ter 8 dígitos numéricos (formato: 00000-000).
                  } @else if (addressForm.get('zipCode')?.hasError('cepApiError')) {
                    CEP não encontrado ou inválido.
                  } @else {
                    CEP inválido.
                  }
                </div>
              }
            </div>
            
            <div class="form-group">
              <label for="street">Rua</label>
              <input 
                type="text" 
                id="street" 
                formControlName="street" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('street')"
                [class.disabled-field]="addressForm.get('street')?.disabled"
              />
              @if (isFieldInvalid('street')) {
                <div class="error-message">Rua é obrigatória.</div>
              }
            </div>
            
            <div class="form-group">
              <label for="number">Número</label>
              <input 
                type="text" 
                id="number" 
                formControlName="number" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('number')"
              />
              @if (isFieldInvalid('number')) {
                <div class="error-message">Número é obrigatório.</div>
              }
            </div>
            
            <div class="form-group">
              <label for="complement">Complemento</label>
              <input 
                type="text" 
                id="complement" 
                formControlName="complement" 
                class="form-control"
              />
            </div>
            
            <div class="form-group">
              <label for="neighborhood">Bairro</label>
              <input 
                type="text" 
                id="neighborhood" 
                formControlName="neighborhood" 
                class="form-control"
                [class.disabled-field]="addressForm.get('neighborhood')?.disabled"
              />
            </div>
            
            <div class="form-group">
              <label for="city">Cidade</label>
              <input 
                type="text" 
                id="city" 
                formControlName="city" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('city')"
              />
              @if (isFieldInvalid('city')) {
                <div class="error-message">Cidade é obrigatória.</div>
              }
            </div>
            
            <div class="form-group">
              <label for="state">Estado</label>
              <input 
                type="text" 
                id="state" 
                formControlName="state" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('state')"
              />
              @if (isFieldInvalid('state')) {
                <div class="error-message">Estado é obrigatório.</div>
              }
            </div>
            
            <div class="form-group">
              <label for="country">País</label>
              <input 
                type="text" 
                id="country" 
                formControlName="country" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('country')"
              />
              @if (isFieldInvalid('country')) {
                <div class="error-message">País é obrigatório.</div>
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
                [disabled]="addressForm.invalid || isSaving()"
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
    .address-form-container {
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
    
    .input-with-action {
      display: flex;
      gap: 10px;
    }
    
    .input-with-action .form-control {
      flex: 1;
    }
    
    .btn-action {
      padding: 10px 15px;
      background-color: #4318D1;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    
    .btn-action:hover {
      background-color: #3512b3;
    }
    
    .btn-action:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    
    .loader-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
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
    
    .form-control.disabled-field {
      background-color: #f5f5f5;
      color: #666;
      cursor: not-allowed;
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
export class UserAddressFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private addressService = inject(AddressService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private cepService = inject(CepService);
  private authService = inject(AuthService);
  
  addressForm!: FormGroup;
  userId!: number;
  addressId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  userInfo = signal<User | null>(null);
  
  isLoadingCep = signal<boolean>(false);
  cepError = signal<string | null>(null);
  
  ngOnInit(): void {
    this.initForm();
    
    this.route.paramMap.subscribe(params => {
      const userIdParam = params.get('id');
      
      if (!userIdParam) {
        const currentUser = this.authService.currentUser();
        if (currentUser?.id) {
          this.userId = currentUser.id;
          
          const addressIdParam = params.get('addressId');
          if (addressIdParam) {
            const addressId = parseInt(addressIdParam, 10);
            if (!isNaN(addressId)) {
              this.isEditMode.set(true);
              this.addressId.set(addressId);
              this.loadAddress(addressId);
            }
          }
          
          this.loadUserInfo();
          return;
        } else {
          this.notificationService.showError('ID do usuário não encontrado');
          this.router.navigate(['/dashboard']);
          return;
        }
      }
      
      this.userId = parseInt(userIdParam, 10);
      
      if (isNaN(this.userId)) {
        this.notificationService.showError('ID do usuário inválido');
        this.router.navigate(['/dashboard']);
        return;
      }
      
      const addressIdParam = params.get('addressId');
      if (addressIdParam) {
        const addressId = parseInt(addressIdParam, 10);
        if (!isNaN(addressId)) {
          this.isEditMode.set(true);
          this.addressId.set(addressId);
          this.loadAddress(addressId);
        }
      }
      
      this.loadUserInfo();
    });
    
    this.addressForm.get('zipCode')?.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      filter(zipCode => {
        if (!zipCode) return false;
        return (zipCode.includes('-') && zipCode.length >= 9) || 
               (!zipCode.includes('-') && zipCode.length >= 8);
      })
    ).subscribe(() => {
      this.validateAndFetchCep();
    });
  }
  
  loadUserInfo(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (response: ApiResponse<User>) => {
        this.userInfo.set(response.data);
      },
      error: (error: any) => {
        this.notificationService.showError(
          error.error?.message || 'Falha ao carregar informações do usuário'
        );
      }
    });
  }
  
  validateAndFetchCep(): void {
    const zipCodeControl = this.addressForm.get('zipCode');
    const zipCode = zipCodeControl?.value;

    this.cepError.set(null);
    let notificationShown = false;

    if (zipCodeControl?.errors) {
      const { invalidCepLengthCustom, cepApiError, ...otherErrors } = zipCodeControl.errors;
      zipCodeControl.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
    }

    if (!zipCode) {
      if (!zipCodeControl?.hasError('required') && !notificationShown) {
        this.notificationService.showError('CEP é obrigatório');
        notificationShown = true;
      }
      zipCodeControl?.markAsTouched();
      zipCodeControl?.setErrors({ ...(zipCodeControl.errors || {}), required: true });
      return;
    }
    
    const cleanZipCode = zipCode.replace(/\D/g, '');
    
    if (cleanZipCode.length !== 8) {
      if (!zipCodeControl?.hasError('invalidCepLengthCustom') && !notificationShown) {
        const errorMessage = 'O CEP deve ter 8 dígitos numéricos (formato: 00000-000)';
        this.cepError.set(errorMessage);
        this.notificationService.showError(errorMessage);
        notificationShown = true;
      }
      zipCodeControl?.setErrors({ ...(zipCodeControl.errors || {}), invalidCepLengthCustom: true });
      return;
    }
    
    if (this.isLoadingCep()) return; 

    this.isLoadingCep.set(true);
    
    this.cepService.getCepInfo(cleanZipCode).subscribe({
      next: (cepInfo) => {
        this.isLoadingCep.set(false);
        
        if (cepInfo.erro) {
          if (!zipCodeControl?.hasError('cepApiError') && !notificationShown) {
            const errorMessage = 'CEP inválido ou não encontrado. Verifique o número informado.';
            this.cepError.set(errorMessage);
            this.notificationService.showError(errorMessage);
            notificationShown = true;
          }
          zipCodeControl?.setErrors({ ...(zipCodeControl.errors || {}), cepApiError: true });
          this.addressForm.patchValue({
            street: '',
            neighborhood: '',
            city: '',
            state: '',
            country: 'Brasil'
          }, { emitEvent: false });
          this.addressForm.get('street')?.enable();
          this.addressForm.get('neighborhood')?.enable();
          this.addressForm.get('city')?.enable();
          this.addressForm.get('state')?.enable();
          return;
        }
        
        if (!zipCodeControl?.hasError('cepApiError') && !notificationShown) {
          this.notificationService.showSuccess('CEP encontrado com sucesso!');
          notificationShown = true;
        }
        this.addressForm.patchValue({
          zipCode: cepInfo.cep,
          street: cepInfo.logradouro || '',
          complement: this.addressForm.get('complement')?.value || '',
          neighborhood: cepInfo.bairro || '',
          city: cepInfo.localidade || '',
          state: cepInfo.uf || '',
          country: 'Brasil'
        }, { emitEvent: false });
        
        this.addressForm.get('city')?.disable();
        this.addressForm.get('state')?.disable();
        if (cepInfo.logradouro) this.addressForm.get('street')?.disable();
        if (cepInfo.bairro) this.addressForm.get('neighborhood')?.disable();
        
        setTimeout(() => document.getElementById('number')?.focus(), 100);
      },
      error: (error: any) => {
        this.isLoadingCep.set(false);
        if (!zipCodeControl?.hasError('cepApiError') && !notificationShown) {
          const errorMessage = 'Erro ao consultar o CEP. Tente novamente mais tarde.';
          this.cepError.set(errorMessage);
          this.notificationService.showError(errorMessage);
          notificationShown = true;
        }
        zipCodeControl?.setErrors({ ...(zipCodeControl.errors || {}), cepApiError: true });
      }
    });
  }
  
  onSubmit(): void {
    if (this.addressForm.invalid) {
      Object.keys(this.addressForm.controls).forEach(key => {
        this.addressForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isSaving.set(true);
    
    const addressData: Address = this.addressForm.value;
    addressData.userId = this.userId;
    
    if (this.isEditMode()) {
      this.updateAddress(addressData);
    } else {
      this.createAddress(addressData);
    }
  }
  
  cancel(): void {
    this.router.navigate(['/dashboard/users', this.userId, 'addresses']);
  }
  
  isFieldInvalid(field: string): boolean {
    const control = this.addressForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
  
  private initForm(): void {
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      number: ['', Validators.required],
      complement: [''],
      neighborhood: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['Brasil', Validators.required]
    });
  }
  
  private loadAddress(id: number): void {
    this.isLoading.set(true);
    
    this.addressService.getAddressById(this.userId, id).subscribe({
      next: (response: ApiResponse<Address>) => {
        this.isLoading.set(false);
        this.addressForm.patchValue(response.data);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.notificationService.showError(
          error.error?.message || 'Falha ao carregar o endereço. Por favor, tente novamente.'
        );
        this.router.navigate(['/dashboard/users', this.userId]);
      }
    });
  }
  
  private createAddress(addressData: Address): void {
    this.addressService.createAddress(this.userId, addressData).subscribe({
      next: (response: ApiResponse<Address>) => {
        this.isSaving.set(false);
        this.notificationService.showSuccess(response.message);
        this.router.navigate(['/dashboard/users', this.userId, 'addresses']);
      },
      error: (error: any) => {
        this.isSaving.set(false);
        this.notificationService.showError(
          error.error?.message || 'Falha ao criar o endereço. Por favor, tente novamente.'
        );
      }
    });
  }
  
  private updateAddress(addressData: Address): void {
    const id = this.addressId();
    if (!id) return;
    
    this.addressService.updateAddress(this.userId, id, addressData).subscribe({
      next: (response: ApiResponse<Address>) => {
        this.isSaving.set(false);
        this.notificationService.showSuccess(response.message);
        this.router.navigate(['/dashboard/users', this.userId, 'addresses']);
      },
      error: (error: any) => {
        this.isSaving.set(false);
        this.notificationService.showError(
          error.error?.message || 'Falha ao atualizar o endereço. Por favor, tente novamente.'
        );
      }
    });
  }
} 