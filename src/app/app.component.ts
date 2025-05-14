import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  standalone: true,
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `,
  styles: []
})
export class AppComponent {
  title = 'tokio-frontend';
}
