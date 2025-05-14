import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ToastComponent
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-left">
          <button class="menu-toggle" (click)="toggleSidebar()">
            <span class="menu-icon"></span>
          </button>
          <h1>Painel</h1>
        </div>
        <div class="user-menu">
          <span>{{ currentUser?.name }}</span>
          <button class="btn-logout" (click)="logout()">Sair</button>
        </div>
      </header>
      
      <div class="dashboard-content">
        <div class="sidebar" [class.sidebar-open]="isSidebarOpen()">
          <nav>
            <ul>
              <li>
                <a routerLink="/dashboard" 
                   routerLinkActive="active" 
                   [routerLinkActiveOptions]="{exact: true}"
                   (click)="closeSidebarOnMobile()">
                  Painel
                </a>
              </li>
              @if (isAdmin()) {
                <li>
                  <a routerLink="/dashboard/users" 
                     routerLinkActive="active"
                     (click)="closeSidebarOnMobile()">
                    Usuários
                  </a>
                </li>
              }
              <li>
                <a routerLink="/dashboard/addresses" 
                   routerLinkActive="active"
                   (click)="closeSidebarOnMobile()">
                  Endereços
                </a>
              </li>
              <li>
                <a routerLink="/dashboard/profile" 
                   routerLinkActive="active"
                   (click)="closeSidebarOnMobile()">
                  Meu Perfil
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <div class="sidebar-backdrop" 
             [class.active]="isSidebarOpen()" 
             (click)="closeSidebar()"></div>
        
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      width: 100%;
      overflow-x: hidden;
    }
    
    .dashboard-header {
      background-color: #fff;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 80;
      width: 100%;
      box-sizing: border-box;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 25px;
    }
    
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      width: 40px;
      height: 40px;
      position: relative;
      cursor: pointer;
      padding: 0;
      touch-action: manipulation;
    }
    
    .menu-icon, 
    .menu-icon:before, 
    .menu-icon:after {
      width: 80%;
      height: 3px;
      background-color: #333;
      border-radius: 2px;
      position: absolute;
      transition: all 0.3s ease;
      left: 10%;
    }
    
    .menu-icon {
      top: 50%;
      transform: translateY(-50%);
    }
    
    .menu-icon:before, 
    .menu-icon:after {
      content: '';
    }
    
    .menu-icon:before {
      top: -8px;
    }
    
    .menu-icon:after {
      top: 8px;
    }
    
    .dashboard-header h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    
    .user-menu {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .btn-logout {
      background-color: transparent;
      border: none;
      color: #4318D1;
      cursor: pointer;
      font-size: 16px;
      padding: 5px 10px;
    }
    
    .btn-logout:hover {
      text-decoration: underline;
    }
    
    .dashboard-content {
      display: flex;
      flex-grow: 1;
      position: relative;
    }
    
    .sidebar {
      width: 250px;
      background-color: #f5f5f5;
      padding: 20px 0;
      z-index: 100;
      flex-shrink: 0;
    }
    
    .sidebar-backdrop {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 90;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    .sidebar-backdrop.active {
      opacity: 1;
      visibility: visible;
    }
    
    .sidebar nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .sidebar nav li {
      margin-bottom: 5px;
    }
    
    .sidebar nav a {
      display: block;
      padding: 10px 30px;
      color: #000;
      text-decoration: none;
      transition: background-color 0.3s;
    }
    
    .sidebar nav a:hover {
      background-color: #e0e0e0;
    }
    
    .sidebar nav a.active {
      background-color: #4318D1;
      color: white;
    }
    
    .main-content {
      flex-grow: 1;
      padding: 20px;
      background-color: #f9f9f9;
      overflow-x: auto;
      width: 100%;
      box-sizing: border-box;
    }
    
    @media (max-width: 768px) {
      .menu-toggle {
        display: block;
      }
      
      .dashboard-header {
        padding: 10px 15px;
      }
      
      .dashboard-header h1 {
        font-size: 20px;
      }
      
      .sidebar {
        position: fixed;
        top: 0;
        left: -250px;
        height: 100%;
        transition: transform 0.3s ease;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
      }
      
      .sidebar-open {
        transform: translateX(250px);
      }
      
      .sidebar-backdrop {
        display: block;
      }
      
      .main-content {
        padding: 15px 10px;
      }
      
      .user-menu span {
        display: none;
      }
    }
    
    @media (max-width: 480px) {
      .header-left {
        gap: 15px;
      }
      
      .menu-toggle {
        width: 36px;
        height: 36px;
      }
      
      .dashboard-header h1 {
        font-size: 18px;
      }
      
      .main-content {
        padding: 12px 8px;
      }
      
      .btn-logout {
        padding: 6px 12px;
        font-size: 14px;
        font-weight: 500;
      }
    }
    
    ::ng-deep .table-container {
      max-width: 100%;
      overflow-x: auto;
    }
    
    ::ng-deep .search-input,
    ::ng-deep .sort-controls,
    ::ng-deep .sort-select {
      max-width: 100%;
      box-sizing: border-box;
    }
    
    ::ng-deep .btn {
      white-space: nowrap;
    }
    
    ::ng-deep .addresses-table,
    ::ng-deep .users-table {
      table-layout: auto;
      min-width: auto;
    }
    
    ::ng-deep .btn-action {
      height: 33px;
      line-height: 1;
      box-sizing: border-box;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      vertical-align: middle;
      text-align: center !important;
      margin-bottom: 8px;
    }
    
    ::ng-deep .btn-action.edit,
    ::ng-deep .btn-action.delete,
    ::ng-deep .btn-action.addresses {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      width: 95px !important;
    }
    
    @media (max-width: 350px) {
      ::ng-deep .sort-group {
        flex-direction: column;
        align-items: flex-start;
      }
      
      ::ng-deep .btn-action {
        font-size: 12px;
        padding: 5px 10px;
        height: 30px;
      }
    }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  isSidebarOpen = signal<boolean>(false);
  
  get currentUser() {
    return this.authService.currentUser();
  }
  
  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  toggleSidebar(): void {
    this.isSidebarOpen.update(state => !state);
  }
  
  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
  
  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.closeSidebar();
    }
  }
} 