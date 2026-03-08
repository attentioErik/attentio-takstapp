'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { WizardFormData, BuildingSectionData } from '@/types';
import { BUILDING_SECTION_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionEditor } from '../SectionEditor';

interface StepSectionsProps {
  form: UseFormReturn<WizardFormData>;
}

export function StepSections({ form }: StepSectionsProps) {
  const { watch, setValue } = form;
  const sections = (watch('sections') as Partial<BuildingSectionData>[]) || [];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState({ category: '', name: '' });

  const addSection = () => {
    if (!newSection.category || !newSection.name) return;

    const categoryConfig = BUILDING_SECTION_CATEGORIES.find((c) => c.id === newSection.category);
    const newSec: Partial<BuildingSectionData> = {
      id: `sec-new-${Date.now()}`,
      reportId: '',
      category: newSection.category,
      name: newSection.name || categoryConfig?.name || newSection.category,
      conditionGrade: undefined,
      sortOrder: sections.length,
      isRequired: categoryConfig?.required ?? false,
    };

    setValue('sections', [...sections, newSec]);
    setNewSection({ category: '', name: '' });
    setShowAddForm(false);
  };

  const updateSection = (index: number, data: Partial<BuildingSectionData>) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], ...data };
    setValue('sections', updated);
  };

  const deleteSection = (index: number) => {
    setValue('sections', sections.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed p-10 text-center"
        >
          <p className="text-muted-foreground font-medium mb-1">Ingen seksjoner ennå</p>
          <p className="text-sm text-muted-foreground">
            Legg til seksjoner manuelt eller kjør AI-analysen i forrige steg.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <SectionEditor
              key={section.id || index}
              section={section as BuildingSectionData}
              onUpdate={(data) => updateSection(index, data)}
              onDelete={() => deleteSection(index)}
            />
          ))}
        </div>
      )}

      {/* Add new section */}
      {showAddForm ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border p-5 space-y-4"
        >
          <h3 className="font-medium">Ny seksjon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={newSection.category}
                onValueChange={(v) => {
                  if (!v) return;
                  const cat = BUILDING_SECTION_CATEGORIES.find((c) => c.id === v);
                  setNewSection({ category: v, name: cat?.name || '' });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Velg kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {BUILDING_SECTION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Navn</Label>
              <Input
                value={newSection.name}
                onChange={(e) => setNewSection((p) => ({ ...p, name: e.target.value }))}
                placeholder="f.eks. Baderom 1. etasje"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={addSection}
              disabled={!newSection.category || !newSection.name}
              className="rounded-xl"
            >
              Legg til
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl"
            >
              Avbryt
            </Button>
          </div>
        </motion.div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl gap-2 h-11 border-dashed"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4" />
          Legg til seksjon
        </Button>
      )}
    </div>
  );
}
