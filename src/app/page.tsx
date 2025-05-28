'use client';

import LatexifyApp from '@/components/latexify-app';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { t, translationsLoaded } = useTranslation();

  if (!translationsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-6 text-xl text-foreground">{t('loadingApp') || 'Loading application...'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <LatexifyApp />
    </div>
  );
}
