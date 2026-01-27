import { Component, output, signal } from '@angular/core';
import { heroPlus, heroXMark } from '@ng-icons/heroicons/outline';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-column-button',
  standalone: true,
  templateUrl:"./add-column-button.html",
  imports: [NgIcon, FormsModule],
  providers: [provideIcons({ heroPlus, heroXMark })]
})
export class AddColumnButton {
  clicked = output<string>();
  isAdding = signal(false);
  columnTitle = signal('');

  handleAddColumn() {
    const title = this.columnTitle().trim();
    if (title) {
      this.clicked.emit(title);
      this.columnTitle.set('');
      this.isAdding.set(false);
    }
  }

  cancelAdd() {
    this.columnTitle.set('');
    this.isAdding.set(false);
  }
}