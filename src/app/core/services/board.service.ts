// core/services/board.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Board, Collaborator } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private boards = signal<Board[]>([]);
  private selectedBoardId = signal<string | null>(null);
  
  readonly allBoards = this.boards.asReadonly();
  readonly currentBoardId = this.selectedBoardId.asReadonly();
  
  readonly selectedBoard = computed(() => {
    const boardId = this.selectedBoardId();
    return this.boards().find(b => b.id === boardId);
  });

  async loadBoards(): Promise<void> {
    const user = this.authService.currentUser();
    
    if (!user) {
      this.clearBoards();
      return;
    }

    try {
      const boardsRef = collection(this.firestore, 'boards');
      
      // Query 1: Boards where user is owner
      const ownerQuery = query(
        boardsRef,
        where('ownerId', '==', user.uid)
      );

      const ownerSnapshot = await getDocs(ownerQuery);
      const loadedBoards: Board[] = [];

      ownerSnapshot.forEach(doc => {
        const data = doc.data();
        loadedBoards.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate(),
          collaborators: data['collaborators'] || [],
          collaboratorIds: data['collaboratorIds'] || []
        } as Board);
      });

      // Query 2: Boards where user is collaborator
      const collabQuery = query(
        boardsRef,
        where('collaboratorIds', 'array-contains', user.uid)
      );

      const collabSnapshot = await getDocs(collabQuery);
      collabSnapshot.forEach(doc => {
        if (!loadedBoards.some(b => b.id === doc.id)) {
          const data = doc.data();
          loadedBoards.push({
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate(),
            updatedAt: data['updatedAt']?.toDate(),
            collaborators: data['collaborators'] || [],
            collaboratorIds: data['collaboratorIds'] || []
          } as Board);
        }
      });

      this.boards.set(loadedBoards);
    } catch (error) {
      console.error('Error loading boards:', error);
      this.clearBoards();
    }
  }

  async createBoard(title: string): Promise<string | null> {
    const user = this.authService.currentUser();
    
    if (!user) {
      console.error('User must be logged in to create boards');
      return null;
    }

    const collaborators: Collaborator[] = [{
      userId: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      role: 'owner',
      addedAt: new Date()
    }];

    const newBoard: Omit<Board, 'id'> = {
      title,
      ownerId: user.uid,
      ownerEmail: user.email!,
      ownerDisplayName: user.displayName || user.email!,
      collaborators,
      collaboratorIds: [user.uid],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(this.firestore, 'boards'), {
        ...newBoard,
        createdAt: Timestamp.fromDate(newBoard.createdAt),
        updatedAt: Timestamp.fromDate(newBoard.updatedAt)
      });

      await this.loadBoards();
      this.selectBoard(docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating board:', error);
      return null;
    }
  }

  async deleteBoard(boardId: string): Promise<void> {
    const board = this.boards().find(b => b.id === boardId);
    
    if (!board) return;

    try {
      // Delete all related data
      const batch = writeBatch(this.firestore);
      
      // Delete columns
      const columnsRef = collection(this.firestore, 'columns');
      const columnsQuery = query(columnsRef, where('boardId', '==', boardId));
      const columnsSnapshot = await getDocs(columnsQuery);
      columnsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete cards
      const cardsRef = collection(this.firestore, 'cards');
      const cardsQuery = query(cardsRef, where('boardId', '==', boardId));
      const cardsSnapshot = await getDocs(cardsQuery);
      cardsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete labels
      const labelsRef = collection(this.firestore, 'labels');
      const labelsQuery = query(labelsRef, where('boardId', '==', boardId));
      const labelsSnapshot = await getDocs(labelsQuery);
      labelsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete board
      batch.delete(doc(this.firestore, 'boards', boardId));
      
      await batch.commit();
      
      // If deleted board was selected, clear selection
      if (this.selectedBoardId() === boardId) {
        this.selectedBoardId.set(null);
      }
      
      await this.loadBoards();
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  }

  async addCollaborator(boardId: string, email: string, role: 'editor' = 'editor'): Promise<void> {
    const board = this.boards().find(b => b.id === boardId);
    if (!board) return;

    // Check if user exists
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('User not found');
    }

    const userData = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;
    
    // Check if already a collaborator
    if (board.collaboratorIds.includes(userId)) {
      throw new Error('User is already a collaborator');
    }
    
    const newCollaborator: Collaborator = {
      userId,
      email,
      displayName: userData['displayName'] || undefined,
      photoURL: userData['photoURL'] || undefined,
      role,
      addedAt: new Date()
    };

    const updatedCollaborators = [...board.collaborators, newCollaborator];
    const updatedCollaboratorIds = [...board.collaboratorIds, userId];

    await updateDoc(doc(this.firestore, 'boards', boardId), {
      collaborators: updatedCollaborators,
      collaboratorIds: updatedCollaboratorIds,
      updatedAt: Timestamp.now()
    });

    await this.loadBoards();
  }

  async removeCollaborator(boardId: string, userId: string): Promise<void> {
    const board = this.boards().find(b => b.id === boardId);
    if (!board) return;

    const updatedCollaborators = board.collaborators.filter(c => c.userId !== userId);
    const updatedCollaboratorIds = board.collaboratorIds.filter(id => id !== userId);

    await updateDoc(doc(this.firestore, 'boards', boardId), {
      collaborators: updatedCollaborators,
      collaboratorIds: updatedCollaboratorIds,
      updatedAt: Timestamp.now()
    });

    await this.loadBoards();
  }

  selectBoard(boardId: string): void {
    this.selectedBoardId.set(boardId);
  }

  clearBoards(): void {
    this.boards.set([]);
    this.selectedBoardId.set(null);
  }
}