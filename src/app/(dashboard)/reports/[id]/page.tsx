'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  User,
  Home,
  Edit,
  Eye,
  ArrowLeft,
  Building,
  Ruler,
  Phone,
  Mail,
} from 'lucide-react';
import { useReport } from '@/hooks/useReport';
import { SectionSkeleton } from '@/components/shared/LoadingSkeleton';
import { TGBadge, TGDistributionBadges } from '@/components/reports/TGBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { REPORT_TYPES, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, PROPERTY_TYPES } from '@/lib/constants';
import { formatDate, formatCurrency, cn } from '@/lib/utils';

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const { id } = use(params);
  const { report, isLoading, error } = useReport(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <SectionSkeleton />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{error || 'Rapport ikke funnet'}</p>
        <Link href="/reports">
          <Button variant="outline" className="mt-4 rounded-xl">Tilbake til rapporter</Button>
        </Link>
      </div>
    );
  }

  const reportTypeConfig = REPORT_TYPES[report.type];
  const propertyTypeLabel = report.propertyType ? PROPERTY_TYPES[report.propertyType] : '–';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            Rapporter
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href={`/reports/${id}/preview`}>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Eye className="w-4 h-4" />
              Forhåndsvis
            </Button>
          </Link>
          <Link href={`/reports/${id}/edit`}>
            <Button size="sm" className="gap-2 rounded-xl">
              <Edit className="w-4 h-4" />
              Rediger
            </Button>
          </Link>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant="secondary"
                className={cn('rounded-full', REPORT_STATUS_COLORS[report.status])}
              >
                {REPORT_STATUS_LABELS[report.status]}
              </Badge>
              <span className="text-sm text-muted-foreground font-mono">{report.reportNumber}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{report.propertyAddress}</h1>
            <p className="text-muted-foreground mt-1">
              {[report.postalCode, report.city, report.municipality].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm text-muted-foreground">{reportTypeConfig.name}</p>
            {report.inspectionDate && (
              <p className="text-sm font-medium mt-1">{formatDate(report.inspectionDate)}</p>
            )}
          </div>
        </div>

        {/* TG distribution */}
        {report.sections && report.sections.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Tilstandsgrader</p>
            <TGDistributionBadges sections={report.sections} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property info */}
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Home className="w-4 h-4 text-muted-foreground" />
              Eiendomsinformasjon
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Boligtype</p>
                <p className="font-medium mt-0.5">{propertyTypeLabel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Byggeår</p>
                <p className="font-medium mt-0.5">{report.constructionYear || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">BRA</p>
                <p className="font-medium mt-0.5">{report.bra ? `${report.bra} m²` : '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">P-ROM</p>
                <p className="font-medium mt-0.5">{report.prom ? `${report.prom} m²` : '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Antall etasjer</p>
                <p className="font-medium mt-0.5">{report.numberOfFloors || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Matrikkelnr.</p>
                <p className="font-medium mt-0.5 font-mono text-xs">
                  {[report.gnr && `Gnr ${report.gnr}`, report.bnr && `Bnr ${report.bnr}`].filter(Boolean).join(' / ') || '–'}
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          {report.sections && report.sections.length > 0 && (
            <div className="bg-card rounded-2xl border overflow-hidden">
              <div className="p-5 border-b">
                <h2 className="font-semibold">Byggtekniske forhold</h2>
                <p className="text-sm text-muted-foreground">{report.sections.length} seksjoner vurdert</p>
              </div>
              <div className="divide-y">
                {report.sections.map((section) => (
                  <div key={section.id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{section.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{section.category}</p>
                      </div>
                      {section.conditionGrade && (
                        <TGBadge grade={section.conditionGrade} />
                      )}
                    </div>

                    {section.description && (
                      <p className="text-sm text-foreground mb-2">{section.description}</p>
                    )}

                    {section.observations && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Observasjoner</p>
                        <p className="text-sm text-muted-foreground">{section.observations}</p>
                      </div>
                    )}

                    {section.cause && (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Årsak</p>
                          <p className="text-sm">{section.cause}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Konsekvens</p>
                          <p className="text-sm">{section.consequence}</p>
                        </div>
                      </div>
                    )}

                    {(section.repairCostMin || section.repairCostMax) && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Kostnadsanslag:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(section.repairCostMin || 0)} – {formatCurrency(section.repairCostMax || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {report.summary && (
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="font-semibold mb-3">Sammendrag</h2>
              <p className="text-sm text-foreground leading-relaxed">{report.summary}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Client info */}
          {(report.client || report.clientEmail || report.clientPhone) && (
            <div className="bg-card rounded-2xl border p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Oppdragsgiver
              </h3>
              <div className="space-y-2 text-sm">
                {report.client && <p className="font-medium">{report.client}</p>}
                {report.clientEmail && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <a href={`mailto:${report.clientEmail}`} className="hover:text-primary transition-colors">
                      {report.clientEmail}
                    </a>
                  </div>
                )}
                {report.clientPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${report.clientPhone}`} className="hover:text-primary transition-colors">
                      {report.clientPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Values */}
          {(report.marketValue || report.loanValue || report.technicalValue) && (
            <div className="bg-card rounded-2xl border p-5">
              <h3 className="font-semibold mb-3">Verdivurdering</h3>
              <div className="space-y-3">
                {report.marketValue && (
                  <div>
                    <p className="text-xs text-muted-foreground">Markedsverdi</p>
                    <p className="font-bold text-lg">{formatCurrency(report.marketValue)}</p>
                  </div>
                )}
                {report.loanValue && (
                  <div>
                    <p className="text-xs text-muted-foreground">Låneverdi</p>
                    <p className="font-medium">{formatCurrency(report.loanValue)}</p>
                  </div>
                )}
                {report.technicalValue && (
                  <div>
                    <p className="text-xs text-muted-foreground">Teknisk verdi</p>
                    <p className="font-medium">{formatCurrency(report.technicalValue)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total repair cost */}
          {report.totalRepairCost !== undefined && report.totalRepairCost !== null && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-1 text-amber-800 dark:text-amber-200">Samlet utbedringskostnad</h3>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {formatCurrency(report.totalRepairCost)}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="bg-card rounded-2xl border p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Datoer
            </h3>
            <div className="space-y-2 text-sm">
              {report.inspectionDate && (
                <div>
                  <p className="text-muted-foreground">Befaring</p>
                  <p className="font-medium">{formatDate(report.inspectionDate)}</p>
                </div>
              )}
              {report.reportDate && (
                <div>
                  <p className="text-muted-foreground">Rapportdato</p>
                  <p className="font-medium">{formatDate(report.reportDate)}</p>
                </div>
              )}
              {report.createdAt && (
                <div>
                  <p className="text-muted-foreground">Opprettet</p>
                  <p className="font-medium">{formatDate(report.createdAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
