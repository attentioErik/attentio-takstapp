'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Grid3X3, List, Filter, Plus, FileText } from 'lucide-react';
import { useReports } from '@/hooks/useReport';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportListSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { REPORT_TYPES, REPORT_STATUS_LABELS } from '@/lib/constants';
import { ReportWithSections } from '@/types';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { REPORT_STATUS_COLORS } from '@/lib/constants';
import { TGDistributionBadges } from '@/components/reports/TGBadge';
import { MapPin, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const { reports, isLoading, deleteReport } = useReports();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        !search ||
        r.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
        r.reportNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.client?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesType = typeFilter === 'all' || r.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reports, search, statusFilter, typeFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteReport(deleteId);
    toast.success('Rapport slettet');
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-9 w-28 bg-muted rounded-xl animate-pulse" />
        </div>
        <ReportListSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk etter adresse, rapportnummer, klient..."
            className="pl-9 rounded-xl h-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="rounded-xl h-10 w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Alle statuser</SelectItem>
              {Object.entries(REPORT_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
            <SelectTrigger className="rounded-xl h-10 w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Alle typer</SelectItem>
              {Object.entries(REPORT_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex border rounded-xl overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'px-3 py-2 transition-colors',
                view === 'grid' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'px-3 py-2 transition-colors',
                view === 'list' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link href="/reports/new">
            <Button className="rounded-xl gap-2 h-10">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ny rapport</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        Viser {filtered.length} av {reports.length} rapporter
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Ingen rapporter funnet"
          description={
            search || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Prøv å endre søk eller filtre.'
              : 'Du har ingen rapporter ennå. Opprett din første rapport nå.'
          }
          action={{
            label: 'Opprett rapport',
            onClick: () => window.location.href = '/reports/new',
          }}
        />
      )}

      {/* Reports grid */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Reports list */}
      {view === 'list' && filtered.length > 0 && (
        <div className="bg-card rounded-2xl border divide-y overflow-hidden">
          {filtered.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {report.type === 'tilstandsrapport' ? 'TL' : report.type === 'verditakst' ? 'VT' : 'FT'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{report.propertyAddress}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">{report.reportNumber}</span>
                    {report.city && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />{report.city}
                      </span>
                    )}
                    {report.inspectionDate && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />{formatDate(report.inspectionDate)}
                      </span>
                    )}
                  </div>
                </div>
                {report.sections && report.sections.length > 0 && (
                  <div className="hidden md:block">
                    <TGDistributionBadges sections={report.sections} />
                  </div>
                )}
                <Badge
                  variant="secondary"
                  className={cn('text-xs rounded-full flex-shrink-0', REPORT_STATUS_COLORS[report.status])}
                >
                  {REPORT_STATUS_LABELS[report.status]}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Slett rapport"
        description="Er du sikker på at du vil slette denne rapporten? Handlingen kan ikke angres."
        confirmLabel="Slett rapport"
        onConfirm={handleDelete}
      />
    </motion.div>
  );
}
