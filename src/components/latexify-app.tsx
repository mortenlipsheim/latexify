
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { invokeFormulaToLatex } from '@/lib/actions';
import { LatexifyLogo } from '@/components/icons/latexify-logo';
import { UploadCloud, Copy, Share2, Settings, Loader2, RotateCcw, Camera, Crop, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation, type Language } from '@/hooks/use-translation';

import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper function to get cropped image data
function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  previewCanvas: HTMLCanvasElement,
  targetWidth: number = pixelCrop.width, // optional: specify target width for output
  targetHeight: number = pixelCrop.height // optional: specify target height for output
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = document.createElement('img');
    image.src = imageSrc;
    image.onload = () => {
      const canvas = previewCanvas;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }
      
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      ctx.drawImage(
        image,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        targetWidth,
        targetHeight
      );
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = (error) => reject(error);
  });
}


export default function LatexifyApp() {
  const [formulaImage, setFormulaImage] = useState<string | null>(null); // Final image for preview & processing
  const [latexCode, setLatexCode] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { language: currentLanguage, setLanguage: i18nSetLanguage, t, translationsLoaded } = useTranslation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cropPreviewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgCropRef = useRef<HTMLImageElement>(null);

  // Dialog states
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isSourceSelectOpen, setIsSourceSelectOpen] = useState(false);
  const [isCameraViewOpen, setIsCameraViewOpen] = useState(false);
  const [isCropViewOpen, setIsCropViewOpen] = useState(false);

  // Camera states
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Cropping states
  const [imageForCropping, setImageForCropping] = useState<string | null>(null); // Raw image before crop
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropAspect, setCropAspect] = useState<number | undefined>(undefined); // undefined for free crop

  const [dialogPrefix, setDialogPrefix] = useState<string>(prefix);
  const [dialogSuffix, setDialogSuffix] = useState<string>(suffix);
  const [dialogLanguage, setDialogLanguage] = useState<Language>(currentLanguage);
  const [actionCompletedToken, setActionCompletedToken] = useState(0); 

  useEffect(() => {
    const storedPrefix = localStorage.getItem('latexify-prefix');
    const storedSuffix = localStorage.getItem('latexify-suffix');
    if (storedPrefix) { setPrefix(storedPrefix); setDialogPrefix(storedPrefix); }
    if (storedSuffix) { setSuffix(storedSuffix); setDialogSuffix(storedSuffix); }
  }, []);

  useEffect(() => { setDialogLanguage(currentLanguage); }, [currentLanguage]);
  useEffect(() => { setDialogPrefix(prefix); }, [prefix]);
  useEffect(() => { setDialogSuffix(suffix); }, [suffix]);

  // Effect to open crop dialog when an image is ready for cropping
  useEffect(() => {
    if (imageForCropping) {
      setIsCropViewOpen(true);
    }
  }, [imageForCropping]);

  // Effect to handle camera stream
  useEffect(() => {
    if (isCameraViewOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setHasCameraPermission(true);
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: t('cameraAccessDeniedTitle') || 'Camera Access Denied',
            description: t('cameraAccessDeniedDescription') || 'Please enable camera permissions in your browser settings.',
          });
          setIsCameraViewOpen(false); // Close camera view if permission denied
        }
      };
      getCameraPermission();
    } else {
      // Cleanup camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        if(videoRef.current) videoRef.current.srcObject = null;
      }
    }
    return () => { // Cleanup on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraViewOpen]); // Toast and t are stable


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageForCropping(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null); 
      setIsSourceSelectOpen(false); // Close source select dialog
    }
    // Reset file input value so same file can be selected again
    if (event.target) event.target.value = '';
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && cameraStream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setImageForCropping(dataUrl);
      }
      setIsCameraViewOpen(false); // Close camera view after capture
    }
  };

  const processImageAndSetState = async (imageDataUri: string) => {
    setIsLoading(true);
    setLatexCode('');
    setFormulaImage(imageDataUri); // Set preview for the image being processed
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

  const handleConfirmCrop = async () => {
    if (completedCrop && imageForCropping && cropPreviewCanvasRef.current && imgCropRef.current) {
       try {
        const croppedImageDataURL = await getCroppedImg(
          imageForCropping,
          completedCrop,
          cropPreviewCanvasRef.current,
          imgCropRef.current.naturalWidth * (completedCrop.width/100), // Example target width, adjust as needed
          imgCropRef.current.naturalHeight * (completedCrop.height/100)  // Example target height
        );
        await processImageAndSetState(croppedImageDataURL);
      } catch (e) {
        console.error("Cropping failed", e);
        toast({ title: t('cropFailedTitle') || "Cropping Failed", description: (e as Error).message, variant: "destructive" });
        // Fallback to original if crop fails? Or just show error? For now, just error.
      }
    }
    setIsCropViewOpen(false);
    setImageForCropping(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleUseOriginal = async () => {
    if (imageForCropping) {
      await processImageAndSetState(imageForCropping);
    }
    setIsCropViewOpen(false);
    setImageForCropping(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth < 1 || naturalHeight < 1) {
        // Prevent issues if image data is invalid
        return;
    }

    // Default crop to center 50%
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 50, // Initial crop width percentage
        },
        cropAspect || naturalWidth / naturalHeight, // Use aspect or natural aspect
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    );
    setCrop(newCrop);
  }


  const fullLatexCode = `${prefix}${latexCode}${suffix}`;

  const handleLatexCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newRawValue = event.target.value;
    let coreLatex = newRawValue;
    if (prefix && coreLatex.startsWith(prefix)) { coreLatex = coreLatex.substring(prefix.length); }
    if (suffix && coreLatex.endsWith(suffix)) { if (coreLatex.length >= suffix.length) {  coreLatex = coreLatex.substring(0, coreLatex.length - suffix.length); } }
    setLatexCode(coreLatex);
  };

  const handleCopyToClipboard = async () => {
    try {
      if (fullLatexCode.trim() === '') { toast({ title: t('nothingToCopyTitle'), description: t('nothingToCopyDescription'), variant: 'destructive' }); return; }
      await navigator.clipboard.writeText(fullLatexCode);
      toast({ title: t('copiedToClipboardTitle'), description: t('copiedToClipboardDescription')});
    } catch (err) {
      toast({ title: t('failedToCopyTitle'), description: t('failedToCopyDescription'), variant: 'destructive' });
    } finally { setActionCompletedToken(prev => prev + 1); }
  };

  const handleShare = async () => {
    try {
      if (fullLatexCode.trim() === '') { toast({ title: t('nothingToShareTitle'), description: t('nothingToShareDescription'), variant: 'destructive' }); return; }
      if (navigator.share) {
        await navigator.share({ title: 'LaTeX Formula Code', text: fullLatexCode });
        toast({ title: t('sharedSuccessfullyTitle') });
      } else {
        toast({ title: t('shareNotSupportedTitle'), description: t('shareNotSupportedDescription'), variant: 'destructive' });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') { toast({ title: t('sharingFailedTitle'), description: (err as Error).message, variant: 'destructive' }); }
    } finally { setActionCompletedToken(prev => prev + 1); }
  };

  const handleSaveSettings = () => {
    const prefixChanged = dialogPrefix !== prefix;
    const suffixChanged = dialogSuffix !== suffix;
    const languageChanged = dialogLanguage !== currentLanguage;
    if (prefixChanged) { setPrefix(dialogPrefix); localStorage.setItem('latexify-prefix', dialogPrefix); }
    if (suffixChanged) { setSuffix(dialogSuffix); localStorage.setItem('latexify-suffix', dialogSuffix); }
    let toastDescriptionKey = "";
    if ((prefixChanged || suffixChanged) && languageChanged) { toastDescriptionKey = 'settingsSavedDescriptionBoth'; }
    else if (prefixChanged || suffixChanged) { toastDescriptionKey = 'settingsSavedDescriptionFormat'; }
    else if (languageChanged) { toastDescriptionKey = 'settingsSavedDescriptionLanguage'; }
    if (languageChanged) { i18nSetLanguage(dialogLanguage); }
    if (toastDescriptionKey) { toast({ title: t('settingsSavedTitle'), description: t(toastDescriptionKey) }); }
    setIsSettingsDialogOpen(false);
  };
  
  const handleReset = () => {
    setFormulaImage(null);
    setLatexCode('');
    setError(null);
    setImageForCropping(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsCameraViewOpen(false); // Also close camera if it was open
    setIsCropViewOpen(false);
    if (fileInputRef.current) { fileInputRef.current.value = ''; }
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
  
  const nothingToActOn = fullLatexCode.trim() === '';
  const currentActionToken = actionCompletedToken;


  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <LatexifyLogo />
          <CardTitle className="text-3xl font-bold">{t('appTitle')}</CardTitle>
        </div>
        <CardDescription>{t('appDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hidden canvas for crop utility */}
        <canvas ref={cropPreviewCanvasRef} style={{ display: 'none' }} />

        {/* Source Selection Dialog Trigger */}
        <div className="space-y-2">
            <Label htmlFor="formula-upload-button" className="text-base">{t('uploadLabel')}</Label>
            <div className="flex space-x-2">
                <Button 
                    id="formula-upload-button"
                    onClick={() => setIsSourceSelectOpen(true)} 
                    variant="outline" 
                    className="w-full" 
                    disabled={isLoading}
                >
                    <UploadCloud className="mr-2 h-5 w-5" />
                    {formulaImage ? t('changeImageButton') : t('selectImageButton')}
                </Button>
                {formulaImage && (
                    <Button onClick={handleReset} variant="outline" size="icon" disabled={isLoading} aria-label={t('resetButtonLabel')}>
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
        <Input
            id="formula-upload-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
        />

        {/* Source Selection Dialog */}
        <Dialog open={isSourceSelectOpen} onOpenChange={setIsSourceSelectOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('selectImageSourceTitle') || "Select Image Source"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                        <UploadCloud className="mr-2 h-5 w-5" />
                        {t('uploadFromGalleryButton') || "Upload from Gallery"}
                    </Button>
                    <Button variant="outline" onClick={() => { setIsSourceSelectOpen(false); setIsCameraViewOpen(true);}} disabled={isLoading}>
                        <Camera className="mr-2 h-5 w-5" />
                        {t('takePhotoButton') || "Take Photo"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Camera View Dialog */}
        <Dialog open={isCameraViewOpen} onOpenChange={setIsCameraViewOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('cameraViewTitle') || "Camera View"}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {hasCameraPermission === false && (
                        <Alert variant="destructive">
                            <AlertTitle>{t('cameraAccessDeniedTitle') || "Camera Access Required"}</AlertTitle>
                            <AlertDescription>{t('cameraAccessDeniedDescription') || "Please allow camera access to use this feature."}</AlertDescription>
                        </Alert>
                    )}
                    {hasCameraPermission && <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay playsInline muted />}
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={() => setIsCameraViewOpen(false)} disabled={isLoading}>
                        <X className="mr-2 h-4 w-4" />{t('cancelButton') || "Cancel"}
                    </Button>
                    <Button onClick={handleCapturePhoto} disabled={isLoading || !hasCameraPermission || !cameraStream}>
                        <Camera className="mr-2 h-5 w-5" />{t('captureButton') || "Capture"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Crop View Dialog */}
        <Dialog open={isCropViewOpen} onOpenChange={setIsCropViewOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('cropImageTitle') || "Crop Image"}</DialogTitle>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-auto flex justify-center">
                    {imageForCropping && (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={cropAspect}
                            minWidth={50}
                            minHeight={50}
                            ruleOfThirds
                        >
                            <img 
                              ref={imgCropRef}
                              alt="Crop me" 
                              src={imageForCropping} 
                              onLoad={onImageLoad}
                              style={{ maxHeight: '50vh', objectFit: 'contain' }}
                            />
                        </ReactCrop>
                    )}
                </div>
                <DialogFooter className="sm:justify-between">
                     <Button variant="outline" onClick={() => {setIsCropViewOpen(false); setImageForCropping(null);}} disabled={isLoading}>
                        <X className="mr-2 h-4 w-4" />{t('cancelCropButton') || "Cancel"}
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleUseOriginal} disabled={isLoading || !imageForCropping}>
                           {t('useOriginalButton') || "Use Original"}
                        </Button>
                        <Button onClick={handleConfirmCrop} disabled={isLoading || !completedCrop || !imageForCropping}>
                            <Crop className="mr-2 h-5 w-5" />{t('confirmCropButton') || "Confirm Crop"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        {formulaImage && (
          <div className="border rounded-md p-2 flex justify-center bg-muted/30">
            <Image
              src={formulaImage}
              alt={t('formulaPreviewAlt') || "Formula preview"}
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

        {error && ( <p className="text-destructive text-center text-sm">{error}</p> )}

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
          <div>
            <Button onClick={handleCopyToClipboard} disabled={isLoading || nothingToActOn} className="w-full bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent),0.9)] text-accent-foreground">
              <Copy className="mr-2 h-5 w-5" /> {t('copyButton')}
            </Button>
          </div>
          <div>
            <Button onClick={handleShare} disabled={isLoading || nothingToActOn} className="w-full bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent),0.9)] text-accent-foreground">
              <Share2 className="mr-2 h-5 w-5" /> {t('shareButton')}
            </Button>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => setIsSettingsDialogOpen(true)}>
                  <Settings className="mr-2 h-5 w-5" /> {t('settingsButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('settingsDialogTitle')}</DialogTitle>
                  <DialogDescription>{t('settingsDialogDescription')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="prefix" className="text-right">{t('prefixLabel')}</Label>
                    <Input id="prefix" value={dialogPrefix} onChange={(e) => setDialogPrefix(e.target.value)} className="col-span-3 font-mono" placeholder="e.g. $$"/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="suffix" className="text-right">{t('suffixLabel')}</Label>
                    <Input id="suffix" value={dialogSuffix} onChange={(e) => setDialogSuffix(e.target.value)} className="col-span-3 font-mono" placeholder="e.g. $$"/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="language" className="text-right">{t('languageLabel')}</Label>
                    <Select value={dialogLanguage} onValueChange={(value) => setDialogLanguage(value as Language)}>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder={t('selectLanguagePlaceholder')} /></SelectTrigger>
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
