export interface Attachment {
  id: string;
  cardId: string;
  userId: string;
  fileName: string;
  fileUrl: string; // Cloudinary URL
  fileType: string;
  isTestData: boolean;
  createdAt: Date;
}