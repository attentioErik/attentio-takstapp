'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Save, Trash2, GripVertical } from 'lucide-react';
import { BuildingSectionData, ConditionGrade, MoistureMeasurement } from '@/types';
import { BUILDING_SECTION_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConditionGradeSelector } from './ConditionGradeSelector';
import { MoistureMeasurementTable } from './MoistureMeasurement';
import { ImageUploader } from './ImageUploader';
import { TGBadge } from '../TGBadge';

interface SectionEditorProps {
  section: BuildingSectionData;
  onUpdate: (data: Partial<BuildingSectionData>) => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export function SectionEditor({ section, onUpdate, onDelete, isLoading }: SectionEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [localData, setLocalData] = useState(section);
  const [isDirty, setIsDirty] = useState(false);

  const categoryConfig = BUILDING_SECTION_CATEGORIES.find((c) => c.id === section.category);
  const needsCauseConsequence = localData.conditionGrade === 'TG2' || localData.conditionGrade === 'TG3';
  const needsRepairCost = localData.conditionGrade === 'TG3';

  const update = (field: keyof BuildingSectionData, value: unknown) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const save = () => {
    onUpdate(localData);
    setIsDirty(false);
  };

  return (
    <div className={cn(
      'bg-card rounded-2xl border overflow-hidden transition-shadow',
      expanded ? 'shadow-md' : 'shadow-sm hover:shadow-md'
    )}>
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground truncate">{localData.name}</p>
              {isDirty && (
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" title="Ikke lagret" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {categoryConfig?.name || localData.category}
              {localData.images && localData.images.length > 0 && (
                <span className="ml-2 text-muted-foreground/70">· {localData.images.length} bilde{localData.images.length !== 1 ? 'r' : ''}</span>
              )}
            </p>
          </div>

          {localData.conditionGrade && (
            <TGBadge grade={localData.conditionGrade} />
          )}
        </div>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t space-y-5">
              {/* Section name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${section.id}`}>Navn</Label>
                  <Input
                    id={`name-${section.id}`}
                    value={localData.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`subcategory-${section.id}`}>Underkategori</Label>
                  <Input
                    id={`subcategory-${section.id}`}
                    value={localData.subcategory || ''}
                    onChange={(e) => update('subcategory', e.target.value)}
                    placeholder="f.eks. 2. etasje"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Condition grade */}
              <div className="space-y-2">
                <Label>Tilstandsgrad</Label>
                <ConditionGradeSelector
                  value={localData.conditionGrade}
                  onChange={(grade: ConditionGrade) => update('conditionGrade', grade)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor={`desc-${section.id}`}>Beskrivelse</Label>
                <Textarea
                  id={`desc-${section.id}`}
                  value={localData.description || ''}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Formell teknisk beskrivelse..."
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>

              {/* Observations */}
              <div className="space-y-2">
                <Label htmlFor={`obs-${section.id}`}>Observasjoner</Label>
                <Textarea
                  id={`obs-${section.id}`}
                  value={localData.observations || ''}
                  onChange={(e) => update('observations', e.target.value)}
                  placeholder="Detaljerte observasjoner fra befaring..."
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>

              {/* Cause & consequence (required for TG2/TG3) */}
              <AnimatePresence>
                {needsCauseConsequence && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`cause-${section.id}`}>
                        Årsak <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id={`cause-${section.id}`}
                        value={localData.cause || ''}
                        onChange={(e) => update('cause', e.target.value)}
                        placeholder="Hva er årsaken til avviket?"
                        rows={3}
                        className="rounded-xl resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`consequence-${section.id}`}>
                        Konsekvens <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id={`consequence-${section.id}`}
                        value={localData.consequence || ''}
                        onChange={(e) => update('consequence', e.target.value)}
                        placeholder="Hva er konsekvensen av avviket?"
                        rows={3}
                        className="rounded-xl resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Repair cost */}
              <AnimatePresence>
                {(needsRepairCost || localData.repairCostMin || localData.repairCostMax) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label>
                        Kostnadsanslag (NOK)
                        {needsRepairCost && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Minimum</Label>
                          <Input
                            type="number"
                            value={localData.repairCostMin || ''}
                            onChange={(e) => update('repairCostMin', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Maksimum</Label>
                          <Input
                            type="number"
                            value={localData.repairCostMax || ''}
                            onChange={(e) => update('repairCostMax', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Moisture measurements */}
              <MoistureMeasurementTable
                measurements={(localData.moistureMeasurements as MoistureMeasurement[]) || []}
                onChange={(measurements) => update('moistureMeasurements', measurements)}
              />

              {/* Image uploader */}
              <div className="border-t pt-5">
                <ImageUploader
                  reportId={section.reportId}
                  sectionId={section.id}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl gap-2"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Fjern seksjon
                </Button>

                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl gap-2"
                  onClick={save}
                  disabled={!isDirty || isLoading}
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Lagrer...' : 'Lagre'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
