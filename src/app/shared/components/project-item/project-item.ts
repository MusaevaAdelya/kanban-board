import { Component, input, output } from '@angular/core';
import { Card } from '../card/card';

@Component({
  selector: 'app-project-item',
  imports: [Card],
  templateUrl: './project-item.html',
  styleUrl: './project-item.scss',
})
export class ProjectItem {
  title = input.required<string>();
  isSelected = input<boolean>(false);

  projectClicked = output<void>();

  textClass() {
    return this.isSelected() ? 'text-xl font-bold' : 'text-xl';
  }
}
