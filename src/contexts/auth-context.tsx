
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { type User, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseConfigValid } from '@/lib/firebase'; // auth can be undefined now
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthContextType {
  user: User | null;
  isAllowed: boolean;
  isLoading: boolean; // Renamed for clarity: true if actively checking auth state
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const HARDCODED_ALLOWED_EMAILS = ['morten@gmail.com', 'sven.gausland@gmail.com'].map(email => email.toLowerCase());

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  // isLoading now means "actively authenticating or checking auth state"
  // It starts true only if Firebase is configured, otherwise, we show a config error.
  const [isLoading, setIsLoading] = useState<boolean>(isFirebaseConfigValid); 
  const [authCheckCompleted, setAuthCheckCompleted] = useState<boolean>(!isFirebaseConfigValid);


  const checkUserAllowance = useCallback((currentUser: User | null) => {
    if (!currentUser || !currentUser.email) {
      setIsAllowed(false);
      return;
    }
    setIsAllowed(HARDCODED_ALLOWED_EMAILS.includes(currentUser.email.toLowerCase()));
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigValid || !auth) {
      // If Firebase isn't configured, don't attempt to use auth services.
      // isLoading was set to false initially if config is invalid (via !isFirebaseConfigValid).
      // authCheckCompleted was set to true initially.
      return;
    }

    // Firebase is configured, proceed with auth state listening.
    // setIsLoading(true); // Handled by initial state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      checkUserAllowance(currentUser);
      setIsLoading(false);
      setAuthCheckCompleted(true);
    });
    return () => unsubscribe();
  }, [checkUserAllowance]);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigValid || !auth) {
      console.error("Firebase not configured. Cannot sign in.");
      // Optionally, inform the user via a toast or state update
      alert("Firebase is not configured. Please check the console for details.");
      return;
    }
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (!auth.currentUser) {
         setUser(null);
         setIsAllowed(false);
      }
      // onAuthStateChanged will eventually set isLoading to false
    } finally {
      // To be safe, if onAuthStateChanged doesn't fire quickly or an unhandled case
      if (!auth.currentUser) setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigValid || !auth) {
      console.error("Firebase not configured. Cannot sign out.");
      alert("Firebase is not configured. Please check the console for details.");
      return;
    }
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      setUser(null);
      setIsAllowed(false);
      setIsLoading(false);
    }
    // onAuthStateChanged will set user to null and isLoading to false.
  };
  
  if (!isFirebaseConfigValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">Firebase Configuration Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-center text-muted-foreground">
              The Firebase API key (and other Firebase configuration values) appear to be missing or invalid.
              Please ensure that your <code>.env</code> file is correctly populated with your Firebase project's
              credentials.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Specifically, check variables like <code>NEXT_PUBLIC_FIREBASE_API_KEY</code>.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              You can find these values in your Firebase project settings on the
              <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="ml-1 underline text-primary hover:text-primary/80">Firebase Console</a>.
            </p>
            <p className="text-center text-xs text-muted-foreground/80 mt-2">
              After updating the <code>.env</code> file, you may need to restart your development server for the changes to take effect.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !authCheckCompleted) { // Show loading spinner ONLY if config is valid and we are actively checking auth
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
