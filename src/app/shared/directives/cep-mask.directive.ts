import { Directive, HostListener, ElementRef, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCepMask]',
  standalone: true
})
export class CepMaskDirective implements OnInit {
  private el = inject(ElementRef);
  private ngControl = inject(NgControl, { optional: true });
  private lastValue = '';

  ngOnInit(): void {
    const initialValue = this.el.nativeElement.value;
    if (initialValue) {
      this.formatValue(initialValue);
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    this.formatValue(inputElement.value);
  }

  private formatValue(value: string): void {
    let digits = value.replace(/\D/g, '');
    
    if (digits.length > 8) {
      digits = digits.substring(0, 8);
    }
    
    let formatted = digits;
    if (digits.length > 5) {
      formatted = `${digits.substring(0, 5)}-${digits.substring(5)}`;
    }
    
    this.el.nativeElement.value = formatted;
    
    if (this.lastValue !== digits && this.ngControl?.control) {
      this.ngControl.control.setValue(formatted, { emitEvent: false });
      this.ngControl.control.updateValueAndValidity();
      this.lastValue = digits;
    }
  }
} 