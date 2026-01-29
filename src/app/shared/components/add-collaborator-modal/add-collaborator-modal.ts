// shared/components/add-collaborator-modal/add-collaborator-modal.ts
import { Component, output, signal, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';
import { FormsModule } from '@angular/forms';
import { Card } from '../card/card';

@Component({
  selector: 'app-add-collaborator-modal',
  standalone: true,
  imports: [NgIcon, FormsModule, Card],
  providers: [provideIcons({ heroXMark })],
  templateUrl: './add-collaborator-modal.html',
})
export class AddCollaboratorModal {
  collaboratorEmail = signal('');
  isAdding = signal(false);

  add = output<string>();
  closed = output<void>();

  handleAdd(): void {
    const email = this.collaboratorEmail().trim();
    if (!email || this.isAdding()) return;

    this.isAdding.set(true);
    this.add.emit(email);
  }

  close(): void {
    this.closed.emit();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  resetForm(): void {
    this.collaboratorEmail.set('');
    this.isAdding.set(false);
  }
}
