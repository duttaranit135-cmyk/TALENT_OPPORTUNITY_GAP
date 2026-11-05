'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink } from 'lucide-react';

interface ActionPlanCardProps {
  skill: string;
  url: string;
  description: string;
  minutes: number;
  scoreBoost: number;
}

export function ActionPlanCard({
  skill,
  url,
  description,
  minutes,
  scoreBoost,
}: ActionPlanCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">{skill}</span>
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 font-medium"
        >
          +{scoreBoost}% match
        </Badge>
      </div>

      <p className="text-sm text-gray-600 mt-1">{description}</p>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center text-xs text-gray-400">
          <Clock size={14} className="mr-1" />
          <span>{minutes} min</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            Start Learning
            <ExternalLink size={14} className="ml-1" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

export default ActionPlanCard;
