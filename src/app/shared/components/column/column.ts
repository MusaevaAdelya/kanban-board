import { Component, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroEllipsisHorizontal, heroXMark } from '@ng-icons/heroicons/outline';
import { KanbanCard } from '../kanban-card/kanban-card';

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
  imports: [NgIcon, KanbanCard],
  providers: [provideIcons({ heroEllipsisHorizontal, heroXMark })],
  templateUrl: './column.html'
})
export class Column {
  title = input.required<string>();
  cards = input<Card[]>([]);
  color = input<string>('bg-scarlet-rush');
  isAddingCard=signal(false);
  
  menuClicked = output<void>();
  addCardClicked = output<void>();
  cardClicked = output<string>();
}