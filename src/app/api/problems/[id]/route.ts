import { NextResponse } from 'next/server';
import { getProblems } from '@/lib/problemData';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const problems = getProblems();
  const found = problems.find((p) => p.id === id) || problems[0];

  if (!found) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  const problemDetail = {
    problem: {
      id: found.id,
      title: found.title,
      description: found.description,
      organizationName: found.organizationName,
      organizationType: found.organizationType,
      deadline: found.deadline,
      commitmentType: found.commitmentType,
      domainTags: found.domainTags,
      requiredSkills: found.requiredSkills,
    },
    match: {
      matchScore: found.matchScore,
      skillOverlap: found.skillOverlap,
      skillGap: found.skillGap,
    },
  };

  return NextResponse.json(problemDetail);
}
