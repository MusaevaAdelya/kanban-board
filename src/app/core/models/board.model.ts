export interface Collaborator {
  userId: string;
  email: string;
  role: 'owner' | 'editor';
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  collaborators: Collaborator[];
  isTestData: boolean;
  createdAt: Date;
  updatedAt: Date;
}