import { 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged, 
  User,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { firestoreService } from './firestore';
import { Alert } from 'react-native';

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: Array<(user: User | null) => void> = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(listener => listener(user));

      // Create/update user profile in Firestore
      if (user && !user.isAnonymous) {
        await firestoreService.createUserProfile(user.uid, {
          email: user.email || undefined,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
        });
      }
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
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile
      await firestoreService.createUserProfile(user.uid, {
        email: user.email || undefined,
        displayName: displayName || undefined,
      });

      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      this.currentUser = userCredential.user;
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  /**
   * Upgrade anonymous account to permanent account
   */
  async upgradeAnonymousAccount(email: string, password: string): Promise<User> {
    try {
      if (!this.currentUser || !this.currentUser.isAnonymous) {
        throw new Error('No anonymous user to upgrade');
      }

      const credential = EmailAuthProvider.credential(email, password);
      const userCredential = await linkWithCredential(this.currentUser, credential);
      
      await firestoreService.createUserProfile(userCredential.user.uid, {
        email: email,
      });

      this.currentUser = userCredential.user;
      return userCredential.user;
    } catch (error) {
      console.error('Error upgrading anonymous account:', error);
      throw error;
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
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
   * Check if user is anonymous
   */
  isAnonymous(): boolean {
    return this.currentUser?.isAnonymous || false;
  }

  /**
   * Check if user has permanent account
   */
  hasPermanentAccount(): boolean {
    return this.isAuthenticated() && !this.isAnonymous();
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

  /**
   * Check if user is premium
   */
  async isPremium(): Promise<boolean> {
    if (!this.currentUser || this.currentUser.isAnonymous) {
      return false;
    }
    return await firestoreService.isUserPremium(this.currentUser.uid);
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      // Note: For React Native, you'll need to use @react-native-google-signin/google-signin
      // This is a placeholder for web or will need platform-specific implementation
      Alert.alert(
        'Google Sign-In',
        'Google Sign-In requires additional setup. This will be implemented with @react-native-google-signin/google-signin package.'
      );
      throw new Error('Google Sign-In not yet implemented');
      
      // Future implementation:
      // const provider = new GoogleAuthProvider();
      // const userCredential = await signInWithPopup(auth, provider);
      // await this.handleSocialSignIn(userCredential.user);
      // return userCredential.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<User> {
    try {
      // Note: For React Native, you'll need to use expo-apple-authentication
      // This is a placeholder that will need platform-specific implementation
      Alert.alert(
        'Apple Sign-In',
        'Apple Sign-In requires additional setup. This will be implemented with expo-apple-authentication package.'
      );
      throw new Error('Apple Sign-In not yet implemented');
      
      // Future implementation:
      // const provider = new OAuthProvider('apple.com');
      // const userCredential = await signInWithPopup(auth, provider);
      // await this.handleSocialSignIn(userCredential.user);
      // return userCredential.user;
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      throw error;
    }
  }

  /**
   * Handle social sign-in (Google/Apple) user profile creation
   */
  private async handleSocialSignIn(user: User): Promise<void> {
    await firestoreService.createUserProfile(user.uid, {
      email: user.email || undefined,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();

