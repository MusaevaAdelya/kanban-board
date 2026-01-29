// core/models/board.model.ts
export interface Collaborator {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'owner' | 'editor';
  addedAt: Date;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  ownerEmail: string;
  ownerDisplayName?: string;
  collaborators: Collaborator[];
  collaboratorIds: string[];
  createdAt: Date;
  updatedAt: Date;
}