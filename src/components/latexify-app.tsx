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
import { UploadCloud, Copy, Share2, Settings, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export default function LatexifyApp() {
  const [formulaImage, setFormulaImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [latexCode, setLatexCode] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedPrefix = localStorage.getItem('latexify-prefix');
    const storedSuffix = localStorage.getItem('latexify-suffix');
    if (storedPrefix) setPrefix(storedPrefix);
    if (storedSuffix) setSuffix(storedSuffix);
  }, []);

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
      setError(null); // Clear previous errors
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
          title: 'Error Processing Image',
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
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fullLatexCode = `${prefix}${latexCode}${suffix}`;

  const handleCopyToClipboard = async () => {
    if (!latexCode) {
      toast({ title: 'Nothing to copy', description: 'Please generate LaTeX code first.', variant: 'destructive' });
      return;
    }
    try {
      await navigator.clipboard.writeText(fullLatexCode);
      toast({ title: 'Copied to clipboard!', description: 'LaTeX code copied successfully.'});
    } catch (err) {
      toast({ title: 'Failed to copy', description: 'Could not copy to clipboard.', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    if (!latexCode) {
      toast({ title: 'Nothing to share', description: 'Please generate LaTeX code first.', variant: 'destructive' });
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LaTeX Formula Code',
          text: fullLatexCode,
        });
        toast({ title: 'Shared successfully!' });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast({ title: 'Sharing failed', description: (err as Error).message, variant: 'destructive' });
        }
      }
    } else {
      toast({ title: 'Share not supported', description: 'Your browser does not support the Web Share API.', variant: 'destructive' });
    }
  };

  const handleSaveSettings = (newPrefix: string, newSuffix: string) => {
    setPrefix(newPrefix);
    setSuffix(newSuffix);
    localStorage.setItem('latexify-prefix', newPrefix);
    localStorage.setItem('latexify-suffix', newSuffix);
    toast({ title: 'Settings Saved', description: 'Formatting preferences updated.' });
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <LatexifyLogo />
          <CardTitle className="text-3xl font-bold">Latexify</CardTitle>
        </div>
        <CardDescription>
          Snap a math formula, get LaTeX code instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="formula-upload" className="text-base">Upload Formula Image</Label>
          <Button onClick={triggerFileInput} variant="outline" className="w-full" disabled={isLoading}>
            <UploadCloud className="mr-2 h-5 w-5" />
            {imageFile ? imageFile.name : 'Select Image'}
          </Button>
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
            <p className="text-lg">Processing formula...</p>
          </div>
        )}

        {error && (
          <p className="text-destructive text-center text-sm">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="latex-output" className="text-base">Generated LaTeX Code</Label>
          <Textarea
            id="latex-output"
            value={latexCode}
            onChange={(e) => setLatexCode(e.target.value)}
            placeholder="Your LaTeX code will appear here..."
            rows={6}
            className="font-mono text-sm p-3 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            readOnly={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Button onClick={handleCopyToClipboard} disabled={isLoading || !latexCode} className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent),0.9)] text-accent-foreground">
            <Copy className="mr-2 h-5 w-5" /> Copy
          </Button>
          <Button onClick={handleShare} disabled={isLoading || !latexCode} className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent),0.9)] text-accent-foreground">
            <Share2 className="mr-2 h-5 w-5" /> Share
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="col-span-2 sm:col-span-1">
                <Settings className="mr-2 h-5 w-5" /> Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Formatting Settings</DialogTitle>
                <DialogDescription>
                  Define custom prefix and suffix for your LaTeX code. These will be saved in your browser.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prefix" className="text-right">
                    Prefix
                  </Label>
                  <Input
                    id="prefix"
                    defaultValue={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="col-span-3 font-mono"
                    placeholder="e.g. $$"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="suffix" className="text-right">
                    Suffix
                  </Label>
                  <Input
                    id="suffix"
                    defaultValue={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    className="col-span-3 font-mono"
                    placeholder="e.g. $$"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" onClick={() => handleSaveSettings(prefix, suffix)}>Save Changes</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
