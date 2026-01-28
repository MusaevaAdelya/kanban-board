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
  type: string;
  addedAt: Date;
  addedBy: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  labels: Label[];
  assignee?: {
    photoURL: string;
    displayName: string;
  };
  commentsCount: number;
  attachmentsCount: number;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface BoardColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

export interface CardDropEvent {
  previousColumnId: string;
  currentColumnId: string;
  previousIndex: number;
  currentIndex: number;
}