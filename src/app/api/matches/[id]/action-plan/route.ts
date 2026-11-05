import { NextResponse } from 'next/server';
import { getProblems } from '@/lib/problemData';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const problems = getProblems();
  const problem = problems.find((p) => p.id === id) || problems[0];

  const gapSkills = problem?.skillGap || ['Data Visualization', 'SQL'];

  const steps = gapSkills.map((skill, index) => {
    return {
      skill,
      url: 'https://github.com/topics/' + encodeURIComponent(skill.toLowerCase().replace(/\s+/g, '-')),
      description: `Complete an intensive 1-hour workshop and interactive project in ${skill}.`,
      minutes: 30 + index * 15,
      predictedScoreBoost: 10 + index * 5,
    };
  });

  return NextResponse.json({ steps });
}

