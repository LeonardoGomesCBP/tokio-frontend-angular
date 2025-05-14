import { Directive, HostListener, ElementRef, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCepMask]',
  standalone: true
})
export class CepMaskDirective implements OnInit {
  private el = inject(ElementRef);
  private ngControl = inject(NgControl, { optional: true });

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

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    const digits = inputElement.value.replace(/\D/g, '');
    
    if (digits.length > 0 && digits.length !== 8) {
      if (this.ngControl?.control) {
        this.ngControl.control.markAsTouched();
        this.ngControl.control.setErrors({ invalidCepLength: true });
      }
    }
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
    
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(formatted, { emitEvent: false });
      
      if (digits.length === 8) {
        const currentErrors = this.ngControl.control.errors;
        if (currentErrors) {
          const { invalidCepLength, ...otherErrors } = currentErrors;
          
          if (Object.keys(otherErrors).length > 0) {
            this.ngControl.control.setErrors(otherErrors);
          } else {
            this.ngControl.control.setErrors(null);
          }
        }
      } else if (digits.length > 0) {
        this.ngControl.control.setErrors({ invalidCepLength: true });
      }
    }
  }
} 