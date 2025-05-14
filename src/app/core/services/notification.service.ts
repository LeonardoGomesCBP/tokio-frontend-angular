import { Injectable, inject, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastIdCounter = 0;
  toasts = signal<Toast[]>([]);
  
  showSuccess(message: string): void {
    this.addToast({
      id: this.getNextId(),
      message,
      type: 'success'
    });
    
    setTimeout(() => {
      this.removeToast(this.toasts().find(t => t.message === message)?.id || 0);
    }, 5000);
  }
  
  showError(message: string): void {
    this.addToast({
      id: this.getNextId(),
      message,
      type: 'error'
    });
  }
  
  removeToast(id: number): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }
  
  private addToast(toast: Toast): void {
    this.toasts.update(toasts => [...toasts, toast]);
    
    setTimeout(() => {
      this.removeToast(toast.id);
    }, 5000);
  }
  
  private getNextId(): number {
    return ++this.toastIdCounter;
  }
} 