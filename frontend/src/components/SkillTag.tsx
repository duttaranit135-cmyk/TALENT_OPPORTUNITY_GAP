'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SkillTagProps {
  name: string;
  variant: 'match' | 'gap';
}

export function SkillTag({ name, variant }: SkillTagProps) {
  const variantClass =
    variant === 'match'
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-red-50 text-red-700 border border-red-200';

  return (
    <Badge
      variant="outline"
      className={`text-xs px-2 py-0.5 ${variantClass}`}
    >
      {name}
    </Badge>
  );
}

export default SkillTag;
