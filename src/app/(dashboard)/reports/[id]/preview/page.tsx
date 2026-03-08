'use client';

import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Download, Edit, Printer } from 'lucide-react';
import { useReport } from '@/hooks/useReport';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { REPORT_TYPES, PROPERTY_TYPES, CONDITION_GRADES } from '@/lib/constants';
import { formatDate, formatDateLong, formatCurrency } from '@/lib/utils';
import { TGBadge } from '@/components/reports/TGBadge';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { id } = use(params);
  const { report, isLoading } = useReport(id);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    company?: string;
    certifications?: string;
    logoUrl?: string;
    logoUrlLight?: string;
    headerColor?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then(({ user }) => setCurrentUser(user))
      .catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Rapport ikke funnet</p>
      </div>
    );
  }

  const reportTypeConfig = REPORT_TYPES[report.type];
  const propertyTypeLabel = report.propertyType ? PROPERTY_TYPES[report.propertyType] : '–';

  const handlePrint = () => window.print();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 print:max-w-none print:m-0 print:p-0 report-wrapper"
    >
      {/* Toolbar - hidden in print */}
      <div className="flex items-center justify-between no-print print:hidden">
        <Link href={`/reports/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            Tilbake
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Skriv ut
          </Button>
          <Link href={`/reports/${id}/edit`}>
            <Button size="sm" className="gap-2 rounded-xl">
              <Edit className="w-4 h-4" />
              Rediger
            </Button>
          </Link>
        </div>
      </div>

      {/* Report document */}
      <div className="bg-white dark:bg-card rounded-2xl border shadow-sm overflow-hidden print:overflow-visible print:rounded-none print:border-none print:shadow-none report-preview" data-print-content>
        {/* Report header */}
        <div
          className="p-8 text-white"
          style={{ backgroundColor: currentUser?.headerColor || '#1e3a5f' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-2">
                {reportTypeConfig.name}
              </p>
              <h1 className="text-3xl font-bold mb-1">{report.propertyAddress}</h1>
              <p className="text-white/70">
                {[report.postalCode, report.city].filter(Boolean).join(' ')}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-white/60 text-sm">{report.reportNumber}</p>
              {report.reportDate && (
                <p className="text-sm font-medium mt-1 text-white/90">{formatDateLong(report.reportDate)}</p>
              )}
              {(currentUser?.logoUrlLight || currentUser?.logoUrl) && (
                <div className="mt-3 flex items-center justify-end">
                  <div className="h-12 max-w-[96px] flex items-center justify-end">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentUser.logoUrlLight || currentUser.logoUrl!}
                      alt="Firmalogo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Property details */}
          <section className="avoid-break">
            <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b">Eiendomsinformasjon</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Adresse</p>
                <p className="mt-1">{report.propertyAddress}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Poststed</p>
                <p className="mt-1">{[report.postalCode, report.city].filter(Boolean).join(' ') || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Kommune</p>
                <p className="mt-1">{report.municipality || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Matrikkelnummer</p>
                <p className="mt-1 font-mono text-xs">
                  {[
                    report.gnr && `Gnr ${report.gnr}`,
                    report.bnr && `Bnr ${report.bnr}`,
                    report.snr && `Snr ${report.snr}`,
                    report.fnr && `Fnr ${report.fnr}`,
                  ].filter(Boolean).join(' / ') || '–'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Boligtype</p>
                <p className="mt-1">{propertyTypeLabel}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Byggeår</p>
                <p className="mt-1">{report.constructionYear || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">BRA</p>
                <p className="mt-1">{report.bra ? `${report.bra} m²` : '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">P-ROM</p>
                <p className="mt-1">{report.prom ? `${report.prom} m²` : '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Antall etasjer</p>
                <p className="mt-1">{report.numberOfFloors || '–'}</p>
              </div>
            </div>
          </section>

          {/* Client */}
          {report.client && (
            <section className="avoid-break">
              <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b">Oppdragsgiver</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-medium">Navn</p>
                  <p className="mt-1">{report.client}</p>
                </div>
                {report.clientEmail && (
                  <div>
                    <p className="text-muted-foreground font-medium">E-post</p>
                    <p className="mt-1">{report.clientEmail}</p>
                  </div>
                )}
                {report.clientPhone && (
                  <div>
                    <p className="text-muted-foreground font-medium">Telefon</p>
                    <p className="mt-1">{report.clientPhone}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Inspection info */}
          <section className="avoid-break">
            <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b">Befaringsinformasjon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Befaringsdato</p>
                <p className="mt-1">{formatDateLong(report.inspectionDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Takstmann</p>
                <p className="mt-1">{currentUser?.name ?? '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Sertifiseringer</p>
                <p className="mt-1">{currentUser?.certifications ?? '–'}</p>
              </div>
            </div>
          </section>

          {/* Building sections */}
          {report.sections && report.sections.length > 0 && (
            <section className="page-break-before">
              <h2 className="text-lg font-bold text-foreground mb-6 pb-2 border-b">Byggteknisk vurdering</h2>

              {/* TG explanation */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6 p-4 bg-muted/30 rounded-xl">
                {Object.entries(CONDITION_GRADES).map(([grade, config]) => (
                  <div key={grade} className="text-center">
                    <TGBadge grade={grade as 'TG0'} size="sm" />
                    <p className="text-xs text-muted-foreground mt-1">{config.name}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                {report.sections.map((section, i) => (
                  <div key={section.id} className="border rounded-xl overflow-hidden avoid-break building-section">
                    <div className="flex items-center justify-between bg-muted/30 p-4">
                      <h3 className="font-semibold">{section.name}</h3>
                      {section.conditionGrade && (
                        <TGBadge grade={section.conditionGrade} size="lg" showName />
                      )}
                    </div>

                    <div className="p-4 space-y-3 text-sm">
                      {section.description && (
                        <p>{section.description}</p>
                      )}

                      {section.observations && (
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Observasjoner:</p>
                          <p>{section.observations}</p>
                        </div>
                      )}

                      {section.cause && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                            <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Årsak:</p>
                            <p className="text-amber-700 dark:text-amber-300">{section.cause}</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                            <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">Konsekvens:</p>
                            <p className="text-orange-700 dark:text-orange-300">{section.consequence}</p>
                          </div>
                        </div>
                      )}

                      {(section.repairCostMin || section.repairCostMax) && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="font-medium text-muted-foreground">Kostnadsanslag:</span>
                          <span className="font-bold text-foreground">
                            {formatCurrency(section.repairCostMin || 0)} – {formatCurrency(section.repairCostMax || 0)}
                          </span>
                        </div>
                      )}

                      {/* Section images */}
                      {section.images && (section.images as Array<{ id: string; url: string; caption?: string }>).length > 0 && (
                        <div className="mt-4">
                          <p className="font-medium text-muted-foreground mb-2">Bilder:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(section.images as Array<{ id: string; url: string; caption?: string }>).map((img) => (
                              <div key={img.id} className="avoid-break">
                                <div className="aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img.url} alt={img.caption || 'Bilde'} className="w-full h-full object-cover" />
                                </div>
                                {img.caption && (
                                  <p className="text-xs text-muted-foreground mt-1 text-center italic">{img.caption}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Summary */}
          {report.summary && (
            <section className="avoid-break">
              <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b">Sammendrag og konklusjon</h2>
              <p className="text-sm leading-relaxed">{report.summary}</p>
            </section>
          )}

          {/* Values */}
          {(report.marketValue || report.loanValue) && (
            <section className="avoid-break">
              <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b">Verdivurdering</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {report.marketValue && (
                  <div className="bg-muted/30 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Markedsverdi</p>
                    <p className="text-xl font-bold mt-1">{formatCurrency(report.marketValue)}</p>
                  </div>
                )}
                {report.loanValue && (
                  <div className="bg-muted/30 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Låneverdi</p>
                    <p className="text-xl font-bold mt-1">{formatCurrency(report.loanValue)}</p>
                  </div>
                )}
                {report.technicalValue && (
                  <div className="bg-muted/30 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Teknisk verdi</p>
                    <p className="text-xl font-bold mt-1">{formatCurrency(report.technicalValue)}</p>
                  </div>
                )}
                {report.totalRepairCost !== undefined && report.totalRepairCost !== null && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Utbedringskostnad</p>
                    <p className="text-xl font-bold mt-1 text-amber-700 dark:text-amber-300">
                      {formatCurrency(report.totalRepairCost)}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Signature */}
          <section className="pt-8 border-t avoid-break">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Takstmann</p>
                <p className="font-semibold mt-1">{currentUser?.name ?? '–'}</p>
                <p className="text-sm text-muted-foreground">{currentUser?.company ?? ''}</p>
                <p className="text-sm text-muted-foreground">{currentUser?.certifications ?? ''}</p>
              </div>
              <div className="text-right">
                <div className="h-16 w-40 border-b-2 border-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Underskrift</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
