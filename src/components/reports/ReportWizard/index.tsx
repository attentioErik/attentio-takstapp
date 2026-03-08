'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { WizardFormData, BuildingSectionData } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepBasicInfo } from './StepBasicInfo';
import { StepPropertyDetails } from './StepPropertyDetails';
import { StepAIAssist } from './StepAIAssist';
import { StepSections } from './StepSections';
import { StepReview } from './StepReview';

const STEPS = [
  { id: 1, title: 'Grunnleggende info', description: 'Rapporttype, adresse og klient' },
  { id: 2, title: 'Eiendomsdetaljer', description: 'Type, areal og byggeår' },
  { id: 3, title: 'AI-assistent', description: 'Lim inn befaringsnotater' },
  { id: 4, title: 'Gjennomgå seksjoner', description: 'Rediger og juster' },
  { id: 5, title: 'Oppsummering', description: 'Ferdigstill rapport' },
];

export function ReportWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<WizardFormData>({
    defaultValues: {
      type: 'tilstandsrapport',
      propertyAddress: '',
      postalCode: '',
      city: '',
      municipality: '',
      gnr: '',
      bnr: '',
      snr: '',
      fnr: '',
      client: '',
      clientEmail: '',
      clientPhone: '',
      propertyType: 'enebolig',
      constructionYear: new Date().getFullYear() - 30,
      bra: 0,
      prom: 0,
      numberOfFloors: 1,
      inspectionDate: new Date().toISOString().split('T')[0],
      rawNotes: '',
      sections: [],
    },
  });

  const goToStep = (step: number) => {
    if (step < 1 || step > STEPS.length) return;
    setCurrentStep(step);
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      goToStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const data = form.getValues();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: data.type,
          status: 'in_progress',
          propertyAddress: data.propertyAddress,
          postalCode: data.postalCode,
          city: data.city,
          municipality: data.municipality,
          gnr: data.gnr,
          bnr: data.bnr,
          snr: data.snr,
          fnr: data.fnr,
          propertyType: data.propertyType,
          constructionYear: data.constructionYear,
          bra: data.bra,
          prom: data.prom,
          numberOfFloors: data.numberOfFloors,
          client: data.client,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          inspectionDate: data.inspectionDate,
          rawNotes: data.rawNotes,
        }),
      });

      if (!res.ok) throw new Error('Kunne ikke opprette rapport');

      const { report } = await res.json();

      toast.success('Rapport opprettet!', {
        description: `Rapport ${report.reportNumber} er nå opprettet.`,
      });

      router.push(`/reports/${report.id}/edit`);
    } catch (error) {
      toast.error('Feil ved oppretting', {
        description: 'Kunne ikke opprette rapport. Prøv igjen.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => step.id < currentStep && goToStep(step.id)}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 transition-all',
                  step.id === currentStep
                    ? 'border-primary bg-primary text-white'
                    : step.id < currentStep
                    ? 'border-primary bg-primary text-white cursor-pointer'
                    : 'border-border bg-background text-muted-foreground'
                )}
              >
                {step.id < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{step.id}</span>
                )}
              </button>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-1',
                  step.id < currentStep ? 'bg-primary' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="font-semibold text-foreground">{STEPS[currentStep - 1].title}</p>
          <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {currentStep === 1 && <StepBasicInfo form={form} />}
          {currentStep === 2 && <StepPropertyDetails form={form} />}
          {currentStep === 3 && (
            <StepAIAssist
              form={form}
              onSectionsGenerated={(sections) => {
                form.setValue('sections', sections as Partial<BuildingSectionData>[]);
              }}
            />
          )}
          {currentStep === 4 && <StepSections form={form} />}
          {currentStep === 5 && <StepReview form={form} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => goToStep(currentStep - 1)}
          disabled={currentStep === 1}
          className="rounded-xl gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Tilbake
        </Button>

        <span className="text-sm text-muted-foreground">
          Steg {currentStep} av {STEPS.length}
        </span>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="rounded-xl gap-2"
        >
          {currentStep === STEPS.length ? (
            isSubmitting ? 'Oppretter...' : 'Opprett rapport'
          ) : (
            <>
              Neste <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
