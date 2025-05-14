import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Page, User } from '../../../core/models/user.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, DatePipe, FormsModule],
  template: `
    <div class="users-container">
      <div class="users-header">
        <h2>Usuários</h2>
        <a routerLink="/dashboard/users/new" class="btn btn-primary">Novo Usuário</a>
      </div>

      <div class="search-and-sort">
        <div class="search-container">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Buscar por nome ou email" 
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
              <option value="name">Nome</option>
              <option value="email">Email</option>
              <option value="createdAt">Data de criação</option>
            </select>
          </div>
        </div>
      </div>
      
      @if (isLoading()) {
        <app-loader></app-loader>
      } @else if (users()?.content?.length) {
        <div class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users()?.content || []; track user.id) {
                <tr>
                  <td>{{ user.id }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="actions-cell">
                    <a [routerLink]="['/dashboard/users', user.id, 'edit']" 
                       class="btn-action edit">
                      Editar
                    </a>
                    <a [routerLink]="['/dashboard/users', user.id, 'addresses']" 
                       class="btn-action addresses">
                      Endereços
                    </a>
                    <button 
                      class="btn-action delete"
                      (click)="confirmDelete(user)"
                      [disabled]="deletingId() === user.id"
                    >
                      @if (deletingId() === user.id) {
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
          
          @if ((users()?.totalPages ?? 0) > 1) {
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
                [disabled]="currentPage() === (users()?.totalPages ?? 0) - 1"
                (click)="changePage(currentPage() + 1)"
              >
                Próximo
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="no-users">
          <p>Nenhum usuário encontrado. Crie um novo usuário para começar.</p>
          <a routerLink="/dashboard/users/new" class="btn btn-primary">Novo Usuário</a>
        </div>
      }
      
      @if (showConfirmation()) {
        <div class="modal-overlay">
          <div class="modal-content">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o usuário "{{ userToDelete()?.name }}"?</p>
            <div class="modal-actions">
              <button 
                class="btn btn-secondary"
                (click)="cancelDelete()"
              >
                Cancelar
              </button>
              <button 
                class="btn btn-danger"
                (click)="deleteUser()"
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
    .users-container {
      padding-bottom: 30px;
      padding-left: 15px;
      padding-right: 15px;
    }
    
    .users-header {
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
    
    .users-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 650px;
    }
    
    .users-table th,
    .users-table td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .users-table th {
      background-color: #f8f9fa;
      font-weight: 700;
    }
    
    .actions-cell {
      min-width: 300px;
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
    
    .btn-action.addresses {
      color: white;
      background-color: #2196F3;
    }
    
    .btn-action.addresses:hover {
      background-color: #0d8bf2;
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
    
    .no-users {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .no-users p {
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
    
    @media (max-width: 768px) {
      .users-header {
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
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  
  users = signal<Page<User> | null>(null);
  isLoading = signal<boolean>(true);
  showConfirmation = signal<boolean>(false);
  userToDelete = signal<User | null>(null);
  deletingId = signal<number | null>(null);
  currentPage = signal<number>(0);
  pageSize = 10;
  
  sortBy = signal<string>('name');
  searchTerm = signal<string>('');
  private searchSubject = new Subject<string>();
  
  ngOnInit(): void {
    this.setupSearchObservables();
    this.loadUsers();
  }
  
  setupSearchObservables(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.loadUsers(0);
    });
  }
  
  updateSortBy(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy.set(select.value);
    this.loadUsers(0);
  }
  
  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }
  
  loadUsers(page = 0): void {
    this.isLoading.set(true);
    this.currentPage.set(page);
    
    const direction = this.sortBy() === 'createdAt' ? 'desc' : 'asc';
    
    this.userService.getUsers(
      page, 
      this.pageSize, 
      this.sortBy(), 
      direction,
      this.searchTerm()
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.users.set(response.data);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.showError(
          error.error?.message || 'Failed to load users. Please try again.'
        );
      }
    });
  }
  
  changePage(page: number): void {
    this.loadUsers(page);
  }
  
  getPageNumbers(): number[] {
    const totalPages = this.users()?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  
  confirmDelete(user: User): void {
    this.userToDelete.set(user);
    this.showConfirmation.set(true);
  }
  
  cancelDelete(): void {
    this.userToDelete.set(null);
    this.showConfirmation.set(false);
  }
  
  deleteUser(): void {
    const user = this.userToDelete();
    if (!user?.id) {
      return;
    }
    
    this.deletingId.set(user.id);
    this.showConfirmation.set(false);
    
    this.userService.deleteUser(user.id).subscribe({
      next: (response) => {
        this.deletingId.set(null);
        this.notificationService.showSuccess(response.message);
        this.loadUsers(this.currentPage());
      },
      error: (error) => {
        this.deletingId.set(null);
        this.notificationService.showError(
          error.error?.message || 'Failed to delete user. Please try again.'
        );
      }
    });
  }
} 