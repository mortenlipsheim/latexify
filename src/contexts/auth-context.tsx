
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { type User, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseConfigValid } from '@/lib/firebase'; // auth can be undefined now

interface AuthContextType {
  user: User | null;
  isAllowed: boolean;
  isLoading: boolean;
  isAuthBypassed: boolean; // New flag
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const HARDCODED_ALLOWED_EMAILS = ['morten@gmail.com', 'sven.gausland@gmail.com'].map(email => email.toLowerCase());

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Initialize isAuthBypassed based on whether Firebase config is valid
  const [isAuthBypassed, setIsAuthBypassed] = useState<boolean>(!isFirebaseConfigValid);

  // Callback to check if a user's email is in the hardcoded list.
  // This is only relevant if Firebase is configured and auth is not bypassed.
  const isEmailAllowed = useCallback((currentUser: User | null): boolean => {
    if (!currentUser || !currentUser.email) {
      return false;
    }
    return HARDCODED_ALLOWED_EMAILS.includes(currentUser.email.toLowerCase());
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigValid) {
      // Firebase is NOT configured. Auth is effectively bypassed.
      setUser(null);         // No real user
      setIsAllowed(true);    // Grant access to app functionality
      setIsLoading(false);   // Done with any "auth" process
      setIsAuthBypassed(true); // Confirm auth is bypassed
      return; // No Firebase subscription needed
    }

    // Firebase IS configured. Auth is NOT bypassed.
    setIsAuthBypassed(false);
    // Initial isLoading state is true, onAuthStateChanged will set it to false.
    const unsubscribe = onAuthStateChanged(auth!, (currentUser) => { // auth! is safe here due to isFirebaseConfigValid check
      setUser(currentUser);
      setIsAllowed(isEmailAllowed(currentUser));
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [isEmailAllowed]); // isEmailAllowed is stable

  const signInWithGoogle = async () => {
    if (isAuthBypassed || !auth) {
      console.warn("Firebase not configured or auth is bypassed. Sign-in is disabled.");
      return;
    }
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting user, isAllowed, and isLoading
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setUser(null);
      setIsAllowed(false);
      setIsLoading(false); // Ensure loading stops on error
    }
  };

  const signOut = async () => {
    if (isAuthBypassed || !auth) {
      console.warn("Firebase not configured or auth is bypassed. Sign-out is disabled.");
      return;
    }
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will set user to null, isAllowed to false, and isLoading to false
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false); // Ensure loading stops on error
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAllowed, isLoading, isAuthBypassed, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
