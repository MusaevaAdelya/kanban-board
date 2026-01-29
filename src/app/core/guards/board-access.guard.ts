import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Board } from '../models/board.model';

export const boardAccessGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const firestore = inject(Firestore);
  const router = inject(Router);

  const boardId = route.paramMap.get('id');
  if (!boardId) {
    router.navigate(['/boards']);
    return false;
  }

  try {
    const boardDoc = await getDoc(doc(firestore, 'boards', boardId));
    
    if (!boardDoc.exists()) {
      router.navigate(['/boards']);
      return false;
    }

    const board = boardDoc.data() as Board;
    const currentUser = authService.currentUser();

    if (!currentUser) {
      router.navigate(['/auth/login']);
      return false;
    }

    const hasAccess = board.ownerId === currentUser.uid || 
                      board.collaborators.some(c => c.userId === currentUser.uid);

    if (!hasAccess) {
      router.navigate(['/boards']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking board access:', error);
    router.navigate(['/boards']);
    return false;
  }
};