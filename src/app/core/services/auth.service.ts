import { Injectable, inject, signal } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  user$: Observable<FirebaseUser | null>;

  constructor() {
    this.user$ = user(this.auth);
    
    // Subscribe to auth state changes
    this.user$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          this.currentUser.set(userDoc.data() as User);
        }
      } else {
        this.currentUser.set(null);
      }
    });
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
          createdAt: new Date()
        };
        await setDoc(userRef, newUser);
        this.currentUser.set(newUser);
      }
      
      this.router.navigate(['/boards']);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}