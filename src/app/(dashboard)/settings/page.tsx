'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Bell, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { mockUser } from '@/lib/mock-data';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    company: mockUser.company || '',
    phone: mockUser.phone || '',
    certifications: mockUser.certifications || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast.success('Innstillinger lagret');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl space-y-8"
    >
      {/* Profile */}
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Profil</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-bold">
            {getInitials(formData.name)}
          </div>
          <div>
            <p className="font-medium">{formData.name}</p>
            <p className="text-sm text-muted-foreground">{formData.email}</p>
            <Button variant="ghost" size="sm" className="mt-1 px-0 text-primary h-auto">
              Endre profilbilde
            </Button>
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
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">API og integrasjoner</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Anthropic API-nøkkel</Label>
            <Input
              type="password"
              placeholder="sk-ant-..."
              className="rounded-xl font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Kreves for AI-assistert befaringsanalyse. Hent fra console.anthropic.com
            </p>
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
