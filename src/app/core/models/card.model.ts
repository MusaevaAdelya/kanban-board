export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  order: number;
  labels: string[]; // label IDs
  isTestData: boolean;
  createdAt: Date;
  updatedAt: Date;
}