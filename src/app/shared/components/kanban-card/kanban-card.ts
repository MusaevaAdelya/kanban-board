import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroUser, heroChatBubbleLeftRight, heroPaperClip } from '@ng-icons/heroicons/outline';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Assignee {
  photoURL: string;
  displayName: string;
}

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ heroUser, heroChatBubbleLeftRight, heroPaperClip })],
  templateUrl: './kanban-card.html'
})
export class KanbanCard {
  title = input.required<string>();
  labels = input<Label[]>([]);
  assignee = input<Assignee>();
  commentsCount = input<number>(0);
  attachmentsCount = input<number>(0);
  
  clicked = output<void>();
}