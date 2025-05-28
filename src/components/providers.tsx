
'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from '@/contexts/i18n-context';
import { Toaster } from '@/components/ui/toaster';

// This is a safe version of Providers.tsx.
// It intentionally does NOT import or use QueryClient, QueryClientProvider,
// or AuthProvider to ensure Firebase or related client libraries are not initialized
// if this file was not manually deleted or if layout.tsx was not correctly reverted.
// console.log("Safe Providers.tsx loaded: Minimal providers (I18n, Toaster) only.");

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      {children}
      <Toaster />
    </I18nProvider>
  );
}
