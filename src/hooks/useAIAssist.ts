'use client';

import { useState, useCallback } from 'react';
import { ProcessedSection } from '@/lib/ai/process-notes';

interface AIAssistState {
  isProcessing: boolean;
  result: ProcessedSection[] | null;
  error: string | null;
}

export function useAIAssist() {
  const [state, setState] = useState<AIAssistState>({
    isProcessing: false,
    result: null,
    error: null,
  });

  const processNotes = useCallback(async (input: {
    notes: string;
    reportType: string;
    propertyType: string;
    constructionYear: number;
  }) => {
    setState({ isProcessing: true, result: null, error: null });

    try {
      const res = await fetch('/api/ai/process-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'AI-behandling feilet');
      }

      const data = await res.json();
      setState({ isProcessing: false, result: data.sections, error: null });
      return data.sections as ProcessedSection[];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ukjent feil';
      setState({ isProcessing: false, result: null, error: message });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isProcessing: false, result: null, error: null });
  }, []);

  return { ...state, processNotes, reset };
}
