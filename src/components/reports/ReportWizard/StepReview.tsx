'use client';

import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Calendar, User, Home, Zap } from 'lucide-react';
import { WizardFormData, BuildingSectionData } from '@/types';
import { REPORT_TYPES, PROPERTY_TYPES, CONDITION_GRADES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { TGBadge, TGDistributionBadges } from '../TGBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface StepReviewProps {
  form: UseFormReturn<WizardFormData>;
}

export function StepReview({ form }: StepReviewProps) {
  const { register, watch } = form;
  const data = watch();
  const sections = (data.sections || []) as Partial<BuildingSectionData>[];

  const reportTypeConfig = REPORT_TYPES[data.type];
  const propertyTypeLabel = data.propertyType ? PROPERTY_TYPES[data.propertyType] : '–';

  const tg3Sections = sections.filter((s) => s.conditionGrade === 'TG3');
  const tg2Sections = sections.filter((s) => s.conditionGrade === 'TG2');

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-100 dark:border-emerald-800 p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Klart for ferdigstilling</h3>
            <p className="text-sm text-muted-foreground">Se over oppsummeringen og legg til sluttkommentarer</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Rapporttype</p>
            <p className="font-medium text-sm mt-0.5">{reportTypeConfig?.name || '–'}</p>
          </div>
          <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Seksjoner</p>
            <p className="font-medium text-sm mt-0.5">{sections.length} stk</p>
          </div>
          <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">TG2-avvik</p>
            <p className="font-medium text-sm mt-0.5 text-amber-600">{tg2Sections.length} stk</p>
          </div>
          <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">TG3-avvik</p>
            <p className="font-medium text-sm mt-0.5 text-red-600">{tg3Sections.length} stk</p>
          </div>
        </div>
      </motion.div>

      {/* Property info */}
      <div className="bg-card rounded-2xl border p-5">
        <h3 className="font-semibold mb-4">Eiendomsinformasjon</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{data.propertyAddress}{data.city ? `, ${data.city}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-muted-foreground" />
            <span>{propertyTypeLabel} · Bygd {data.constructionYear || '–'} · {data.bra ? `${data.bra} m² BRA` : '–'}</span>
          </div>
          {data.inspectionDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Befaring: {data.inspectionDate}</span>
            </div>
          )}
          {data.client && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{data.client}</span>
            </div>
          )}
        </div>
      </div>

      {/* TG distribution */}
      {sections.length > 0 && (
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-semibold mb-4">TG-fordeling</h3>
          <TGDistributionBadges sections={sections} />

          {tg3Sections.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-red-600" />
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Umiddelbar utbedring nødvendig</p>
              </div>
              {tg3Sections.map((s, i) => (
                <p key={i} className="text-sm text-red-600 dark:text-red-400">• {s.name}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary and values */}
      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold">Verdivurdering og oppsummering</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="marketValue" className="text-sm">Markedsverdi (NOK)</Label>
            <Input
              id="marketValue"
              type="number"
              {...register('sections')}
              placeholder="f.eks. 5500000"
              className="rounded-xl"
              name="marketValue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanValue" className="text-sm">Låneverdi (NOK)</Label>
            <Input
              id="loanValue"
              type="number"
              placeholder="f.eks. 4800000"
              className="rounded-xl"
              name="loanValue"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary" className="text-sm">Sammendrag / konklusjon</Label>
          <Textarea
            id="summary"
            placeholder="Skriv en kort oppsummering av eiendommens tilstand og de viktigste funnene..."
            rows={5}
            className="rounded-xl resize-none"
          />
        </div>
      </div>
    </div>
  );
}
