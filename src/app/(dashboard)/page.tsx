'use client';

import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentReports } from '@/components/dashboard/RecentReports';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { useReports } from '@/hooks/useReport';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const { reports, isLoading } = useReports();

  const stats = useMemo<DashboardStats>(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const completedThisMonth = reports.filter((r) => {
      if (r.status !== 'completed') return false;
      const d = r.createdAt ? new Date(r.createdAt) : null;
      return d && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const inProgress = reports.filter(
      (r) => r.status === 'in_progress' || r.status === 'draft'
    ).length;

    const allGrades = reports.flatMap((r) =>
      (r.sections || []).map((s) => s.conditionGrade).filter(Boolean)
    );
    const total = allGrades.length || 1;
    const tgCount = (grade: string) =>
      Math.round((allGrades.filter((g) => g === grade).length / total) * 100);

    return {
      totalReports: reports.length,
      completedThisMonth,
      inProgress,
      avgTGDistribution: {
        TG0: tgCount('TG0'),
        TG1: tgCount('TG1'),
        TG2: tgCount('TG2'),
        TG3: tgCount('TG3'),
        TGIU: tgCount('TGIU'),
      },
    };
  }, [reports]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">God dag</h1>
        <p className="text-muted-foreground mt-1">
          Her er en oversikt over dine rapporter og aktivitet.
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentReports reports={reports.slice(0, 5)} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </motion.div>
  );
}
