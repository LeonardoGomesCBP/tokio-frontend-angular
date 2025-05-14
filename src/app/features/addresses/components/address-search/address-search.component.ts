import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-address-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-search.component.html',
  styleUrls: ['./address-search.component.scss']
})
export class AddressSearchComponent {
  @Input() searchTerm = '';
  @Input() sortBy = 'createdAt';
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();
  
  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
  }
  
  updateSort(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortChange.emit(select.value);
  }
} 