'use client';

import { UseFormReturn } from 'react-hook-form';
import { WizardFormData } from '@/types';
import { PROPERTY_TYPES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface StepPropertyDetailsProps {
  form: UseFormReturn<WizardFormData>;
}

export function StepPropertyDetails({ form }: StepPropertyDetailsProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const propertyType = watch('propertyType');

  return (
    <div className="space-y-6">
      {/* Property type */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Boligtype</Label>
        <Select
          value={propertyType}
          onValueChange={(v) => v && setValue('propertyType', v as WizardFormData['propertyType'])}
        >
          <SelectTrigger className="rounded-xl h-11">
            <SelectValue placeholder="Velg boligtype" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {(Object.entries(PROPERTY_TYPES) as [string, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Construction year */}
      <div className="space-y-2">
        <Label htmlFor="constructionYear" className="text-base font-medium">
          Byggeår <span className="text-destructive">*</span>
        </Label>
        <Input
          id="constructionYear"
          type="number"
          {...register('constructionYear', {
            required: 'Byggeår er påkrevd',
            min: { value: 1800, message: 'Ugyldig byggeår' },
            max: { value: 2025, message: 'Ugyldig byggeår' },
          })}
          placeholder="f.eks. 1987"
          className={cn('rounded-xl h-11', errors.constructionYear && 'border-destructive')}
        />
        {errors.constructionYear && (
          <p className="text-sm text-destructive">{errors.constructionYear.message}</p>
        )}
      </div>

      {/* Areas */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Areal</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bra" className="text-sm text-muted-foreground">BRA (bruksareal) m²</Label>
            <Input
              id="bra"
              type="number"
              {...register('bra', { min: 0 })}
              placeholder="0"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prom" className="text-sm text-muted-foreground">P-ROM (primærrom) m²</Label>
            <Input
              id="prom"
              type="number"
              {...register('prom', { min: 0 })}
              placeholder="0"
              className="rounded-xl h-11"
            />
          </div>
        </div>
      </div>

      {/* Floors */}
      <div className="space-y-2">
        <Label htmlFor="numberOfFloors" className="text-base font-medium">Antall etasjer</Label>
        <Input
          id="numberOfFloors"
          type="number"
          {...register('numberOfFloors', { min: 1 })}
          placeholder="1"
          className="rounded-xl h-11 max-w-32"
        />
      </div>

      {/* Inspection date */}
      <div className="space-y-2">
        <Label htmlFor="inspectionDate" className="text-base font-medium">
          Befaringsdato <span className="text-destructive">*</span>
        </Label>
        <Input
          id="inspectionDate"
          type="date"
          {...register('inspectionDate', { required: 'Befaringsdato er påkrevd' })}
          className={cn('rounded-xl h-11 max-w-64', errors.inspectionDate && 'border-destructive')}
        />
        {errors.inspectionDate && (
          <p className="text-sm text-destructive">{errors.inspectionDate.message}</p>
        )}
      </div>

      {/* Info box */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Tips</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
          BRA og P-ROM kan hentes fra kartverket.no eller tidligere takstrapporter.
          Disse brukes i den offisielle rapporten og bør være nøyaktige.
        </p>
      </div>
    </div>
  );
}
