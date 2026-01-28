import { Component, input, output, inject, effect } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroXMark,
  heroTag,
  heroPaperClip,
  heroChatBubbleLeftRight,
  heroEllipsisHorizontal,
  heroPencil,
  heroTrash,
  heroPlus,
  heroArrowLongLeft,
} from '@ng-icons/heroicons/outline';
import { FormsModule } from '@angular/forms';
import { CardModalService } from '../../../core/services/card-modal.service';
import { Label, Attachment } from '../../../core/models/kanban.model';

@Component({
  selector: 'app-card-modal',
  standalone: true,
  templateUrl: './card-modal.html',
  styleUrl: './card-modal.scss',
  imports: [NgIcon, FormsModule],
  providers: [
    provideIcons({
      heroXMark,
      heroTag,
      heroPaperClip,
      heroChatBubbleLeftRight,
      heroEllipsisHorizontal,
      heroPencil,
      heroTrash,
      heroPlus,
      heroArrowLongLeft,
    }),
  ],
})
export class CardModal {
  protected modalService = inject(CardModalService);

  columnId = input.required<string>();
  cardId = input.required<string>();
  closed = output<void>();

  constructor() {
    effect(() => {
      const columnId = this.columnId();
      const cardId = this.cardId();
      
      if (columnId && cardId) {
        this.modalService.openCard(columnId, cardId);
      }
    });
  }

  close(): void {
    this.modalService.closeCard();
    this.closed.emit();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const file = input.files[0];
    this.modalService.handleFileSelect(file);
  }

  toggleLabel(label: Label): void {
    this.modalService.toggleLabel(label);
  }

  downloadAttachment(attachment: Attachment): void {
    this.modalService.downloadAttachment(attachment);
  }
}