import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService, Toast } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div 
          class="toast-item" 
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
        >
          <div class="toast-message">{{ toast.message }}</div>
          <button 
            class="toast-close"
            (click)="notificationService.removeToast(toast.id)"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 350px;
    }
    
    .toast-item {
      padding: 15px 20px;
      border-radius: 4px;
      margin-bottom: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideIn 0.3s ease-out;
    }
    
    .toast-success {
      background-color: #4CAF50;
      color: white;
    }
    
    .toast-error {
      background-color: #F44336;
      color: white;
    }
    
    .toast-message {
      flex-grow: 1;
      margin-right: 10px;
    }
    
    .toast-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.7;
    }
    
    .toast-close:hover {
      opacity: 1;
    }
    
    @keyframes slideIn {
      from {
        transform: translateY(-30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
} 