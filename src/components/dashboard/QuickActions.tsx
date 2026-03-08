'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, FileEdit, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportWithSections } from '@/types';

interface QuickActionsProps {
  reports: ReportWithSections[];
}

export function QuickActions({ reports }: QuickActionsProps) {
  const activeReports = reports
    .filter((r) => r.status === 'in_progress' || r.status === 'draft')
    .sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });

  const mostRecent = activeReports[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-card rounded-2xl border p-6"
    >
      <h2 className="font-semibold text-foreground mb-4">Hurtighandlinger</h2>
      <div className="space-y-3">
        <Link href="/reports/new" className="block">
          <Button className="w-full rounded-xl gap-2 h-11" size="lg">
            <Plus className="w-5 h-5" />
            Ny rapport
          </Button>
        </Link>

        {mostRecent && (
          <Link href={`/reports/${mostRecent.id}/edit`} className="block">
            <Button variant="outline" className="w-full rounded-xl gap-2 h-11 text-left" size="lg">
              <FileEdit className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">
                Fortsett utkast – {mostRecent.propertyAddress}
              </span>
            </Button>
          </Link>
        )}

        {activeReports.length > 1 && (
          <Link href="/reports" className="block">
            <Button variant="ghost" className="w-full rounded-xl gap-2 h-11" size="lg">
              <FileEdit className="w-5 h-5" />
              {activeReports.length} utkast venter
            </Button>
          </Link>
        )}

        <Link href="/reports" className="block">
          <Button variant="ghost" className="w-full rounded-xl gap-2 h-11" size="lg">
            <TrendingUp className="w-5 h-5" />
            Se alle rapporter
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
