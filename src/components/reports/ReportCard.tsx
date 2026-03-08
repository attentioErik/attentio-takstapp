'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, User, ArrowRight, MoreVertical, Trash2, Edit, Eye } from 'lucide-react';
import { ReportWithSections } from '@/types';
import { REPORT_TYPES, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TGDistributionBadges } from './TGBadge';

interface ReportCardProps {
  report: ReportWithSections;
  onDelete?: (id: string) => void;
}

export function ReportCard({ report, onDelete }: ReportCardProps) {
  const router = useRouter();
  const reportTypeConfig = REPORT_TYPES[report.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="bg-card rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="secondary"
              className={cn('text-xs rounded-full', REPORT_STATUS_COLORS[report.status])}
            >
              {REPORT_STATUS_LABELS[report.status]}
            </Badge>
            <span className="text-xs text-muted-foreground">{report.reportNumber}</span>
          </div>
          <h3 className="font-semibold text-foreground truncate">{report.propertyAddress}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => router.push(`/reports/${report.id}`)}>
              <Eye className="w-4 h-4" /> Vis rapport
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/reports/${report.id}/edit`)}>
              <Edit className="w-4 h-4" /> Rediger
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/reports/${report.id}/preview`)}>
              <Eye className="w-4 h-4" /> Forhåndsvis
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(report.id)}
            >
              <Trash2 className="w-4 h-4" /> Slett
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Meta info */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            {[report.postalCode, report.city, report.municipality].filter(Boolean).join(', ') || '–'}
          </span>
        </div>
        {report.inspectionDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Befaring: {formatDate(report.inspectionDate)}</span>
          </div>
        )}
        {report.client && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{report.client}</span>
          </div>
        )}
      </div>

      {/* Report type */}
      <div className="text-xs text-muted-foreground mb-3">
        {reportTypeConfig.name}
        {report.bra && ` · ${report.bra} m² BRA`}
        {report.constructionYear && ` · Bygd ${report.constructionYear}`}
      </div>

      {/* TG distribution */}
      {report.sections && report.sections.length > 0 && (
        <div className="mb-4">
          <TGDistributionBadges sections={report.sections} />
        </div>
      )}

      {/* Market value */}
      {report.marketValue && (
        <div className="text-sm font-medium text-foreground mb-4">
          Markedsverdi: {formatCurrency(report.marketValue)}
        </div>
      )}

      {/* Action */}
      <Link href={`/reports/${report.id}`}>
        <Button variant="outline" size="sm" className="w-full rounded-xl gap-2 group/btn">
          Åpne rapport
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </motion.div>
  );
}
