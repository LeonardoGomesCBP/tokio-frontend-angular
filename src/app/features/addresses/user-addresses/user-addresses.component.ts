import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AddressService } from '../../../core/services/address.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Address, Page, User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-addresses',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  template: `
    <div class="user-addresses-container">
      <div class="user-addresses-header">
        <h2>Endereços de {{ userInfo()?.name || 'Usuário' }}</h2>
        <button 
          class="btn btn-secondary"
          (click)="goBack()"
        >
          Voltar para Usuários
        </button>
        <a [routerLink]="['/dashboard/users', userId, 'addresses', 'new']" class="btn btn-primary">Novo Endereço</a>
      </div>
      
      @if (isLoading()) {
        <app-loader></app-loader>
      } @else if (addresses()?.content?.length) {
        <div class="table-container">
          <table class="addresses-table">
            <thead>
              <tr>
                <th>Rua</th>
                <th>Número</th>
                <th>Complemento</th>
                <th>Bairro</th>
                <th>Cidade</th>
                <th>Estado</th>
                <th>CEP</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (address of addresses()?.content || []; track address.id) {
                <tr>
                  <td>{{ address.street }}</td>
                  <td>{{ address.number }}</td>
                  <td>{{ address.complement || '-' }}</td>
                  <td>{{ address.neighborhood || '-' }}</td>
                  <td>{{ address.city }}</td>
                  <td>{{ address.state }}</td>
                  <td>{{ address.zipCode }}</td>
                  <td class="actions-cell">
                    <a [routerLink]="['/dashboard/users', userId, 'addresses', address.id, 'edit']" 
                       class="btn-action edit">
                      Editar
                    </a>
                    <button 
                      class="btn-action delete"
                      (click)="confirmDelete(address)"
                      [disabled]="deletingId() === address.id"
                    >
                      @if (deletingId() === address.id) {
                        Excluindo...
                      } @else {
                        Excluir
                      }
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          
          @if ((addresses()?.totalPages ?? 0) > 1) {
            <div class="pagination">
              <button 
                class="btn-page" 
                [disabled]="currentPage() === 0"
                (click)="changePage(currentPage() - 1)"
              >
                Anterior
              </button>
              
              @for (page of getPageNumbers(); track page) {
                <button 
                  class="btn-page" 
                  [class.active]="currentPage() === page"
                  (click)="changePage(page)"
                >
                  {{ page + 1 }}
                </button>
              }
              
              <button 
                class="btn-page" 
                [disabled]="currentPage() === (addresses()?.totalPages ?? 0) - 1"
                (click)="changePage(currentPage() + 1)"
              >
                Próximo
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="no-addresses">
          <p>Nenhum endereço encontrado para este usuário.</p>
          <a [routerLink]="['/dashboard/users', userId, 'addresses', 'new']" class="btn btn-primary">
            Adicionar Endereço
          </a>
        </div>
      }
      
      @if (showConfirmation()) {
        <div class="modal-overlay">
          <div class="modal-content">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir este endereço?</p>
            <div class="modal-actions">
              <button 
                class="btn btn-secondary"
                (click)="cancelDelete()"
              >
                Cancelar
              </button>
              <button 
                class="btn btn-danger"
                (click)="deleteAddress()"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .user-addresses-container {
      padding-bottom: 30px;
    }
    
    .user-addresses-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    h2 {
      font-size: 24px;
      margin: 0;
      flex-grow: 1;
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
      text-decoration: none;
      margin-left: 10px;
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
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .table-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .addresses-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .addresses-table th,
    .addresses-table td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .addresses-table th {
      background-color: #f8f9fa;
      font-weight: 700;
    }
    
    .actions-cell {
      width: 210px;
    }
    
    .btn-action {
      display: inline-block;
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      margin-right: 12px;
      margin-bottom: 8px;
      font-size: 14px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      width: 95px;
      text-align: center;
    }
    
    .btn-action.edit {
      color: white;
      background-color: #4318D1;
    }
    
    .btn-action.edit:hover {
      background-color: #3512b3;
    }
    
    .btn-action.delete {
      color: white;
      background-color: #dc3545;
    }
    
    .btn-action.delete:hover {
      background-color: #bd2130;
    }
    
    .btn-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }
    
    .pagination {
      display: flex;
      justify-content: center;
      padding: 20px 0;
      gap: 10px;
    }
    
    .btn-page {
      padding: 5px 10px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      background-color: white;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-page.active {
      background-color: #4318D1;
      color: white;
      border-color: #4318D1;
    }
    
    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .no-addresses {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .no-addresses p {
      margin-bottom: 20px;
      color: #6c757d;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .modal-content h3 {
      margin-top: 0;
      margin-bottom: 20px;
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }
  `]
})
export class UserAddressesComponent implements OnInit {
  private addressService = inject(AddressService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  
  userId!: number;
  addresses = signal<Page<Address> | null>(null);
  userInfo = signal<User | null>(null);
  isLoading = signal<boolean>(true);
  showConfirmation = signal<boolean>(false);
  addressToDelete = signal<Address | null>(null);
  deletingId = signal<number | null>(null);
  currentPage = signal<number>(0);
  pageSize = 10;
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.loadUserInfo();
      this.loadAddresses();
    } else {
      this.router.navigate(['/dashboard/users']);
    }
  }
  
  loadAddresses(page = 0): void {
    this.isLoading.set(true);
    this.currentPage.set(page);
    
    this.addressService.getAddresses(this.userId, page, this.pageSize).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.addresses.set(response.data);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.showError(
          error.error?.message || 'Failed to load addresses. Please try again.'
        );
      }
    });
  }
  
  loadUserInfo(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        this.userInfo.set(response.data);
      },
      error: (error) => {
        this.notificationService.showError(
          error.error?.message || 'Failed to load user information.'
        );
      }
    });
  }
  
  changePage(page: number): void {
    this.loadAddresses(page);
  }
  
  getPageNumbers(): number[] {
    const totalPages = this.addresses()?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  
  confirmDelete(address: Address): void {
    this.addressToDelete.set(address);
    this.showConfirmation.set(true);
  }
  
  cancelDelete(): void {
    this.addressToDelete.set(null);
    this.showConfirmation.set(false);
  }
  
  deleteAddress(): void {
    const address = this.addressToDelete();
    if (!address?.id) {
      return;
    }
    
    this.deletingId.set(address.id);
    this.showConfirmation.set(false);
    
    this.addressService.deleteAddress(this.userId, address.id).subscribe({
      next: (response) => {
        this.deletingId.set(null);
        this.notificationService.showSuccess(response.message);
        this.loadAddresses(this.currentPage());
      },
      error: (error) => {
        this.deletingId.set(null);
        this.notificationService.showError(
          error.error?.message || 'Failed to delete address. Please try again.'
        );
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/dashboard/users']);
  }
} 