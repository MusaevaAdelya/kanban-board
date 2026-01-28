import { Injectable, signal } from '@angular/core';
import {
  BoardColumn,
  KanbanCard,
  CardDropEvent,
  Label,
  Comment,
  Attachment,
} from '../models/kanban.model';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private columns = signal<BoardColumn[]>([
    {
      id: '1',
      title: 'To Do',
      color: 'bg-scarlet-rush',
      cards: [
        {
          id: '1',
          title: 'Design Notification Banner',
          description: '',
          labels: [
            { id: '1', name: 'Design', color: '#F197FF' },
            { id: '2', name: 'Research', color: '#BC98FD' },
          ],
          assignee: {
            photoURL: 'https://i.pravatar.cc/150?img=1',
            displayName: 'Alice',
          },
          commentsCount: 0,
          attachmentsCount: 0,
          comments: [],
          attachments: [],
        },
      ],
    },
    {
      id: '2',
      title: 'In Progress',
      color: 'bg-scarlet-rush',
      cards: [],
    },
    {
      id: '3',
      title: 'Done',
      color: 'bg-scarlet-rush',
      cards: [],
    },
  ]);

  private availableLabels = signal<Label[]>([
    { id: '1', name: 'Enhancement', color: '#FFD700' },
    { id: '2', name: 'Paperwork', color: '#FFA500' },
    { id: '3', name: 'Bug', color: '#FF6B6B' },
    { id: '4', name: 'Frontend', color: '#DA70D6' },
    { id: '5', name: 'Backend', color: '#9ACD32' },
  ]);

  readonly allColumns = this.columns.asReadonly();
  readonly allLabels = this.availableLabels.asReadonly();

  getCard(columnId: string, cardId: string): KanbanCard | undefined {
    const column = this.columns().find((col) => col.id === columnId);
    return column?.cards.find((card) => card.id === cardId);
  }

  updateCard(columnId: string, cardId: string, updates: Partial<KanbanCard>): void {
    const columns = this.columns();
    const columnIndex = columns.findIndex((col) => col.id === columnId);

    if (columnIndex === -1) return;

    const updatedColumns = [...columns];
    const cardIndex = updatedColumns[columnIndex].cards.findIndex((card) => card.id === cardId);

    if (cardIndex === -1) return;

    updatedColumns[columnIndex].cards[cardIndex] = {
      ...updatedColumns[columnIndex].cards[cardIndex],
      ...updates,
    };

    this.columns.set(updatedColumns);
  }

  addComment(columnId: string, cardId: string, comment: Comment): void {
    const columns = this.columns();
    const columnIndex = columns.findIndex((col) => col.id === columnId);

    if (columnIndex === -1) return;

    const updatedColumns = [...columns];
    const cardIndex = updatedColumns[columnIndex].cards.findIndex((card) => card.id === cardId);

    if (cardIndex === -1) return;

    const card = updatedColumns[columnIndex].cards[cardIndex];
    updatedColumns[columnIndex].cards[cardIndex] = {
      ...card,
      comments: [...(card.comments || []), comment],
      commentsCount: (card.commentsCount || 0) + 1,
    };

    this.columns.set(updatedColumns);
  }

  addAttachment(columnId: string, cardId: string, attachment: Attachment): void {
    const columns = this.columns();
    const columnIndex = columns.findIndex((col) => col.id === columnId);

    if (columnIndex === -1) return;

    const updatedColumns = [...columns];
    const cardIndex = updatedColumns[columnIndex].cards.findIndex((card) => card.id === cardId);

    if (cardIndex === -1) return;

    const card = updatedColumns[columnIndex].cards[cardIndex];
    updatedColumns[columnIndex].cards[cardIndex] = {
      ...card,
      attachments: [...(card.attachments || []), attachment],
      attachmentsCount: (card.attachmentsCount || 0) + 1,
    };

    this.columns.set(updatedColumns);
  }

  deleteAttachment(columnId: string, cardId: string, attachmentId: string): void {
    const columns = this.columns();
    const columnIndex = columns.findIndex((col) => col.id === columnId);

    if (columnIndex === -1) return;

    const updatedColumns = [...columns];
    const cardIndex = updatedColumns[columnIndex].cards.findIndex((card) => card.id === cardId);

    if (cardIndex === -1) return;

    const card = updatedColumns[columnIndex].cards[cardIndex];
    updatedColumns[columnIndex].cards[cardIndex] = {
      ...card,
      attachments: (card.attachments || []).filter((att) => att.id !== attachmentId),
      attachmentsCount: Math.max(0, (card.attachmentsCount || 0) - 1),
    };

    this.columns.set(updatedColumns);
  }

  addLabel(label: Omit<Label, 'id'>): void {
    const newLabel: Label = {
      ...label,
      id: `label-${Date.now()}`,
    };
    this.availableLabels.update((labels) => [...labels, newLabel]);
  }

  toggleCardLabel(columnId: string, cardId: string, label: Label): void {
    const columns = this.columns();
    const columnIndex = columns.findIndex((col) => col.id === columnId);

    if (columnIndex === -1) return;

    const updatedColumns = [...columns];
    const cardIndex = updatedColumns[columnIndex].cards.findIndex((card) => card.id === cardId);

    if (cardIndex === -1) return;

    const card = updatedColumns[columnIndex].cards[cardIndex];
    const hasLabel = card.labels.some((l) => l.id === label.id);

    updatedColumns[columnIndex].cards[cardIndex] = {
      ...card,
      labels: hasLabel ? card.labels.filter((l) => l.id !== label.id) : [...card.labels, label],
    };

    this.columns.set(updatedColumns);
  }

  addCard(columnId: string, cardTitle: string): void {
    const columns = this.columns();
    const columnIndex = columns.findIndex((col) => col.id === columnId);

    if (columnIndex === -1) return;

    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title: cardTitle,
      description: '',
      labels: [],
      commentsCount: 0,
      attachmentsCount: 0,
      comments: [],
      attachments: [],
    };

    const updatedColumns = [...columns];
    updatedColumns[columnIndex] = {
      ...updatedColumns[columnIndex],
      cards: [...updatedColumns[columnIndex].cards, newCard],
    };

    this.columns.set(updatedColumns);
  }

  addColumn(title: string): void {
    const newColumn: BoardColumn = {
      id: `column-${Date.now()}`,
      title: title || 'New Column',
      color: 'bg-scarlet-rush',
      cards: [],
    };

    this.columns.update((columns) => [...columns, newColumn]);
  }

  moveCard(event: CardDropEvent): void {
    const columns = this.columns();
    const previousColumnIndex = columns.findIndex((col) => col.id === event.previousColumnId);
    const currentColumnIndex = columns.findIndex((col) => col.id === event.currentColumnId);

    if (previousColumnIndex === -1 || currentColumnIndex === -1) return;

    const updatedColumns = [...columns];
    const [movedCard] = updatedColumns[previousColumnIndex].cards.splice(event.previousIndex, 1);
    updatedColumns[currentColumnIndex].cards.splice(event.currentIndex, 0, movedCard);

    this.columns.set(updatedColumns);
  }

  deleteColumn(columnId: string): void {
    const columns = this.columns();
    const updatedColumns = columns.filter((col) => col.id !== columnId);
    this.columns.set(updatedColumns);
  }

  deleteCard(columnId: string, cardId: string): void {
    const columns = this.columns();
    const columnIndex = columns.findIndex((col) => col.id === columnId);

    if (columnIndex === -1) return;

    const updatedColumns = [...columns];
    updatedColumns[columnIndex] = {
      ...updatedColumns[columnIndex],
      cards: updatedColumns[columnIndex].cards.filter((card) => card.id !== cardId),
    };

    this.columns.set(updatedColumns);
  }
}
