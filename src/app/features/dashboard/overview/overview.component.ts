import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="overview-container">
      <h2>Bem-vindo, {{ currentUser?.name }}!</h2>
      
      <div class="dashboard-cards">
        @if (isAdmin) {
          <div class="dashboard-card">
            <h3>Usuários</h3>
            <p>Gerencie todos os usuários do sistema</p>
            <div class="btn-wrapper">
              <a routerLink="/dashboard/users" class="btn-card">Ver Usuários</a>
            </div>
          </div>
        }
        
        <div class="dashboard-card">
          <h3>Perfil</h3>
          <p>Visualize e edite suas informações de perfil</p>
          <div class="btn-wrapper">
            <a routerLink="/dashboard/profile" class="btn-card">Meu Perfil</a>
          </div>
        </div>
        
        <div class="dashboard-card">
          <h3>Endereços</h3>
          <p>Gerencie seus endereços</p>
          <div class="btn-wrapper">
            <a routerLink="/dashboard/addresses" class="btn-card">Meus Endereços</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-container {
      padding: 20px 0;
    }
    
    h2 {
      font-size: 24px;
      margin-bottom: 30px;
    }
    
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .dashboard-card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .dashboard-card h3 {
      font-size: 18px;
      margin-bottom: 10px;
    }
    
    .dashboard-card p {
      color: #666;
      margin-bottom: 20px;
      flex-grow: 1;
    }
    
    .btn-wrapper {
      margin-top: auto;
    }
    
    .btn-card {
      display: inline-block;
      background-color: #4318D1;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      text-decoration: none;
      transition: background-color 0.3s;
    }
    
    .btn-card:hover {
      background-color: #3512b3;
    }
  `]
})
export class OverviewComponent {
  private authService = inject(AuthService);
  
  get currentUser() {
    return this.authService.currentUser();
  }
  
  get isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
} 