// core/services/card-modal.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { KanbanService } from './kanban.service';
import { AuthService } from './auth.service';
import { CloudinaryService } from './cloudinary.service';
import { Label, Comment, Attachment } from '../models/kanban.model';

@Injectable({
  providedIn: 'root',
})
export class CardModalService {
  private kanbanService = inject(KanbanService);
  private authService = inject(AuthService);
  private cloudinaryService = inject(CloudinaryService);

  // State
  private _cardId = signal<string | null>(null);

  description = signal('');
  isEditingDescription = signal(false);
  newComment = signal('');
  showLabelPopup = signal(false);
  showCreateLabel = signal(false);
  newLabelName = signal('');
  newLabelColor = signal('#FFD700');
  isUploadingFile = signal(false);

  // Computed
  card = computed(() => {
    const cardId = this._cardId();
    if (!cardId) return null;
    return this.kanbanService.getCard(cardId);
  });

  availableLabels = this.kanbanService.allLabels;
  currentUser = this.authService.currentUser;

  colors = [
    '#9ACD32', '#FFD700', '#FFA500', '#FF6B6B', '#DA70D6',
    '#2E7D32', '#F9A825', '#FF8A00', '#D32F2F', '#8E24AA',
    '#B3E5FC', '#81D4FA', '#A5D6A7', '#F8BBD0', '#E0E0E0',
    '#2196F3', '#00ACC1', '#7CB342', '#EC407A', '#757575',
  ];

  // Methods
  openCard(cardId: string): void {
    this._cardId.set(cardId);

    const currentCard = this.card();
    if (currentCard) {
      this.description.set(currentCard.description || '');
    }

    this.resetForm();
  }

  closeCard(): void {
    this._cardId.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.isEditingDescription.set(false);
    this.newComment.set('');
    this.showLabelPopup.set(false);
    this.showCreateLabel.set(false);
    this.newLabelName.set('');
    this.newLabelColor.set('#FFD700');
  }

  async saveDescription(): Promise<void> {
    const cardId = this._cardId();
    if (!cardId) return;

    await this.kanbanService.updateCard(cardId, {
      description: this.description(),
    });
    this.isEditingDescription.set(false);
  }

  cancelDescription(): void {
    const currentCard = this.card();
    this.description.set(currentCard?.description || '');
    this.isEditingDescription.set(false);
  }

  startEditingDescription(): void {
    this.isEditingDescription.set(true);
  }

  async addComment(): Promise<void> {
    const text = this.newComment().trim();
    const cardId = this._cardId();

    if (!text || !cardId) return;

    const user = this.currentUser();
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      userName: user?.displayName || 'Anonymous',
      userPhotoURL: user?.photoURL || 'https://i.pravatar.cc/150?img=0',
      text,
      createdAt: new Date(),
    };

    await this.kanbanService.addComment(cardId, comment);
    this.newComment.set('');
  }

  async toggleLabel(label: Label): Promise<void> {
    const cardId = this._cardId();
    if (!cardId) return;

    await this.kanbanService.toggleCardLabel(cardId, label);
  }

  isLabelSelected(labelId: string): boolean {
    return this.card()?.labels.some((l) => l.id === labelId) || false;
  }

  async createLabel(): Promise<void> {
    const name = this.newLabelName().trim();
    const card = this.card();
    if (!name || !card) return;

    await this.kanbanService.addLabel(card.boardId, {
      name,
      color: this.newLabelColor(),
    });

    this.newLabelName.set('');
    this.newLabelColor.set('#FFD700');
    this.showCreateLabel.set(false);
  }

  async handleFileSelect(file: File): Promise<void> {
    const cardId = this._cardId();

    if (!cardId) return;

    this.isUploadingFile.set(true);

    try {
      const { url, publicId } = await this.cloudinaryService.uploadFile(file);

      const user = this.currentUser();
      const attachment: Attachment = {
        id: `attachment-${Date.now()}`,
        name: file.name,
        url,
        publicId,
        type: file.type,
        size: file.size,
        addedAt: new Date(),
        addedBy: user?.displayName || 'Anonymous',
        addedByUserId: user?.uid || 'anonymous',
      };

      await this.kanbanService.addAttachment(cardId, attachment);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      this.isUploadingFile.set(false);
    }
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    const cardId = this._cardId();
    if (!cardId) return;

    await this.kanbanService.deleteAttachment(cardId, attachmentId);
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  downloadAttachment(attachment: Attachment): void {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}