'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface MatchScoreBadgeProps {
  score: number;
}

export function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  let colorClass = 'bg-red-100 text-red-800 border-red-200';
  if (score >= 70) {
    colorClass = 'bg-green-100 text-green-800 border-green-200';
  } else if (score >= 40) {
    colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }

  return (
    <Badge
      variant="outline"
      className={`text-sm font-semibold px-3 py-1 ${colorClass}`}
    >
      {score}% Match
    </Badge>
  );
}

export default MatchScoreBadge;
