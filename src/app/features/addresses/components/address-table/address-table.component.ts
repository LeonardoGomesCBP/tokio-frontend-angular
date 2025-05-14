import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Address } from '../../../../core/models/user.model';

@Component({
  selector: 'app-address-table',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './address-table.component.html',
  styleUrls: ['./address-table.component.scss']
})
export class AddressTableComponent {
  @Input() addresses: Address[] = [];
  @Input() deletingId: number | null = null;
  @Input() showUserId = false;
  @Input() isAdminView = false;
  
  @Output() deleteAddress = new EventEmitter<Address>();
} 