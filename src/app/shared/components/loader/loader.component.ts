import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="loader-container" [class.full-page]="fullPage">
      <div class="loader"></div>
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .full-page {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 1000;
    }
    
    .loader {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #4318D1;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent {
  @Input() fullPage = false;
} 