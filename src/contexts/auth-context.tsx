
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { type User, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  isAllowed: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded allowed email addresses
const HARDCODED_ALLOWED_EMAILS = ['morten@gmail.com', 'sven.gausland@gmail.com'].map(email => email.toLowerCase());

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const checkUserAllowance = useCallback((currentUser: User | null) => {
    if (!currentUser || !currentUser.email) {
      setIsAllowed(false);
      return;
    }
    // Check against the hardcoded list
    setIsAllowed(HARDCODED_ALLOWED_EMAILS.includes(currentUser.email.toLowerCase()));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      checkUserAllowance(currentUser);
      setIsLoading(false);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [checkUserAllowance]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting user and allowance
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // Let onAuthStateChanged handle user state if sign-in partially failed but user is set
      // If user is not set by onAuthStateChanged, isLoading will remain true until it confirms no user
      // or it will set the user and then isLoading to false.
      // If a user is set but allowance check fails, UI will show access denied.
      // If no user, UI will show sign-in again.
      // For robustness, ensure loading is set to false if error is not auth state related.
      if (!auth.currentUser) {
         setUser(null);
         setIsAllowed(false);
         setIsLoading(false);
      }
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting user to null and allowance to false
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if sign out fails, attempt to clear state locally as a fallback
      setUser(null);
      setIsAllowed(false);
      setIsLoading(false);
    }
  };
  
  if (!authChecked && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Authenticating...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAllowed, isLoading, signInWithGoogle, signOut }}>
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
