'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { WizardFormData } from '@/types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAIAssist } from '@/hooks/useAIAssist';

interface StepAIAssistProps {
  form: UseFormReturn<WizardFormData>;
  onSectionsGenerated: (sections: WizardFormData['sections']) => void;
}

export function StepAIAssist({ form, onSectionsGenerated }: StepAIAssistProps) {
  const { register, watch, formState: { errors } } = form;
  const { isProcessing, result, error, processNotes } = useAIAssist();
  const [processed, setProcessed] = useState(false);

  const notes = watch('rawNotes');
  const reportType = watch('type');
  const propertyType = watch('propertyType');
  const constructionYear = watch('constructionYear');

  const handleProcess = async () => {
    if (!notes?.trim()) return;

    try {
      const sections = await processNotes({
        notes,
        reportType: reportType || 'tilstandsrapport',
        propertyType: propertyType || 'enebolig',
        constructionYear: constructionYear || 2000,
      });

      onSectionsGenerated(sections.map((s) => ({
        category: s.category,
        name: s.name,
        conditionGrade: s.conditionGrade,
        description: s.description,
        observations: s.observations,
        cause: s.cause,
        consequence: s.consequence,
        repairCostMin: s.repairCostEstimate?.min,
        repairCostMax: s.repairCostEstimate?.max,
      })));

      setProcessed(true);
    } catch {
      // Error is handled in hook state
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-100 dark:border-violet-800 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-violet-900 dark:text-violet-100">AI-assistert befaringsanalyse</h3>
            <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">
              Lim inn dine befaringsnotater nedenfor. Claude AI vil analysere dem og automatisk
              strukturere observasjonene til formelle rapportseksjoner med korrekte tilstandsgrader.
            </p>
          </div>
        </div>
      </div>

      {/* Notes input */}
      <div className="space-y-2">
        <Label htmlFor="rawNotes" className="text-base font-medium">
          Befaringsnotater
        </Label>
        <Textarea
          id="rawNotes"
          {...register('rawNotes')}
          placeholder={`Lim inn eller skriv befaringsnotater her...

Eksempel:
- Baderom: Fukt bak toalett, slitt silikonfu
- Tak: Ny shingel 2022, god stand
- El-anlegg: Gammelt sikringsskap med skrusikringer
- Kjøkken: Slitt benkeplate, ellers ok`}
          rows={12}
          className="rounded-xl resize-none font-mono text-sm"
        />
      </div>

      {/* Process button */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={handleProcess}
          disabled={!notes?.trim() || isProcessing}
          className="rounded-xl gap-2"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI analyserer...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyser med AI
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Bruker Claude claude-sonnet-4-5 via Anthropic API
        </p>
      </div>

      {/* Processing status */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-muted/30 p-5"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div>
              <p className="font-medium">Analyserer befaringsnotater...</p>
              <p className="text-sm text-muted-foreground">
                Claude leser og strukturerer observasjonene dine. Dette tar vanligvis 10-30 sekunder.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {['Leser notater', 'Identifiserer kategorier', 'Vurderer tilstandsgrader', 'Genererer rapport'].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.5 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {step}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/30 bg-red-50 dark:bg-red-900/20 p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">AI-behandling feilet</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Success */}
      {processed && result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-300">
              {result.length} seksjoner generert
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Gå til neste steg for å gjennomgå og redigere seksjonene.
            </p>
          </div>
        </motion.div>
      )}

      {/* Skip info */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Du kan hoppe over dette steget og legge til seksjoner manuelt i neste steg.
          AI-analysen kan alltid kjøres på nytt fra rapportens redigeringsside.
        </p>
      </div>
    </div>
  );
}
