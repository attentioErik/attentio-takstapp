'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, FileEdit, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockReports } from '@/lib/mock-data';

export function QuickActions() {
  const draftReports = mockReports.filter((r) => r.status === 'draft');
  const inProgressReports = mockReports.filter((r) => r.status === 'in_progress');

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

        {inProgressReports.length > 0 && (
          <Link href={`/reports/${inProgressReports[0].id}/edit`} className="block">
            <Button variant="outline" className="w-full rounded-xl gap-2 h-11" size="lg">
              <FileEdit className="w-5 h-5" />
              Fortsett utkast ({inProgressReports[0].propertyAddress})
            </Button>
          </Link>
        )}

        {draftReports.length > 0 && (
          <Link href={`/reports/${draftReports[0].id}/edit`} className="block">
            <Button variant="outline" className="w-full rounded-xl gap-2 h-11" size="lg">
              <FileEdit className="w-5 h-5" />
              {draftReports.length} utkast{draftReports.length > 1 ? '' : ''} venter
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
