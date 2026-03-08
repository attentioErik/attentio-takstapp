'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Save, Upload, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#1e3a5f', '#1e40af', '#1d4ed8', '#2563eb',
  '#0f172a', '#18181b', '#1c1917', '#374151',
  '#065f46', '#14532d', '#166534', '#15803d',
  '#7c2d12', '#991b1b', '#9f1239', '#6b21a8',
];

export default function SettingsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const lightInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [lightLogoUploading, setLightLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUrlLight, setLogoUrlLight] = useState('');
  const [headerColor, setHeaderColor] = useState('#1e3a5f');
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
          setLogoUrlLight(user.logoUrlLight || '');
          setHeaderColor(user.headerColor || '#1e3a5f');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const uploadLogo = async (file: File): Promise<string> => {
    const { uploadFile } = await import('@uploadcare/upload-client');
    const result = await uploadFile(file, {
      publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY!,
      store: 'auto',
    });
    return `${result.cdnUrl}-/quality/smart/`;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadLogo(file);
      setLogoUrl(url);
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, logoUrl: url, logoUrlLight, headerColor }),
      });
      toast.success('Logo lastet opp og lagret');
    } catch {
      toast.error('Kunne ikke laste opp logo');
    } finally {
      setLogoUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleLightLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLightLogoUploading(true);
    try {
      const url = await uploadLogo(file);
      setLogoUrlLight(url);
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, logoUrl, logoUrlLight: url, headerColor }),
      });
      toast.success('Lys logo lastet opp og lagret');
    } catch {
      toast.error('Kunne ikke laste opp logo');
    } finally {
      setLightLogoUploading(false);
      if (lightInputRef.current) lightInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, logoUrl, logoUrlLight, headerColor }),
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
        {[1, 2, 3].map((i) => (
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

          {/* Dark logo (for light backgrounds) */}
          <div className="space-y-2">
            <Label>Bedriftslogo (mørk – for lyse bakgrunner)</Label>
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
          </div>

          {/* Light logo (for dark header) */}
          <div className="space-y-2">
            <Label>Lys logo (for mørkt rapporthode)</Label>
            {logoUrlLight ? (
              <div className="flex items-center gap-4">
                <div
                  className="w-32 h-20 rounded-xl border flex items-center justify-center overflow-hidden p-2"
                  style={{ backgroundColor: headerColor }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrlLight} alt="Lys firmalogo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => lightInputRef.current?.click()}
                    disabled={lightLogoUploading}
                  >
                    <Upload className="w-3.5 h-3.5 mr-2" />
                    {lightLogoUploading ? 'Laster opp...' : 'Endre lys logo'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-destructive hover:text-destructive"
                    onClick={() => setLogoUrlLight('')}
                  >
                    Fjern
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => lightInputRef.current?.click()}
                disabled={lightLogoUploading}
                className="w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                style={{ borderColor: `${headerColor}40`, backgroundColor: `${headerColor}08` }}
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">
                  {lightLogoUploading ? 'Laster opp...' : 'Last opp logo i lys versjon'}
                </span>
                <span className="text-xs">PNG med gjennomsiktig bakgrunn anbefales</span>
              </button>
            )}
            <input
              ref={lightInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLightLogoUpload}
            />
            <p className="text-xs text-muted-foreground">Vises i rapporthode mot den mørke bakgrunnsfargen.</p>
          </div>
        </div>
      </div>

      {/* Report appearance */}
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Rapportutseende</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Farge på rapporthode</Label>

            {/* Preset swatches */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setHeaderColor(color)}
                  className="w-8 h-8 rounded-lg border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: headerColor === color ? 'white' : 'transparent',
                    outline: headerColor === color ? `2px solid ${color}` : 'none',
                    outlineOffset: '1px',
                  }}
                  title={color}
                />
              ))}
            </div>

            {/* Custom color input */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border cursor-pointer p-0.5 bg-transparent"
                />
              </div>
              <Input
                value={headerColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setHeaderColor(v);
                }}
                className="rounded-xl font-mono w-32"
                placeholder="#1e3a5f"
              />
              <span className="text-sm text-muted-foreground">Velg egendefinert farge</span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Forhåndsvisning</Label>
            <div
              className="rounded-xl p-5 text-white"
              style={{ backgroundColor: headerColor }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
                    Tilstandsrapport
                  </p>
                  <p className="font-bold text-lg leading-tight">Eksempelveien 1</p>
                  <p className="text-white/70 text-sm">0123 Oslo</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">TA-2024-001</p>
                  {logoUrlLight ? (
                    <div className="mt-2 h-8 max-w-[64px] flex items-center justify-end ml-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrlLight} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : logoUrl ? (
                    <div className="mt-2 h-8 max-w-[64px] flex items-center justify-end ml-auto opacity-70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="mt-2 h-8 w-16 rounded bg-white/20 flex items-center justify-center">
                      <span className="text-white/50 text-xs">Logo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
