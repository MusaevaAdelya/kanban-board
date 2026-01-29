export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  order: number;
  labels: string[]; 
  createdAt: Date;
  updatedAt: Date;
}