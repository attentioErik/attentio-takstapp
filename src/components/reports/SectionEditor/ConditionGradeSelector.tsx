'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CONDITION_GRADES } from '@/lib/constants';
import { ConditionGrade } from '@/types';

interface ConditionGradeSelectorProps {
  value: ConditionGrade | null | undefined;
  onChange: (grade: ConditionGrade) => void;
  disabled?: boolean;
}

export function ConditionGradeSelector({ value, onChange, disabled }: ConditionGradeSelectorProps) {
  const grades = Object.entries(CONDITION_GRADES) as [ConditionGrade, typeof CONDITION_GRADES[ConditionGrade]][];

  return (
    <div className="flex flex-wrap gap-2">
      {grades.map(([grade, config]) => {
        const isSelected = value === grade;
        return (
          <motion.button
            key={grade}
            type="button"
            disabled={disabled}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(grade)}
            className={cn(
              'flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer',
              'text-left min-w-[100px]',
              isSelected
                ? `${config.bgClass} ${config.textClass} ${config.borderClass} shadow-sm`
                : 'border-transparent bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className={cn('text-sm font-bold', isSelected ? config.textClass : '')}>
              {config.label}
            </span>
            <span className="text-xs opacity-80 leading-tight">{config.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
