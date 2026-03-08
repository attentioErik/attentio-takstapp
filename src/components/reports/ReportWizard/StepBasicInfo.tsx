'use client';

import { UseFormReturn } from 'react-hook-form';
import { WizardFormData } from '@/types';
import { REPORT_TYPES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ClipboardCheck, DollarSign, FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';

const typeIcons = {
  tilstandsrapport: ClipboardCheck,
  verditakst: DollarSign,
  forhandstakst: FileSearch,
};

interface StepBasicInfoProps {
  form: UseFormReturn<WizardFormData>;
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const selectedType = watch('type');

  return (
    <div className="space-y-6">
      {/* Report type */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Rapporttype</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.entries(REPORT_TYPES) as [keyof typeof REPORT_TYPES, typeof REPORT_TYPES[keyof typeof REPORT_TYPES]][]).map(([key, config]) => {
            const Icon = typeIcons[key];
            const isSelected = selectedType === key;
            return (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setValue('type', key)}
                className={cn(
                  'flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={cn('font-semibold text-sm', isSelected ? 'text-primary' : 'text-foreground')}>
                    {config.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Property address */}
      <div className="space-y-2">
        <Label htmlFor="propertyAddress" className="text-base font-medium">
          Eiendomsadresse <span className="text-destructive">*</span>
        </Label>
        <Input
          id="propertyAddress"
          {...register('propertyAddress', { required: 'Adresse er påkrevd' })}
          placeholder="f.eks. Storgata 15"
          className={cn('rounded-xl h-11', errors.propertyAddress && 'border-destructive')}
        />
        {errors.propertyAddress && (
          <p className="text-sm text-destructive">{errors.propertyAddress.message}</p>
        )}
      </div>

      {/* Postal code and city */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postnummer</Label>
          <Input
            id="postalCode"
            {...register('postalCode')}
            placeholder="0184"
            className="rounded-xl h-11"
          />
        </div>
        <div className="col-span-1 sm:col-span-2 space-y-2">
          <Label htmlFor="city">Poststed</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Oslo"
            className="rounded-xl h-11"
          />
        </div>
      </div>

      {/* Municipality */}
      <div className="space-y-2">
        <Label htmlFor="municipality">Kommune</Label>
        <Input
          id="municipality"
          {...register('municipality')}
          placeholder="f.eks. Oslo"
          className="rounded-xl h-11"
        />
      </div>

      {/* Matrikkel */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Matrikkelnummer</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['gnr', 'bnr', 'snr', 'fnr'] as const).map((field) => (
            <div key={field} className="space-y-1">
              <Label htmlFor={field} className="text-xs text-muted-foreground uppercase">{field}</Label>
              <Input
                id={field}
                {...register(field)}
                placeholder="0"
                className="rounded-xl h-11"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Client info */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Oppdragsgiver / Kjøper</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client">Navn</Label>
            <Input
              id="client"
              {...register('client')}
              placeholder="Navn på oppdragsgiver"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">E-post</Label>
            <Input
              id="clientEmail"
              type="email"
              {...register('clientEmail')}
              placeholder="epost@example.com"
              className="rounded-xl h-11"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="clientPhone">Telefon</Label>
            <Input
              id="clientPhone"
              type="tel"
              {...register('clientPhone')}
              placeholder="+47 000 00 000"
              className="rounded-xl h-11"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
