import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AddressService } from '../../../core/services/address.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Address, Page } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { debounceTime, Subject } from 'rxjs';

// Import new components
import { AddressTableComponent } from '../components/address-table/address-table.component';
import { AddressSearchComponent } from '../components/address-search/address-search.component';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    LoaderComponent, 
    AddressTableComponent,
    AddressSearchComponent,
    PaginationComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss']
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
  
  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }
  
  onSortChange(sortField: string): void {
    this.sortBy.set(sortField);
    this.applySort();
  }
  
  onAllSearchChange(term: string): void {
    this.allSearchSubject.next(term);
  }
  
  onAllSortChange(sortField: string): void {
    this.allSortBy.set(sortField);
    this.applyAllSort();
  }
  
  loadAddresses(page = 0): void {
    this.isLoading.set(true);
    this.currentPage.set(page);
    
    const currentUserId = this.authService.currentUser()?.id;
    
    if (!currentUserId) {
      this.isLoading.set(false);
      this.notificationService.showError('ID do usuário não encontrado');
      return;
    }
    
    this.userId = currentUserId;
    
    const direction = this.sortBy() === 'city' ? 'asc' : 'desc';
    
    console.log('Carregando endereços para userId:', this.userId);
    
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
        console.error('Erro ao carregar endereços:', error);
        this.notificationService.showError(
          error.error?.message || 
          'Falha ao carregar endereços. Por favor, tente novamente.'
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
          error.error?.message || 
          'Falha ao carregar todos os endereços. Por favor, tente novamente.'
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
  
  onConfirmDelete(address: Address): void {
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
    
    let userIdToUse = this.userId;
    
    if (this.isAdmin && address.userId && this.allAddresses()?.content?.some(a => a.id === address.id)) {
      userIdToUse = address.userId;
      console.log('Admin excluindo endereço de outro usuário:', address.id, 'userId:', userIdToUse);
    } else {
      console.log('Excluindo endereço próprio:', address.id, 'userId:', userIdToUse);
    }
    
    this.deletingId.set(address.id);
    this.showConfirmation.set(false);
    
    console.log('Deletando endereço:', address.id, 'para usuário:', userIdToUse);
    
    this.addressService.deleteAddress(userIdToUse, address.id).subscribe({
      next: (response) => {
        this.deletingId.set(null);
        this.notificationService.showSuccess(response.message);
        this.loadAddresses(this.currentPage());
        if (this.isAdmin) {
          this.loadAllAddresses(this.allAddressesPage());
        }
      },
      error: (error) => {
        this.deletingId.set(null);
        console.error('Erro ao excluir endereço:', error);
        this.notificationService.showError(
          error.error?.message || 'Falha ao excluir o endereço. Por favor, tente novamente.'
        );
      }
    });
  }
} 