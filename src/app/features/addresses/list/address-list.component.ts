import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Address, Page } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, DatePipe, FormsModule],
  template: `
    <div class="addresses-container">
      <div class="addresses-header">
        <h2>Meus Endereços</h2>
        <a routerLink="/dashboard/addresses/new" class="btn btn-primary">Novo Endereço</a>
      </div>
      
      <div class="search-and-sort">
        <div class="search-container">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Buscar por cidade, estado, rua ou CEP" 
            [value]="searchTerm()"
            (input)="updateSearch($event)"
          >
        </div>
        
        <div class="sort-controls">
          <div class="sort-group">
            <label for="sortField">Ordenar por:</label>
            <select 
              id="sortField" 
              [value]="sortBy()" 
              (change)="updateSortBy($event)"
              class="sort-select"
            >
              <option value="zipCode">CEP</option>
              <option value="city">Cidade</option>
              <option value="createdAt">Data de criação</option>
            </select>
          </div>
        </div>
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
                <th>Criado em</th>
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
                  <td>{{ address.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="actions-cell">
                    <a [routerLink]="['/dashboard/addresses', address.id, 'edit']" 
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
                [disabled]="addresses()?.isFirst"
                (click)="changePage(currentPage() - 1)"
              >
                Anterior
              </button>
              
              @for (page of getPageNumbers(); track page) {
                <button 
                  class="btn-page" 
                  [class.active]="addresses()?.pageNumber === page"
                  (click)="changePage(page)"
                >
                  {{ page + 1 }}
                </button>
              }
              
              <button 
                class="btn-page" 
                [disabled]="addresses()?.isLast"
                (click)="changePage(currentPage() + 1)"
              >
                Próximo
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="no-addresses">
          <p>Nenhum endereço encontrado. Adicione um novo endereço para começar.</p>
          <a routerLink="/dashboard/addresses/new" class="btn btn-primary">Novo Endereço</a>
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
      
      <!-- Lista de todos os endereços para administradores -->
      @if (isAdmin) {
        <div class="all-addresses-section">
          <h2 class="all-addresses-title">Lista de endereços registrados</h2>
          
          <div class="search-and-sort">
            <div class="search-container">
              <input 
                type="text" 
                class="search-input" 
                placeholder="Buscar por cidade, estado, rua ou CEP" 
                [value]="allSearchTerm()"
                (input)="updateAllSearch($event)"
              >
            </div>
            
            <div class="sort-controls">
              <div class="sort-group">
                <label for="allSortField">Ordenar por:</label>
                <select 
                  id="allSortField" 
                  [value]="allSortBy()" 
                  (change)="updateAllSortBy($event)"
                  class="sort-select"
                >
                  <option value="zipCode">CEP</option>
                  <option value="city">Cidade</option>
                  <option value="createdAt">Data de criação</option>
                </select>
              </div>
            </div>
          </div>
          
          @if (isLoadingAll()) {
            <app-loader></app-loader>
          } @else if (allAddresses()?.content?.length) {
            <div class="table-container">
              <table class="addresses-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Rua</th>
                    <th>Número</th>
                    <th>Complemento</th>
                    <th>Bairro</th>
                    <th>Cidade</th>
                    <th>Estado</th>
                    <th>CEP</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (address of allAddresses()?.content || []; track address.id) {
                    <tr>
                      <td>{{ address.userId }}</td>
                      <td>{{ address.street }}</td>
                      <td>{{ address.number }}</td>
                      <td>{{ address.complement || '-' }}</td>
                      <td>{{ address.neighborhood || '-' }}</td>
                      <td>{{ address.city }}</td>
                      <td>{{ address.state }}</td>
                      <td>{{ address.zipCode }}</td>
                      <td>{{ address.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="actions-cell">
                        <a [routerLink]="['/dashboard/users', address.userId, 'addresses', address.id, 'edit']" 
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
              
              @if ((allAddresses()?.totalPages ?? 0) > 1) {
                <div class="pagination">
                  <button 
                    class="btn-page" 
                    [disabled]="allAddresses()?.isFirst"
                    (click)="changeAllAddressesPage(allAddressesPage() - 1)"
                  >
                    Anterior
                  </button>
                  
                  @for (page of getAllAddressesPageNumbers(); track page) {
                    <button 
                      class="btn-page" 
                      [class.active]="allAddresses()?.pageNumber === page"
                      (click)="changeAllAddressesPage(page)"
                    >
                      {{ page + 1 }}
                    </button>
                  }
                  
                  <button 
                    class="btn-page" 
                    [disabled]="allAddresses()?.isLast"
                    (click)="changeAllAddressesPage(allAddressesPage() + 1)"
                  >
                    Próximo
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="no-addresses">
              <p>Nenhum endereço registrado no sistema.</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .addresses-container {
      padding-bottom: 30px;
      padding-left: 15px;
      padding-right: 15px;
    }
    
    .addresses-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    h2 {
      font-size: 24px;
      margin: 0;
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
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .search-and-sort {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 20px;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .search-container {
      display: flex;
      flex-grow: 1;
      max-width: 500px;
      min-width: 200px;
      width: 100%;
    }
    
    .search-input {
      flex-grow: 1;
      padding: 10px 15px;
      border: 1px solid #ced4da;
      border-radius: 8px;
      font-size: 16px;
      width: 100%;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #4318D1;
      box-shadow: 0 0 0 2px rgba(67, 24, 209, 0.2);
    }
    
    .sort-controls {
      display: flex;
      gap: 10px;
      background-color: white;
      padding: 10px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      flex-wrap: wrap;
    }
    
    .sort-group {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .sort-select {
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background-color: white;
      min-width: 150px;
    }
    
    .table-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
    }
    
    .addresses-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 650px;
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
      min-width: 210px;
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
      flex-wrap: wrap;
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
      width: 90%;
      margin: 0 10px;
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
      flex-wrap: wrap;
    }
    
    .all-addresses-section {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e0e0e0;
    }
    
    .all-addresses-title {
      font-size: 24px;
      margin: 0 0 20px 0;
      color: #4318D1;
    }
    
    @media (max-width: 768px) {
      .addresses-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .search-and-sort {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-container {
        max-width: 100%;
      }
      
      .sort-controls {
        width: 100%;
      }
      
      .sort-group {
        width: 100%;
        justify-content: space-between;
      }
      
      .sort-select {
        flex-grow: 1;
      }
      
      .modal-actions {
        justify-content: center;
      }
    }
    
    @media (max-width: 480px) {
      h2 {
        font-size: 20px;
      }
      
      .btn {
        width: 100%;
      }
      
      .actions-cell {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      
      .btn-action {
        width: 100%;
        margin-right: 0;
      }
    }
  `]
})
export class AddressListComponent implements OnInit {
  private addressService = inject(AddressService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  
  addresses = signal<Page<Address> | null>(null);
  allAddresses = signal<Page<Address> | null>(null);
  isLoading = signal<boolean>(true);
  isLoadingAll = signal<boolean>(false);
  showConfirmation = signal<boolean>(false);
  addressToDelete = signal<Address | null>(null);
  deletingId = signal<number | null>(null);
  currentPage = signal<number>(0);
  allAddressesPage = signal<number>(0);
  pageSize = 10;
  userId = this.authService.currentUser()?.id || 0;
  
  sortBy = signal<string>('createdAt');
  sortDirection = signal<string>('desc');
  searchTerm = signal<string>('');
  private searchSubject = new Subject<string>();
  
  allSortBy = signal<string>('createdAt');
  allSortDirection = signal<string>('desc');
  allSearchTerm = signal<string>('');
  private allSearchSubject = new Subject<string>();
  
  get isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
  
  ngOnInit(): void {
    this.setupSearchObservables();
    this.loadAddresses();
    
    if (this.isAdmin) {
      this.loadAllAddresses();
    }
  }
  
  setupSearchObservables(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.loadAddresses(0);
    });
    
