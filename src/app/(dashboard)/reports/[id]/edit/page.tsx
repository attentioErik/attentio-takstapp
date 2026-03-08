'use client';

import { use, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Eye, Sparkles } from 'lucide-react';
import { useReport } from '@/hooks/useReport';
import { useSections } from '@/hooks/useSections';
import { SectionEditor } from '@/components/reports/SectionEditor';
import { SectionSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BUILDING_SECTION_CATEGORIES, REPORT_STATUS_LABELS } from '@/lib/constants';
import { BuildingSectionData } from '@/types';
import { toast } from 'sonner';
import { TGDistributionBadges } from '@/components/reports/TGBadge';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditReportPage({ params }: EditPageProps) {
  const { id } = use(params);
  const { report, isLoading, updateReport } = useReport(id);
  const { sections, setSections, addSection, updateSection, deleteSection } = useSections(
    report?.sections || []
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionCategory, setNewSectionCategory] = useState<string>('');
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Update sections when report loads
  if (report?.sections && sections.length === 0 && report.sections.length > 0) {
    setSections(report.sections as BuildingSectionData[]);
  }

  const handleAddSection = () => {
    if (!newSectionCategory) return;
    const cat = BUILDING_SECTION_CATEGORIES.find((c) => c.id === newSectionCategory);
    addSection({
      reportId: id,
      category: newSectionCategory,
      name: newSectionName || cat?.name || newSectionCategory,
      sortOrder: sections.length,
      isRequired: false,
    });
    setNewSectionCategory('');
    setNewSectionName('');
    setShowAddForm(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/reports/${id}/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });
      toast.success('Rapporten er lagret');
    } catch {
      toast.error('Kunne ikke lagre rapporten');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <SectionSkeleton />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Rapport ikke funnet</p>
        <Link href="/reports">
          <Button variant="outline" className="mt-4 rounded-xl">Tilbake</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/reports/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            Tilbake
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href={`/reports/${id}/preview`}>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Eye className="w-4 h-4" />
              Forhåndsvis
            </Button>
          </Link>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl">
            <Save className="w-4 h-4" />
            {isSaving ? 'Lagrer...' : 'Lagre'}
          </Button>
        </div>
      </div>

      {/* Report info */}
      <div className="bg-card rounded-2xl border p-5">
        <h2 className="font-semibold mb-1">{report.propertyAddress}</h2>
        <p className="text-sm text-muted-foreground mb-3">{report.reportNumber}</p>
        {sections.length > 0 && (
          <TGDistributionBadges sections={sections} />
        )}
      </div>

      {/* AI Assistant shortcut */}
      <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-2xl border border-violet-100 dark:border-violet-800 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-violet-900 dark:text-violet-100 text-sm">AI-assistent</p>
          <p className="text-xs text-violet-700 dark:text-violet-300">
            Analyser befaringsnotater automatisk med Claude AI
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl border-violet-200 text-violet-700 dark:border-violet-700 dark:text-violet-300">
          Kjør AI
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Byggseksjoner ({sections.length})</h2>
        </div>

        {sections.length === 0 && (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground">Ingen seksjoner ennå. Legg til din første seksjon.</p>
          </div>
        )}

        {sections.map((section) => (
          <SectionEditor
            key={section.id}
            section={section}
            onUpdate={(data) => updateSection(section.id, data)}
            onDelete={() => deleteSection(section.id)}
          />
        ))}
      </div>

      {/* Add section */}
      {showAddForm ? (
        <div className="bg-card rounded-2xl border p-5 space-y-4">
          <h3 className="font-medium">Legg til seksjon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={newSectionCategory} onValueChange={(v) => {
                if (!v) return;
                setNewSectionCategory(v);
                const cat = BUILDING_SECTION_CATEGORIES.find((c) => c.id === v);
                setNewSectionName(cat?.name || '');
              }}>
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
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="f.eks. Baderom 1. etasje"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddSection} disabled={!newSectionCategory} className="rounded-xl">
              Legg til
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-xl">
              Avbryt
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full rounded-xl gap-2 h-11 border-dashed"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4" />
          Legg til seksjon
        </Button>
      )}

      {/* Save button bottom */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? 'Lagrer...' : 'Lagre rapport'}
        </Button>
      </div>
    </motion.div>
  );
}
