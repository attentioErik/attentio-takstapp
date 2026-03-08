'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoistureMeasurement as MoistureMeasurementType } from '@/types';

interface MoistureMeasurementProps {
  measurements: MoistureMeasurementType[];
  onChange: (measurements: MoistureMeasurementType[]) => void;
}

export function MoistureMeasurementTable({ measurements, onChange }: MoistureMeasurementProps) {
  const addRow = () => {
    onChange([
      ...measurements,
      {
        location: '',
        value: 0,
        unit: '%',
        method: 'RF',
        date: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const updateRow = (index: number, field: keyof MoistureMeasurementType, value: string | number) => {
    const updated = [...measurements];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeRow = (index: number) => {
    onChange(measurements.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Fuktmålinger</Label>

      {measurements.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Sted</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Verdi</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Enhet</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Metode</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dato</th>
                <th className="px-3 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {measurements.map((m, i) => (
                <tr key={i} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <Input
                      value={m.location}
                      onChange={(e) => updateRow(i, 'location', e.target.value)}
                      placeholder="f.eks. Gulv dusjsone"
                      className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      value={m.value}
                      onChange={(e) => updateRow(i, 'value', parseFloat(e.target.value) || 0)}
                      className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0 w-16"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={m.unit}
                      onChange={(e) => updateRow(i, 'unit', e.target.value)}
                      placeholder="%"
                      className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0 w-12"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={m.method}
                      onChange={(e) => updateRow(i, 'method', e.target.value)}
                      placeholder="RF"
                      className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0 w-16"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="date"
                      value={m.date || ''}
                      onChange={(e) => updateRow(i, 'date', e.target.value)}
                      className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-lg text-muted-foreground hover:text-destructive"
                      onClick={() => removeRow(i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="rounded-lg gap-2"
      >
        <Plus className="w-3.5 h-3.5" />
        Legg til måling
      </Button>
    </div>
  );
}
