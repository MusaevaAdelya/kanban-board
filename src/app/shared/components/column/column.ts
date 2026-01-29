// shared/components/column/column.ts
import { Component, input, output, signal, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroEllipsisHorizontal, heroXMark } from '@ng-icons/heroicons/outline';
import { KanbanCard } from '../kanban-card/kanban-card';
import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { KanbanService } from '../../../core/services/kanban.service';

interface Card {
  id: string;
  title: string;
  labels: Label[];
  assignee?: {
    photoURL: string;
    displayName: string;
  };
  commentsCount: number;
  attachmentsCount: number;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [NgIcon, KanbanCard, CdkDropList, CdkDrag, FormsModule],
  providers: [provideIcons({ heroEllipsisHorizontal, heroXMark })],
  templateUrl: './column.html',
})
export class Column {
  columnId = input.required<string>();
  title = input.required<string>();
  cards = input<Card[]>([]);
  color = input<string>('bg-scarlet-rush');
  isAddingCard = signal(false);
  newCardTitle = signal('');

  menuClicked = output<string>();
  addCard = output<string>();
  cardClicked = output<string>();
  cardDropped = output<{
    previousColumnId: string;
    currentColumnId: string;
    previousIndex: number;
    currentIndex: number;
  }>();

  private kanbanService = inject(KanbanService);

  onDrop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      // Перемещение внутри одной колонки
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Emit event to save to Firestore
      this.cardDropped.emit({
        previousColumnId: event.previousContainer.id,
        currentColumnId: event.container.id,
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
      });
    } else {
      // Перемещение между колонками
      this.cardDropped.emit({
        previousColumnId: event.previousContainer.id,
        currentColumnId: event.container.id,
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
      });
    }
  }

  async handleAddCard() {
    const title = this.newCardTitle().trim();
    if (title) {
      this.addCard.emit(title);
      this.newCardTitle.set('');
      this.isAddingCard.set(false);
    }
  }

  cancelAddCard() {
    this.newCardTitle.set('');
    this.isAddingCard.set(false);
  }

  async handleDeleteCard(cardId: string) {
    await this.kanbanService.deleteCard(cardId);
  }
}