import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  variant = input<'default' | 'selected'>('default');
  clickable = input<boolean>(false);
  padding = input<string>('px-5 py-4');
  
  clicked = output<void>();

  cardClasses() {
    const baseClasses = `rounded-sm shadow-[5px_5px_0_0_#000] border-secondary border-2 transition-all ${this.padding()}`;
    const variantClasses = {
      default: 'bg-primary',
      selected: 'bg-scarlet-rush text-text-white'
    };
    const clickableClass = this.clickable() ? 'cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_#000]' : '';
    
    return `${baseClasses} ${variantClasses[this.variant()]} ${clickableClass}`;
  }

  handleClick() {
    if (this.clickable()) {
      this.clicked.emit();
    }
  }
}