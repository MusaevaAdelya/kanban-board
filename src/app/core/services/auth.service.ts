// core/services/auth.service.ts
import { Injectable, inject, signal, Injector, runInInjectionContext } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  currentUser = signal<User | null>(null);
  user$: Observable<FirebaseUser | null>;
  
  // Callback для выполнения после успешного логина
  private onLoginCallback: (() => Promise<void>) | null = null;

  constructor() {
    this.user$ = user(this.auth);

    // Subscribe to auth state changes with proper injection context
    this.user$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        await runInInjectionContext(this.injector, async () => {
          const userDoc = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            this.currentUser.set({
              ...data,
              createdAt: data['createdAt']?.toDate(),
            } as User);
          }
        });
      } else {
        this.currentUser.set(null);
      }
    });
  }

  setOnLoginCallback(callback: () => Promise<void>): void {
    this.onLoginCallback = callback;
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      // Create/update user document in Firestore
      const userRef = doc(this.firestore, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const newUser: User = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date(),
        };
        await setDoc(userRef, {
          ...newUser,
          createdAt: new Date(),
        });
        this.currentUser.set(newUser);
      }

      // Выполняем callback после успешного логина
      if (this.onLoginCallback) {
        await this.onLoginCallback();
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}