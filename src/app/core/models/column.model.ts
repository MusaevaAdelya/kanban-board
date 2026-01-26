export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  isTestData: boolean;
  createdAt: Date;
}