    this.allSearchSubject.pipe(
      debounceTime(300)
    ).subscribe(term => {
      this.allSearchTerm.set(term);
      this.loadAllAddresses(0);
    });
  }
  
  updateSortBy(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy.set(select.value);
    this.applySort();
  }
  
  updateAllSortBy(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.allSortBy.set(select.value);
    this.applyAllSort();
  }
  
  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }
  
  updateAllSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.allSearchSubject.next(input.value);
  }
  
  loadAddresses(page = 0): void {
    this.isLoading.set(true);
    this.currentPage.set(page);
    
    const direction = this.sortBy() === 'city' ? 'asc' : 'desc';
    
    this.addressService.getAddresses(
      this.userId, 
      page, 
      this.pageSize, 
      this.sortBy(), 
      direction,
      this.searchTerm()
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.addresses.set(response.data);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.showError(
          error.error?.message || 'Falha ao carregar endereços. Por favor, tente novamente.'
        );
      }
    });
  }
  
  loadAllAddresses(page = 0): void {
    this.isLoadingAll.set(true);
    this.allAddressesPage.set(page);
    
    const direction = this.allSortBy() === 'city' ? 'asc' : 'desc';
    
    this.addressService.getAllAddresses(
      page, 
      this.pageSize, 
      this.allSortBy(), 
      direction,
      this.allSearchTerm()
    ).subscribe({
      next: (response) => {
        this.isLoadingAll.set(false);
        this.allAddresses.set(response.data);
      },
      error: (error) => {
        this.isLoadingAll.set(false);
        this.notificationService.showError(
          error.error?.message || 'Falha ao carregar todos os endereços. Por favor, tente novamente.'
        );
      }
    });
  }
  
  applySort(): void {
    this.loadAddresses(0);
  }
  
  applyAllSort(): void {
    this.loadAllAddresses(0);
  }
  
  changePage(page: number): void {
    this.loadAddresses(page);
  }
  
  changeAllAddressesPage(page: number): void {
    this.loadAllAddresses(page);
  }
  
  getPageNumbers(): number[] {
    const totalPages = this.addresses()?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  
  getAllAddressesPageNumbers(): number[] {
    const totalPages = this.allAddresses()?.totalPages || 0;
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
} 