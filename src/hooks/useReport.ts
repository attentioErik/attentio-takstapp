'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReportWithSections } from '@/types';
import { mockReports } from '@/lib/mock-data';

export function useReport(id: string) {
  const [report, setReport] = useState<ReportWithSections | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In production, this would call the API
      // const res = await fetch(`/api/reports/${id}`);
      // const data = await res.json();

      // Mock implementation
      await new Promise((r) => setTimeout(r, 500));
      const found = mockReports.find((r) => r.id === id);
      if (!found) {
        setError('Rapport ikke funnet');
      } else {
        setReport(found);
      }
    } catch {
      setError('Kunne ikke laste rapport');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const updateReport = useCallback(async (data: Partial<ReportWithSections>) => {
    if (!report) return;
    try {
      // In production: await fetch(`/api/reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      setReport((prev) => prev ? { ...prev, ...data } : null);
    } catch {
      throw new Error('Kunne ikke oppdatere rapport');
    }
  }, [report]);

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
      await new Promise((r) => setTimeout(r, 600));
      setReports(mockReports);
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
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { reports, isLoading, error, refetch: fetchReports, deleteReport };
}
