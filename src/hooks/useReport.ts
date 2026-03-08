'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReportWithSections } from '@/types';

export function useReport(id: string) {
  const [report, setReport] = useState<ReportWithSections | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) {
        setError('Rapport ikke funnet');
        return;
      }
      const data = await res.json();
      setReport(data.report);
    } catch {
      setError('Kunne ikke laste rapport');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchReport();
  }, [fetchReport, id]);

  const updateReport = useCallback(
    async (data: Partial<ReportWithSections>) => {
      try {
        const res = await fetch(`/api/reports/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Feil ved oppdatering');
        const result = await res.json();
        setReport((prev) => (prev ? { ...prev, ...result.report } : null));
      } catch {
        throw new Error('Kunne ikke oppdatere rapport');
      }
    },
    [id]
  );

  return { report, isLoading, error, updateReport, refetch: fetchReport };
}

export function useReports() {
  const [reports, setReports] = useState<ReportWithSections[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Feil ved henting');
      const data = await res.json();
      setReports(data.reports);
    } catch {
      setError('Kunne ikke laste rapporter');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const deleteReport = useCallback(async (id: string) => {
    await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { reports, isLoading, error, refetch: fetchReports, deleteReport };
}
