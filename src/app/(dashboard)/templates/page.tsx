'use client';

import { motion } from 'framer-motion';
import { BookTemplate, Plus, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUILDING_SECTION_CATEGORIES } from '@/lib/constants';

export default function TemplatesPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Maler</h1>
          <p className="text-muted-foreground mt-1">Forhåndsdefinerte seksjonsmaler for effektiv rapportskriving</p>
        </div>
        <Button className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Ny mal
        </Button>
      </div>

      {/* Default section templates */}
      <div>
        <h2 className="font-semibold mb-4">Standardseksjoner (NS 3600)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILDING_SECTION_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                {category.required && (
                  <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Obligatorisk
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Standardmal for {category.name.toLowerCase()}
              </p>
              <div className="flex items-center text-xs text-primary gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Bruk mal <ArrowRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Coming soon */}
      <div className="bg-card rounded-2xl border p-8 text-center">
        <BookTemplate className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Egne maler kommer snart</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Du vil snart kunne opprette og lagre egne maler med forhåndsfylte tekster,
          tilstandsgrader og sjekklister for dine vanligste inspeksjonstyper.
        </p>
      </div>
    </motion.div>
  );
}
