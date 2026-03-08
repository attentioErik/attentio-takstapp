'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, MapPin, Calendar, ChevronRight, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface Inspection {
  id: string;
  address: string;
  propertyType: string | null;
  status: string | null;
  inspectionDate: string | null;
  createdAt: string | null;
}

export default function BefaringListPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inspections')
      .then((r) => r.json())
      .then(({ inspections }) => setInspections(inspections || []))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl border p-5 animate-pulse">
            <div className="h-5 w-48 bg-muted rounded mb-2" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Befaringer</h1>
          <p className="text-muted-foreground text-sm mt-1">Feltnotater fra befaringer</p>
        </div>
        <Link href="/befaring/ny">
          <Button className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Ny befaring
          </Button>
        </Link>
      </div>

      {inspections.length === 0 ? (
        <div className="bg-card rounded-2xl border p-12 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium">Ingen befaringer ennå</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Start en ny befaring for å ta notater i felt</p>
          <Link href="/befaring/ny">
            <Button className="rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              Start første befaring
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <Link key={inspection.id} href={`/befaring/${inspection.id}`}>
              <motion.div
                whileHover={{ x: 2 }}
                className="bg-card rounded-2xl border p-5 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="space-y-1.5">
                  <p className="font-semibold">{inspection.address}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {inspection.inspectionDate ? formatDate(inspection.inspectionDate) : '–'}
                    </span>
                    {inspection.propertyType && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {inspection.propertyType}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={inspection.status === 'completed' ? 'secondary' : 'default'} className="rounded-full">
                    {inspection.status === 'completed' ? 'Fullført' : 'Pågår'}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
