import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'accent' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgIcon, CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  label = input<string>();
  icon = input<string>();
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  iconOnly = input<boolean>(false);
  
  clicked = output<void>();

  buttonClasses() {
    const baseClasses = 'font-bold cursor-pointer transition-all flex items-center';
    
    const variantClasses = {
      primary: 'bg-primary hover:bg-accent',
      accent: 'bg-accent hover:bg-scarlet-rush hover:text-text-white',
      danger: 'bg-scarlet-rush text-text-white hover:bg-red-600'
    };

    const sizeClasses = {
      sm: this.iconOnly() ? 'p-1 rounded-full' : 'py-2 py-2 rounded-sm text-sm',
      md: this.iconOnly() ? 'p-2 rounded-full' : 'py-3 py-3 rounded-sm text-base',
      lg: this.iconOnly() ? 'p-3 rounded-full' : 'py-4 py-4 rounded-sm text-lg'
    };

    const shadowClass = this.iconOnly() ? '' : 'shadow-[5px_5px_0_0_#000]';
    
    return `${baseClasses} ${variantClasses[this.variant()]} ${sizeClasses[this.size()]} ${shadowClass} ${
      this.disabled() ? 'opacity-50 cursor-not-allowed' : ''
    }`;
  }

  iconSize() {
    const sizes = { sm: '1rem', md: '1.5rem', lg: '2rem' };
    return sizes[this.size()];
  }
}