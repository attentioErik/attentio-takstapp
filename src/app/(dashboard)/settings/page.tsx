'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export default function SettingsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    certifications: '',
  });

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then(({ user }) => {
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            company: user.company || '',
            phone: user.phone || '',
            certifications: user.certifications || '',
          });
          setLogoUrl(user.logoUrl || '');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Feil');
      const data = await res.json();
      setLogoUrl(data.url);
      toast.success('Logo lastet opp');
    } catch {
      toast.error('Kunne ikke laste opp logo');
    } finally {
      setLogoUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, logoUrl }),
      });
      if (!res.ok) throw new Error('Feil');
      toast.success('Innstillinger lagret');
    } catch {
      toast.error('Kunne ikke lagre innstillinger');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-2xl border p-6 animate-pulse">
            <div className="h-5 w-32 bg-muted rounded mb-6" />
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded-xl" />
              <div className="h-10 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-8">
      {/* Profile */}
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Profil</h2>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
            {getInitials(formData.name)}
          </div>
          <div>
            <p className="font-medium">{formData.name}</p>
            <p className="text-sm text-muted-foreground">{formData.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fullt navn</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>E-postadresse</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Firma</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Firmanavn</Label>
            <Input
              value={formData.company}
              onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Sertifiseringer / titler</Label>
            <Textarea
              value={formData.certifications}
              onChange={(e) => setFormData((p) => ({ ...p, certifications: e.target.value }))}
              placeholder="f.eks. Statsautorisert takstmann, NITO Takst"
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Bedriftslogo</Label>
            {logoUrl ? (
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-xl border bg-muted flex items-center justify-center overflow-hidden p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Firmalogo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => inputRef.current?.click()}
                    disabled={logoUploading}
                  >
                    <Upload className="w-3.5 h-3.5 mr-2" />
                    {logoUploading ? 'Laster opp...' : 'Endre logo'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-destructive hover:text-destructive"
                    onClick={() => setLogoUrl('')}
                  >
                    Fjern logo
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={logoUploading}
                className="w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">
                  {logoUploading ? 'Laster opp...' : 'Klikk for å laste opp logo'}
                </span>
                <span className="text-xs">PNG, JPG eller SVG</span>
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <p className="text-xs text-muted-foreground">Logoen vises i rapporthode og PDF.</p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? 'Lagrer...' : 'Lagre innstillinger'}
        </Button>
      </div>
    </motion.div>
  );
}
