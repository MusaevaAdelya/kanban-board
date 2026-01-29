// core/services/kanban.service.ts
import { Injectable, inject, signal, computed, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from '@angular/fire/firestore';
import {
  BoardColumn,
  KanbanCard,
  CardDropEvent,
  Label,
  Comment,
  Attachment,
} from '../models/kanban.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private injector = inject(Injector);

  private columns = signal<BoardColumn[]>([]);
  private cards = signal<KanbanCard[]>([]);
  private availableLabels = signal<Label[]>([]);
  private currentBoardId = signal<string | null>(null);
  private unsubscribe: Unsubscribe | null = null;

  readonly allColumns = this.columns.asReadonly();
  readonly allLabels = this.availableLabels.asReadonly();

  // Computed: cards grouped by column
  readonly columnsWithCards = computed(() => {
    const cols = this.columns();
    const allCards = this.cards();
    
    return cols.map(col => ({
      ...col,
      cards: allCards
        .filter(card => card.columnId === col.id)
        .sort((a, b) => a.order - b.order)
    }));
  });

  async loadBoard(boardId: string): Promise<void> {
    // Unsubscribe from previous board
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.currentBoardId.set(boardId);

    try {
      // Load columns with injection context
      const columnsRef = collection(this.firestore, 'columns');
      const columnsQuery = query(
        columnsRef,
        where('boardId', '==', boardId),
        orderBy('order', 'asc')
      );

      runInInjectionContext(this.injector, () => {
        this.unsubscribe = onSnapshot(columnsQuery, (snapshot) => {
          const loadedColumns: BoardColumn[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            loadedColumns.push({
              id: doc.id,
              ...data,
              createdAt: data['createdAt']?.toDate(),
              updatedAt: data['updatedAt']?.toDate(),
            } as BoardColumn);
          });
          this.columns.set(loadedColumns);
        });
      });

      // Load cards
      const cardsRef = collection(this.firestore, 'cards');
      const cardsQuery = query(
        cardsRef,
        where('boardId', '==', boardId),
        orderBy('order', 'asc')
      );

      runInInjectionContext(this.injector, () => {
        onSnapshot(cardsQuery, (snapshot) => {
          const loadedCards: KanbanCard[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            loadedCards.push({
              id: doc.id,
              ...data,
              createdAt: data['createdAt']?.toDate(),
              updatedAt: data['updatedAt']?.toDate(),
              comments: data['comments']?.map((c: any) => ({
                ...c,
                createdAt: c.createdAt?.toDate()
              })) || [],
              attachments: data['attachments']?.map((a: any) => ({
                ...a,
                addedAt: a.addedAt?.toDate()
              })) || []
            } as KanbanCard);
          });
          this.cards.set(loadedCards);
        });
      });

      // Load labels
      const labelsRef = collection(this.firestore, 'labels');
      const labelsQuery = query(labelsRef, where('boardId', '==', boardId));

      runInInjectionContext(this.injector, () => {
        onSnapshot(labelsQuery, (snapshot) => {
          const loadedLabels: Label[] = [];
          snapshot.forEach((doc) => {
            loadedLabels.push({ id: doc.id, ...doc.data() } as Label);
          });
          this.availableLabels.set(loadedLabels);
        });
      });
    } catch (error) {
      console.error('Error loading board:', error);
    }
  }

  async addColumn(boardId: string, title: string): Promise<void> {
    const currentColumns = this.columns();
    const maxOrder = currentColumns.length > 0 
      ? Math.max(...currentColumns.map(c => c.order)) 
      : -1;

    const newColumn: Omit<BoardColumn, 'id'> = {
      boardId,
      title: title || 'New Column',
      color: 'bg-scarlet-rush',
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await addDoc(collection(this.firestore, 'columns'), {
        ...newColumn,
        createdAt: Timestamp.fromDate(newColumn.createdAt),
        updatedAt: Timestamp.fromDate(newColumn.updatedAt),
      });
    } catch (error) {
      console.error('Error adding column:', error);
    }
  }

  async deleteColumn(columnId: string): Promise<void> {
    try {
      const batch = writeBatch(this.firestore);

      // Delete all cards in this column
      const cardsToDelete = this.cards().filter(c => c.columnId === columnId);
      cardsToDelete.forEach(card => {
        batch.delete(doc(this.firestore, 'cards', card.id));
      });

      // Delete column
      batch.delete(doc(this.firestore, 'columns', columnId));

      await batch.commit();
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  }

  async addCard(columnId: string, title: string): Promise<void> {
    const boardId = this.currentBoardId();
    if (!boardId) return;

    const columnCards = this.cards().filter(c => c.columnId === columnId);
    const maxOrder = columnCards.length > 0
      ? Math.max(...columnCards.map(c => c.order))
      : -1;

    const newCard: Omit<KanbanCard, 'id'> = {
      boardId,
      columnId,
      title,
      description: '',
      labels: [],
      order: maxOrder + 1,
      commentsCount: 0,
      attachmentsCount: 0,
      comments: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await addDoc(collection(this.firestore, 'cards'), {
        ...newCard,
        createdAt: Timestamp.fromDate(newCard.createdAt),
        updatedAt: Timestamp.fromDate(newCard.updatedAt),
      });
    } catch (error) {
      console.error('Error adding card:', error);
    }
  }

  async deleteCard(cardId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'cards', cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  }

  async moveCard(event: CardDropEvent): Promise<void> {
    const allCards = this.cards();
    const movedCard = allCards.find(
      c => c.columnId === event.previousColumnId && c.order === event.previousIndex
    );

    if (!movedCard) return;

    try {
      const batch = writeBatch(this.firestore);

      // Update moved card
      const movedCardRef = doc(this.firestore, 'cards', movedCard.id);
      batch.update(movedCardRef, {
        columnId: event.currentColumnId,
        order: event.currentIndex,
        updatedAt: Timestamp.now()
      });

      // Reorder cards in previous column
      const previousColumnCards = allCards
        .filter(c => c.columnId === event.previousColumnId && c.id !== movedCard.id)
        .sort((a, b) => a.order - b.order);

      previousColumnCards.forEach((card, index) => {
        if (card.order !== index) {
          batch.update(doc(this.firestore, 'cards', card.id), {
            order: index,
            updatedAt: Timestamp.now()
          });
        }
      });

      // Reorder cards in current column
      const currentColumnCards = allCards
        .filter(c => 
          c.columnId === event.currentColumnId && 
          c.id !== movedCard.id
        )
        .sort((a, b) => a.order - b.order);

      currentColumnCards.splice(event.currentIndex, 0, movedCard);
      currentColumnCards.forEach((card, index) => {
        if (card.order !== index) {
          batch.update(doc(this.firestore, 'cards', card.id), {
            order: index,
            updatedAt: Timestamp.now()
          });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error moving card:', error);
    }
  }

  getCard(cardId: string): KanbanCard | undefined {
    return this.cards().find(c => c.id === cardId);
  }

  async updateCard(cardId: string, updates: Partial<KanbanCard>): Promise<void> {
    try {
      await updateDoc(doc(this.firestore, 'cards', cardId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating card:', error);
    }
  }

  async addComment(cardId: string, comment: Comment): Promise<void> {
    const card = this.getCard(cardId);
    if (!card) return;

    const updatedComments = [...(card.comments || []), comment];

    try {
      await updateDoc(doc(this.firestore, 'cards', cardId), {
        comments: updatedComments.map(c => ({
          ...c,
          createdAt: Timestamp.fromDate(c.createdAt)
        })),
        commentsCount: updatedComments.length,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  async addAttachment(cardId: string, attachment: Attachment): Promise<void> {
    const card = this.getCard(cardId);
    if (!card) return;

    const updatedAttachments = [...(card.attachments || []), attachment];

    try {
      await updateDoc(doc(this.firestore, 'cards', cardId), {
        attachments: updatedAttachments.map(a => ({
          ...a,
          addedAt: Timestamp.fromDate(a.addedAt)
        })),
        attachmentsCount: updatedAttachments.length,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding attachment:', error);
    }
  }

  async deleteAttachment(cardId: string, attachmentId: string): Promise<void> {
    const card = this.getCard(cardId);
    if (!card) return;

    const updatedAttachments = (card.attachments || []).filter(a => a.id !== attachmentId);

    try {
      await updateDoc(doc(this.firestore, 'cards', cardId), {
        attachments: updatedAttachments.map(a => ({
          ...a,
          addedAt: Timestamp.fromDate(a.addedAt)
        })),
        attachmentsCount: updatedAttachments.length,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  }

  async addLabel(boardId: string, label: Omit<Label, 'id'>): Promise<void> {
    try {
      await addDoc(collection(this.firestore, 'labels'), {
        ...label,
        boardId
      });
    } catch (error) {
      console.error('Error adding label:', error);
    }
  }

  async toggleCardLabel(cardId: string, label: Label): Promise<void> {
    const card = this.getCard(cardId);
    if (!card) return;

    const hasLabel = card.labels.some(l => l.id === label.id);
    const updatedLabels = hasLabel
      ? card.labels.filter(l => l.id !== label.id)
      : [...card.labels, label];

    await this.updateCard(cardId, { labels: updatedLabels });
  }

  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.columns.set([]);
    this.cards.set([]);
    this.availableLabels.set([]);
    this.currentBoardId.set(null);
  }
}