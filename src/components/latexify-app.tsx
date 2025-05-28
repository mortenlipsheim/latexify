
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { invokeFormulaToLatex } from '@/lib/actions';
import { LatexifyLogo } from '@/components/icons/latexify-logo';
import { UploadCloud, Copy, Share2, Settings, Loader2, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation, type Language } from '@/hooks/use-translation';

export default function LatexifyApp() {
  const [formulaImage, setFormulaImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [latexCode, setLatexCode] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { language: currentLanguage, setLanguage: i18nSetLanguage, t, translationsLoaded } = useTranslation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dialogPrefix, setDialogPrefix] = useState<string>(prefix);
  const [dialogSuffix, setDialogSuffix] = useState<string>(suffix);
  const [dialogLanguage, setDialogLanguage] = useState<Language>(currentLanguage);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [actionCompletedToken, setActionCompletedToken] = useState(0); // For forcing re-renders

  useEffect(() => {
    const storedPrefix = localStorage.getItem('latexify-prefix');
    const storedSuffix = localStorage.getItem('latexify-suffix');
    if (storedPrefix) {
      setPrefix(storedPrefix);
      setDialogPrefix(storedPrefix);
    }
    if (storedSuffix) {
      setSuffix(storedSuffix);
      setDialogSuffix(storedSuffix);
    }
  }, []);

  useEffect(() => {
    setDialogLanguage(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    setDialogPrefix(prefix);
  }, [prefix]);

  useEffect(() => {
    setDialogSuffix(suffix);
  }, [suffix]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormulaImage(e.target?.result as string);
        processImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null); 
    }
  };

  const processImage = async (imageDataUri: string) => {
    setIsLoading(true);
    setLatexCode('');
    try {
      const result = await invokeFormulaToLatex(imageDataUri);
      if ('error' in result) {
        setError(result.error);
        toast({
          title: t('errorProcessingImageTitle'),
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setLatexCode(result.latexCode);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        title: t('errorTitle'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fullLatexCode = `${prefix}${latexCode}${suffix}`;

  const handleLatexCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newRawValue = event.target.value;
    let coreLatex = newRawValue;

    if (prefix && coreLatex.startsWith(prefix)) {
      coreLatex = coreLatex.substring(prefix.length);
    }
    if (suffix && coreLatex.endsWith(suffix)) {
      if (coreLatex.length >= suffix.length) { 
         coreLatex = coreLatex.substring(0, coreLatex.length - suffix.length);
      }
    }
    setLatexCode(coreLatex);
  };

  const handleCopyToClipboard = async () => {
    try {
      if ((prefix + latexCode + suffix).trim() === '') {
        toast({ title: t('nothingToCopyTitle'), description: t('nothingToCopyDescription'), variant: 'destructive' });
        return;
      }
      await navigator.clipboard.writeText(fullLatexCode);
      toast({ title: t('copiedToClipboardTitle'), description: t('copiedToClipboardDescription')});
    } catch (err) {
      toast({ title: t('failedToCopyTitle'), description: t('failedToCopyDescription'), variant: 'destructive' });
    } finally {
      setActionCompletedToken(prev => prev + 1); 
    }
  };

  const handleShare = async () => {
    try {
      if ((prefix + latexCode + suffix).trim() === '') {
        toast({ title: t('nothingToShareTitle'), description: t('nothingToShareDescription'), variant: 'destructive' });
        return;
      }
      if (navigator.share) {
        await navigator.share({
          title: 'LaTeX Formula Code',
          text: fullLatexCode,
        });
        toast({ title: t('sharedSuccessfullyTitle') });
      } else {
        toast({ title: t('shareNotSupportedTitle'), description: t('shareNotSupportedDescription'), variant: 'destructive' });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast({ title: t('sharingFailedTitle'), description: (err as Error).message, variant: 'destructive' });
      }
    } finally {
      setActionCompletedToken(prev => prev + 1); 
    }
  };

  const handleSaveSettings = () => {
    const prefixChanged = dialogPrefix !== prefix;
    const suffixChanged = dialogSuffix !== suffix;
    const languageChanged = dialogLanguage !== currentLanguage;

    if (prefixChanged) {
        setPrefix(dialogPrefix);
        localStorage.setItem('latexify-prefix', dialogPrefix);
    }
    if (suffixChanged) {
        setSuffix(dialogSuffix);
        localStorage.setItem('latexify-suffix', dialogSuffix);
    }
    
    let toastDescriptionKey = "";
    if ((prefixChanged || suffixChanged) && languageChanged) {
        toastDescriptionKey = 'settingsSavedDescriptionBoth';
    } else if (prefixChanged || suffixChanged) {
        toastDescriptionKey = 'settingsSavedDescriptionFormat';
    } else if (languageChanged) {
        toastDescriptionKey = 'settingsSavedDescriptionLanguage';
    }
    
    if (languageChanged) {
      i18nSetLanguage(dialogLanguage);
    }

    if (toastDescriptionKey) {
        toast({ title: t('settingsSavedTitle'), description: t(toastDescriptionKey) });
    }
    setIsSettingsDialogOpen(false);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFormulaImage(null);
    setImageFile(null);
    setLatexCode('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({ title: t('resetToastTitle'), description: t('resetToastDescription') });
  };

  if (!translationsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">{t('loadingApp')}</p>
      </div>
    );
  }
  
  const nothingToActOn = (prefix + latexCode + suffix).trim() === '';
  // Key for re-rendering, useful for some edge cases with button visibility
  const currentActionToken = actionCompletedToken;


  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <LatexifyLogo />
          <CardTitle className="text-3xl font-bold">{t('appTitle')}</CardTitle>
        </div>
        <CardDescription>
          {t('appDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="formula-upload" className="text-base">{t('uploadLabel')}</Label>
          <div className="flex space-x-2">
            <Button onClick={triggerFileInput} variant="outline" className="w-full" disabled={isLoading}>
              <UploadCloud className="mr-2 h-5 w-5" />
              {imageFile ? imageFile.name : t('selectImageButton')}
            </Button>
             {formulaImage && (
                <Button onClick={handleReset} variant="outline" size="icon" disabled={isLoading} aria-label={t('resetButtonLabel')}>
                    <RotateCcw className="h-5 w-5" />
                </Button>
            )}
          </div>
          <Input
            id="formula-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isLoading}
          />
        </div>

        {formulaImage && (
          <div className="border rounded-md p-2 flex justify-center bg-muted/30">
            <Image
              src={formulaImage}
              alt="Formula preview"
              width={300}
              height={150}
              className="object-contain rounded-md max-h-[200px]"
              data-ai-hint="math formula"
            />
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center space-x-2 text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-lg">{t('processingFormula')}</p>
          </div>
        )}

        {error && (
          <p className="text-destructive text-center text-sm">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="latex-output" className="text-base">{t('latexOutputLabel')}</Label>
          <Textarea
            id="latex-output"
            value={fullLatexCode}
            onChange={handleLatexCodeChange}
            placeholder={t('latexPlaceholder')}
            rows={6}
            className="font-mono text-sm p-3 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            readOnly={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" key={`actions-grid-${currentActionToken}`}>
          <div> {/* Wrapper for Copy button */}
            <Button 
              onClick={handleCopyToClipboard} 
              disabled={isLoading || nothingToActOn} 
              className="w-full bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent),0.9)] text-accent-foreground"
            >
              <Copy className="mr-2 h-5 w-5" /> {t('copyButton')}
            </Button>
          </div>
          <div> {/* Wrapper for Share button */}
            <Button 
              onClick={handleShare} 
              disabled={isLoading || nothingToActOn} 
              className="w-full bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent),0.9)] text-accent-foreground"
            >
              <Share2 className="mr-2 h-5 w-5" /> {t('shareButton')}
            </Button>
          </div>
          
          <div className="col-span-2 sm:col-span-1"> {/* Wrapper for Settings dialog trigger */}
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => setIsSettingsDialogOpen(true)}>
                  <Settings className="mr-2 h-5 w-5" /> {t('settingsButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('settingsDialogTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('settingsDialogDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="prefix" className="text-right">
                      {t('prefixLabel')}
                    </Label>
                    <Input
                      id="prefix"
                      value={dialogPrefix}
                      onChange={(e) => setDialogPrefix(e.target.value)}
                      className="col-span-3 font-mono"
                      placeholder="e.g. $$"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="suffix" className="text-right">
                      {t('suffixLabel')}
                    </Label>
                    <Input
                      id="suffix"
                      value={dialogSuffix}
                      onChange={(e) => setDialogSuffix(e.target.value)}
                      className="col-span-3 font-mono"
                      placeholder="e.g. $$"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="language" className="text-right">
                      {t('languageLabel')}
                    </Label>
                    <Select value={dialogLanguage} onValueChange={(value) => setDialogLanguage(value as Language)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t('selectLanguagePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('english')}</SelectItem>
                        <SelectItem value="fr">{t('french')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSaveSettings}>{t('saveSettingsButton')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

