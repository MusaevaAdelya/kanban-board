import { Injectable, signal, computed, inject } from '@angular/core';
import { KanbanService } from './kanban.service';
import { AuthService } from './auth.service';
import { Label, Comment, Attachment } from "../models/kanban.model";

@Injectable({
  providedIn: 'root'
})
export class CardModalService {
  private kanbanService = inject(KanbanService);
  private authService = inject(AuthService);

  // State
  private _columnId = signal<string | null>(null);
  private _cardId = signal<string | null>(null);
  
  description = signal('');
  isEditingDescription = signal(false);
  newComment = signal('');
  showLabelPopup = signal(false);
  showCreateLabel = signal(false);
  newLabelName = signal('');
  newLabelColor = signal('#FFD700');

  // Computed
  card = computed(() => {
    const columnId = this._columnId();
    const cardId = this._cardId();
    if (!columnId || !cardId) return null;
    return this.kanbanService.getCard(columnId, cardId);
  });

  availableLabels = this.kanbanService.allLabels;
  currentUser = this.authService.currentUser;

  colors = [
    '#9ACD32', '#FFD700', '#FFA500', '#FF6B6B', '#DA70D6',
    '#2E7D32', '#F9A825', '#FF8A00', '#D32F2F', '#8E24AA',
    '#B3E5FC', '#81D4FA', '#A5D6A7', '#F8BBD0', '#E0E0E0',
    '#2196F3', '#00ACC1', '#7CB342', '#EC407A', '#757575'
  ];

  // Methods
  openCard(columnId: string, cardId: string): void {
    this._columnId.set(columnId);
    this._cardId.set(cardId);
    
    const currentCard = this.card();
    if (currentCard) {
      this.description.set(currentCard.description || '');
    }
    
    this.resetForm();
  }

  closeCard(): void {
    this._columnId.set(null);
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

  saveDescription(): void {
    const columnId = this._columnId();
    const cardId = this._cardId();
    if (!columnId || !cardId) return;

    this.kanbanService.updateCard(columnId, cardId, {
      description: this.description()
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

  addComment(): void {
    const text = this.newComment().trim();
    const columnId = this._columnId();
    const cardId = this._cardId();
    
    if (!text || !this.currentUser() || !columnId || !cardId) return;

    const user = this.currentUser()!;
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhotoURL: user.photoURL || 'https://i.pravatar.cc/150?img=0',
      text,
      createdAt: new Date()
    };

    this.kanbanService.addComment(columnId, cardId, comment);
    this.newComment.set('');
  }

  toggleLabel(label: Label): void {
    const columnId = this._columnId();
    const cardId = this._cardId();
    if (!columnId || !cardId) return;

    this.kanbanService.toggleCardLabel(columnId, cardId, label);
  }

  isLabelSelected(labelId: string): boolean {
    return this.card()?.labels.some(l => l.id === labelId) || false;
  }

  createLabel(): void {
    const name = this.newLabelName().trim();
    if (!name) return;

    this.kanbanService.addLabel({
      name,
      color: this.newLabelColor()
    });

    this.newLabelName.set('');
    this.newLabelColor.set('#FFD700');
    this.showCreateLabel.set(false);
  }

  handleFileSelect(file: File): void {
    const columnId = this._columnId();
    const cardId = this._cardId();
    
    if (!this.currentUser() || !columnId || !cardId) return;

    const attachment: Attachment = {
      id: `attachment-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      addedAt: new Date(),
      addedBy: this.currentUser()!.displayName || 'Anonymous'
    };

    this.kanbanService.addAttachment(columnId, cardId, attachment);
  }

  deleteAttachment(attachmentId: string): void {
    const columnId = this._columnId();
    const cardId = this._cardId();
    if (!columnId || !cardId) return;

    this.kanbanService.deleteAttachment(columnId, cardId, attachmentId);
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }
}