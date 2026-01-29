// shared/components/card-modal/card-modal.ts
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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-modal',
  standalone: true,
  templateUrl: './card-modal.html',
  styleUrl: './card-modal.scss',
  imports: [NgIcon, FormsModule, CommonModule],
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

  cardId = input.required<string>();
  closed = output<void>();

  constructor() {
    effect(() => {
      const cardId = this.cardId();

      if (cardId) {
        this.modalService.openCard(cardId);
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

  async handleFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const file = input.files[0];
    await this.modalService.handleFileSelect(file);
  }

  async toggleLabel(label: Label): Promise<void> {
    await this.modalService.toggleLabel(label);
  }

  downloadAttachment(attachment: Attachment): void {
    this.modalService.downloadAttachment(attachment);
  }
}