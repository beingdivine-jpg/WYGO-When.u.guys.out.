import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  username: string | null;
  photoURL: string | null;
  homeCountry: string | null;
  onboardingCompleted: boolean;
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
  changePassword: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    try {
      await signInWithPopup(auth, googleProvider);
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
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
