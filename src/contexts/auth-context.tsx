
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

// This is a placeholder/safe AuthContext to prevent errors if the file was not manually deleted.
// It forces authentication to be bypassed.

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null; // Added for completeness, though not used in bypass
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAllowed: boolean;
  isAdmin: boolean;
  isAuthBypassed: boolean;
  isFirebaseEffectivelyConfigured: boolean; // New flag
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // console.log("Safe AuthProvider loaded: All authentication is bypassed.");
  return (
    <AuthContext.Provider
      value={{
        user: null,
        isLoading: false,
        isAllowed: true, // Assume allowed if auth is bypassed
        isAdmin: false,  // Assume not admin if auth is bypassed
        isAuthBypassed: true,
        isFirebaseEffectivelyConfigured: false, // Explicitly false
        signInWithGoogle: async () => { console.warn("Auth bypassed: signInWithGoogle call ignored."); },
        signOut: async () => { console.warn("Auth bypassed: signOut call ignored."); },
        authError: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This case should ideally not be hit if AuthProvider wraps the app.
    // console.warn("useAuth called outside of an AuthProvider, returning default bypassed state.");
    return {
      user: null,
      isLoading: false,
      isAllowed: true,
      isAdmin: false,
      isAuthBypassed: true,
      isFirebaseEffectivelyConfigured: false,
      signInWithGoogle: async () => { console.warn("Auth bypassed (fallback): signInWithGoogle call ignored."); },
      signOut: async () => { console.warn("Auth bypassed (fallback): signOut call ignored."); },
      authError: 'useAuth used outside AuthProvider',
    };
  }
  return context;
};
