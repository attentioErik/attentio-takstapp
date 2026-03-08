'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { SectionImage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploaderProps {
  images: SectionImage[];
  onChange: (images: SectionImage[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: SectionImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Opplasting feilet');

        const data = await res.json();
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          url: data.url,
          caption: '',
          sortOrder: images.length + newImages.length,
        });
      } catch {
        // If upload fails (e.g. no Vercel Blob token), use local object URL as fallback
        const localUrl = URL.createObjectURL(file);
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          url: localUrl,
          caption: '',
          sortOrder: images.length + newImages.length,
        });
        toast.warning('Bilde lagret midlertidig – koble til Vercel Blob for permanent lagring');
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);

    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(images.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

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
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImagePlus className="w-3.5 h-3.5" />
          )}
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
                    src={img.url}
                    alt={img.caption || 'Bilde'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
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
                  onChange={(e) => updateCaption(img.id, e.target.value)}
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
