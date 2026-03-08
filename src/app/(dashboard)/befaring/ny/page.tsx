'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const PROPERTY_TYPES = [
  { value: 'enebolig', label: 'Enebolig' },
  { value: 'rekkehus', label: 'Rekkehus' },
  { value: 'leilighet', label: 'Leilighet' },
  { value: 'tomannsbolig', label: 'Tomannsbolig' },
  { value: 'fritidsbolig', label: 'Fritidsbolig' },
];

export default function NyBefaringPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Adresse er påkrevd');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, propertyType }),
      });
      const { inspection } = await res.json();
      toast.success('Befaring startet');
      router.push(`/befaring/${inspection.id}`);
    } catch {
      toast.error('Kunne ikke starte befaring');
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ny befaring</h1>
        <p className="text-muted-foreground text-sm mt-1">Fyll inn eiendommens adresse for å starte</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-6 space-y-4">
        <div className="space-y-2">
          <Label>Adresse</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Eksempelveien 1, 0123 Oslo"
              className="rounded-xl pl-9"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Boligtype (valgfritt)</Label>
          <Select value={propertyType} onValueChange={(v) => setPropertyType(v ?? '')}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Velg type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
          {isLoading ? 'Starter...' : 'Start befaring'}
        </Button>
      </form>
    </motion.div>
  );
}
