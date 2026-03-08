'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin, Calendar } from 'lucide-react';
import { ReportWithSections } from '@/types';
import { REPORT_TYPES, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '@/lib/constants';
import { formatDate, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TGBadge } from '@/components/reports/TGBadge';

interface RecentReportsProps {
  reports: ReportWithSections[];
}

export function RecentReports({ reports }: RecentReportsProps) {
  if (reports.length === 0) {
    return (
      <div className="bg-card rounded-2xl border p-8 text-center">
        <p className="text-muted-foreground">Ingen rapporter ennå</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="font-semibold text-foreground">Siste rapporter</h2>
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="gap-1 text-primary rounded-lg">
            Se alle <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="divide-y">
        {reports.map((report, index) => {
          const tgCounts = (report.sections || []).reduce(
            (acc, s) => {
              if (s.conditionGrade) acc[s.conditionGrade] = (acc[s.conditionGrade] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link href={`/reports/${report.id}`}>
                <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  {/* Type indicator */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {report.type === 'tilstandsrapport' ? 'TL' : report.type === 'verditakst' ? 'VT' : 'FT'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{report.propertyAddress}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {report.city || report.municipality || '–'}
                      </span>
                      {report.inspectionDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(report.inspectionDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TG badges */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Object.entries(tgCounts).map(([grade, count]) => (
                      <TGBadge key={grade} grade={grade as 'TG0'} count={count} size="sm" />
                    ))}
                  </div>

                  {/* Status */}
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs rounded-full flex-shrink-0',
                      REPORT_STATUS_COLORS[report.status]
                    )}
                  >
                    {REPORT_STATUS_LABELS[report.status]}
                  </Badge>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
