import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: Array<(user: User | null) => void> = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

  /**
   * Sign in anonymously
   */
  async signInAnonymously(): Promise<User> {
    try {
      const userCredential = await signInAnonymously(auth);
      this.currentUser = userCredential.user;
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Initialize auth (sign in anonymously if not authenticated)
   */
  async initialize(): Promise<User> {
    if (this.currentUser) {
      return this.currentUser;
    }
    return await this.signInAnonymously();
  }
}

export const authService = new AuthService();

