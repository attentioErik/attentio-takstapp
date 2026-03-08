'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadFile } from '@uploadcare/upload-client';

interface ReportImage {
  id: string;
  cdnUrl: string;
  filename?: string | null;
  caption?: string | null;
  uploadcareUuid: string;
}

interface ImageUploaderProps {
  reportId: string;
  sectionId: string;
}

export function ImageUploader({ reportId, sectionId }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ReportImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`/api/images?reportId=${reportId}&sectionId=${sectionId}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } finally {
      setLoading(false);
    }
  }, [reportId, sectionId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const result = await uploadFile(file, {
          publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY!,
          store: 'auto',
        });

        const res = await fetch('/api/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportId,
            sectionId,
            uploadcareUuid: result.uuid,
            cdnUrl: result.cdnUrl,
            filename: file.name,
          }),
        });

        if (!res.ok) throw new Error('Lagring feilet');
        const data = await res.json();
        setImages((prev) => [...prev, data.image]);
      } catch (err) {
        console.error(err);
        toast.error('Opplasting feilet');
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = async (img: ReportImage) => {
    await fetch(`/api/images/${img.id}`, { method: 'DELETE' });
    setImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  const updateCaption = async (img: ReportImage, caption: string) => {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, caption } : i)));
    await fetch(`/api/images/${img.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption }),
    });
  };

  const thumbUrl = (cdnUrl: string) => `${cdnUrl}-/resize/400x/-/quality/smart/`;

  if (loading) return <div className="h-16 animate-pulse bg-muted rounded-xl" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Bilder {images.length > 0 && <span className="text-muted-foreground">({images.length})</span>}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl gap-2 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          {uploading ? 'Laster opp...' : 'Last opp bilder'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence>
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="group relative"
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl(img.cdnUrl)}
                    alt={img.caption || img.filename || 'Bilde'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    className={cn(
                      'absolute top-1.5 right-1.5 w-6 h-6 rounded-full',
                      'bg-black/60 text-white flex items-center justify-center',
                      'opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80'
                    )}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <Input
                  value={img.caption || ''}
                  onChange={(e) => updateCaption(img, e.target.value)}
                  placeholder="Bildekommentar (valgfritt)"
                  className="mt-1.5 rounded-lg text-xs h-7 px-2"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {images.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'w-full rounded-xl border-2 border-dashed p-6',
            'flex flex-col items-center gap-2 text-muted-foreground',
            'hover:border-primary/40 hover:text-foreground hover:bg-muted/30',
            'transition-colors cursor-pointer'
          )}
        >
          <ImagePlus className="w-6 h-6" />
          <span className="text-xs">Klikk for å laste opp bilder</span>
        </button>
      )}
    </div>
  );
}
