import { cn } from '@/lib/utils';
import { CONDITION_GRADES } from '@/lib/constants';
import { ConditionGrade } from '@/types';

interface TGBadgeProps {
  grade: ConditionGrade;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function TGBadge({ grade, count, size = 'md', showName = false }: TGBadgeProps) {
  const config = CONDITION_GRADES[grade];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold border rounded-full',
        config.bgClass,
        config.textClass,
        config.borderClass,
        size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2.5 py-0.5'
      )}
    >
      {config.label}
      {count !== undefined && <span className="opacity-70">×{count}</span>}
      {showName && <span className="font-normal">{config.name}</span>}
    </span>
  );
}

interface TGDistributionProps {
  sections: Array<{ conditionGrade?: string | null }>;
}

export function TGDistributionBadges({ sections }: TGDistributionProps) {
  const counts = sections.reduce(
    (acc, s) => {
      const grade = s.conditionGrade as ConditionGrade | undefined;
      if (grade) acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    },
    {} as Record<ConditionGrade, number>
  );

  const grades: ConditionGrade[] = ['TG0', 'TG1', 'TG2', 'TG3', 'TGIU'];

  return (
    <div className="flex flex-wrap gap-1">
      {grades.map((grade) => {
        const count = counts[grade] || 0;
        if (count === 0) return null;
        return <TGBadge key={grade} grade={grade} count={count} size="sm" />;
      })}
    </div>
  );
}
