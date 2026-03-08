'use client';

import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentReports } from '@/components/dashboard/RecentReports';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { mockDashboardStats, mockReports } from '@/lib/mock-data';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const recentReports = mockReports.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">God dag, Erik</h1>
        <p className="text-muted-foreground mt-1">
          Her er en oversikt over dine rapporter og aktivitet.
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={mockDashboardStats} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentReports reports={recentReports} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </motion.div>
  );
}
