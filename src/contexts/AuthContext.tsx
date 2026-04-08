import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  browserLocalPersistence,
  setPersistence,
  User as FirebaseUser,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { isMobileDevice } from '../lib/utils';
import { dbService } from '../lib/dbService';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  username: string | null;
  photoURL: string | null;
  homeCountry: string | null;
  onboardingCompleted: boolean;
  tutorialCompleted?: boolean;
  createdAt?: any;
  updatedAt?: any;
  bio?: string;
  timezone?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  resetPassword: async () => {},
  changePassword: async () => {},
  deleteAccount: async () => {},
  authError: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure persistence is set to local
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error("Failed to set auth persistence:", err);
    });

    // Handle redirect result for mobile auth
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("📱 Google Redirect Login Result:", result.user.email);
        }
      } catch (error: any) {
        console.error("🔥 Google Redirect Error Details:", error);
        
        // Specific handling for "missing initial state" error
        if (error.message?.includes("missing initial state") || error.code === 'auth/internal-error') {
          console.warn("Detected missing initial state - likely an in-app browser or storage partitioning issue.");
          setAuthError("Sign-in failed: Your browser blocked the redirect state. Please try opening this in an external browser (like Safari or Chrome).");
        } else {
          setAuthError(error.message || "An error occurred during sign-in.");
        }
      }
    };

    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch or create user profile in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
            // Create base profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              username: null, // to be filled during onboarding
              photoURL: firebaseUser.photoURL,
              homeCountry: null, // to be filled during onboarding
              onboardingCompleted: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Firestore Error (Database might not be created or rules are strict):", error);
          // Don't leave them in a broken state
          await firebaseSignOut(auth);
          setUserProfile(null);
          setUser(null);
          alert("Error connecting to database. Please ensure Firestore is created in Test Mode in the Firebase Console!");
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const isMobile = isMobileDevice();
    console.log(`🚀 Initialising Google Sign In (isMobile: ${isMobile})`);

    try {
      if (isMobile) {
        // Use redirect for mobile to avoid popup blockers
        await signInWithRedirect(auth, googleProvider);
      } else {
        // Use popup for desktop for better UX
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error: any) {
      console.error("🔥 Firebase Google SignIn Full Error:", error);
      console.error("🔥 Code:", error?.code, "Message:", error?.message);
      
      // Standardize the error passed to the UI component
      if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error("Login cancelled. Please finish the sign-in popup to continue.");
      } else if (error?.code === 'auth/unauthorized-domain') {
        throw new Error("Configuration Error: This domain is not authorized in Firebase Console.");
      } else {
        throw new Error(`Google Auth Failed: ${error?.message || 'Unknown network or configuration error'}`);
      }
    } finally {
      // For mobile redirect, the page will reload, so setIsLoading(false) isn't strictly necessary here,
      // but for desktop popup it's important.
      if (!isMobile) {
        setIsLoading(false);
      }
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending reset email:", error);
      throw error;
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user || !user.email) return;
    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, oldPass);
      await reauthenticateWithCredential(user, credential);
      // Update password
      await firebaseUpdatePassword(user, newPass);
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  };

  const deleteAccount = async (password?: string) => {
    if (!user) return;
    try {
      // 1. Re-authenticate if it's an email user
      if (user.providerData[0]?.providerId === 'password' && password) {
        const credential = EmailAuthProvider.credential(user.email!, password);
        await reauthenticateWithCredential(user, credential);
      }
      
      const uid = user.uid;
      
      // 2. Leave all crews (handles ownership transfer/disband)
      const userCrews = await dbService.getUserCrews(uid);
      for (const crew of userCrews) {
        await dbService.leaveCrew(crew.id, uid);
      }
      
      // 3. Delete Firestore profile
      await deleteDoc(doc(db, 'users', uid));
      
      // 4. Delete Firebase Auth user
      await deleteUser(user);
      
      // State updates are handled by onAuthStateChanged
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      await setDoc(userRef, updatedData, { merge: true });
      
      // Update local state immediately
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data } as UserProfile);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      isLoading,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      signOut,
      updateProfile,
      resetPassword,
      changePassword,
      deleteAccount,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
