
'use client';

import LatexifyApp from '@/components/latexify-app';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, LogOut, ShieldAlert, UserCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { LatexifyLogo } from '@/components/icons/latexify-logo';


function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" className="mr-2">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.53-4.18 7.09-10.36 7.09-17.65z"></path>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
      <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
  );
}


export default function Home() {
  const { user, isAllowed, isLoading, isAuthBypassed, signInWithGoogle, signOut } = useAuth();
  const { t, translationsLoaded } = useTranslation();


  if (isLoading || !translationsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-6 text-xl text-foreground">{t('authenticating') || 'Authenticating...'}</p>
      </div>
    );
  }

  // If auth is NOT bypassed AND there's no user, show sign-in prompt.
  if (!isAuthBypassed && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <LatexifyLogo />
              <CardTitle className="text-3xl font-bold">{t('appTitle')}</CardTitle>
            </div>
            <CardDescription>{t('signInPrompt') || 'Please sign in to use Latexify.'}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <p className="text-center text-muted-foreground">{t('signInDescription') || 'Use your Google account to access the application.'}</p>
            <Button onClick={signInWithGoogle} className="w-full max-w-xs" size="lg">
              <GoogleLogo />
              {t('signInWithGoogleButton') || 'Sign in with Google'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If auth is NOT bypassed AND user exists BUT is not allowed, show access denied.
  if (!isAuthBypassed && user && !isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
           <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
             <ShieldAlert className="h-12 w-12 text-destructive" />
              <CardTitle className="text-3xl font-bold">{t('accessDeniedTitle') || 'Access Denied'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <p className="text-center text-muted-foreground">
              {t('accessDeniedMessage') || 'You are signed in as:'} <span className="font-semibold text-foreground">{user.email}</span>.
            </p>
            <p className="text-center text-destructive">
              {t('accessDeniedDescription') || 'Unfortunately, this account is not authorized to use the application. Please contact the administrator if you believe this is an error.'}
            </p>
            <Button onClick={signOut} variant="outline" className="w-full max-w-xs">
              <LogOut className="mr-2 h-5 w-5" />
              {t('signOutButton') || 'Sign Out'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If auth IS bypassed, OR if auth is NOT bypassed AND user exists AND is allowed: show the app.
  if (isAuthBypassed || (user && isAllowed)) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {/* Conditionally render user info and sign-out button only if auth is NOT bypassed and user exists */}
        {!isAuthBypassed && user && (
          <div className="w-full max-w-2xl mb-6 flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <UserCheck className="h-5 w-5 mr-2 text-green-600"/>
              {t('signedInAs') || 'Signed in as:'} <span className="font-semibold ml-1 text-foreground">{user.displayName || user.email}</span>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              {t('signOutButton') || 'Sign Out'}
            </Button>
          </div>
        )}
        <LatexifyApp />
      </div>
    );
  }
  
  // Fallback: This should ideally not be reached if the logic above is exhaustive.
  // If it is reached, it implies an unexpected state. For robustness,
  // we can show a generic loading or error, or default to the sign-in prompt
  // if Firebase is configured but something went wrong with state determination.
   return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-6 text-xl text-foreground">{t('loadingApp') || 'Loading application...'}</p>
      </div>
    );
}
