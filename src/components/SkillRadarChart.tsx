'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SkillRadarChartProps {
  requiredSkills: string[];
  userScores: Record<string, number>;
}

export function SkillRadarChart({
  requiredSkills,
  userScores,
}: SkillRadarChartProps) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return (
      <div className="text-gray-400 text-center py-10">
        No skill data available
      </div>
    );
  }

  const data = requiredSkills.map((skill) => ({
    skill: skill,
    required: 100,
    yours: userScores[skill] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name="Required"
          dataKey="required"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Radar
          name="Your Skills"
          dataKey="yours"
          stroke="#16A34A"
          fill="#16A34A"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default SkillRadarChart;
