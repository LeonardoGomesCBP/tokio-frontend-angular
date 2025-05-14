import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  @Input() show = false;
  @Input() title = 'Confirmar';
  @Input() message = 'Tem certeza que deseja continuar?';
  @Input() cancelText = 'Cancelar';
  @Input() confirmText = 'Confirmar';
  @Input() confirmButtonClass = 'btn-danger';
  
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
} 