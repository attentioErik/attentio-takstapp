'use client';

import { useState, useCallback } from 'react';
import { BuildingSectionData } from '@/types';

export function useSections(initialSections: BuildingSectionData[] = []) {
  const [sections, setSections] = useState<BuildingSectionData[]>(initialSections);
  const [isLoading, setIsLoading] = useState(false);

  const addSection = useCallback((section: Omit<BuildingSectionData, 'id'>) => {
    const newSection: BuildingSectionData = {
      ...section,
      id: `sec-${Date.now()}`,
    };
    setSections((prev) => [...prev, newSection]);
    return newSection;
  }, []);

  const updateSection = useCallback(async (id: string, data: Partial<BuildingSectionData>) => {
    setIsLoading(true);
    try {
      // In production: await fetch(`/api/sections/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      await new Promise((r) => setTimeout(r, 200));
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s))
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setSections((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated.map((s, i) => ({ ...s, sortOrder: i }));
    });
  }, []);

  return { sections, setSections, isLoading, addSection, updateSection, deleteSection, reorderSections };
}
