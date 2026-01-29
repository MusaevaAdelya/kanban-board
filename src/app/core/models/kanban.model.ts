// core/models/kanban.model.ts
export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  text: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  publicId: string; // Cloudinary public ID
  type: string;
  size: number;
  addedAt: Date;
  addedBy: string;
  addedByUserId: string;
}

export interface KanbanCard {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  labels: Label[];
  assignee?: {
    userId: string;
    photoURL: string;
    displayName: string;
  };
  order: number;
  commentsCount: number;
  attachmentsCount: number;
  comments?: Comment[];
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  title: string;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardDropEvent {
  previousColumnId: string;
  currentColumnId: string;
  previousIndex: number;
  currentIndex: number;
}