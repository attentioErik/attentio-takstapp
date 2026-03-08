'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Totalt rapporter',
      value: stats.totalReports,
      icon: FileText,
      color: 'blue',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'Alle tid',
    },
    {
      title: 'Ferdigstilt denne måneden',
      value: stats.completedThisMonth,
      icon: CheckCircle,
      color: 'emerald',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      description: 'November 2025',
    },
    {
      title: 'Under arbeid',
      value: stats.inProgress,
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      description: 'Aktive rapporter',
    },
    {
      title: 'TG-fordeling',
      value: null,
      icon: BarChart3,
      color: 'violet',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      description: 'Gjennomsnitt',
      tgData: stats.avgTGDistribution,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const total = card.tgData
          ? Object.values(card.tgData).reduce((a, b) => a + b, 0)
          : 0;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            {card.value !== null ? (
              <p className="text-3xl font-bold text-foreground mb-1">{card.value}</p>
            ) : (
              <div className="space-y-2 mb-1">
                {card.tgData && Object.entries(card.tgData).map(([grade, count]) => (
                  <div key={grade} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-8">{grade}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          grade === 'TG0' || grade === 'TG1' ? 'bg-emerald-500' :
                          grade === 'TG2' ? 'bg-amber-500' :
                          grade === 'TG3' ? 'bg-red-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}%</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">{card.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
