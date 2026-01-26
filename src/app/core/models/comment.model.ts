export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  text: string;
  isTestData: boolean;
  createdAt: Date;
}