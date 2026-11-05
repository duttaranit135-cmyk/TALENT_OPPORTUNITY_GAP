import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/errors';
import { getResourceForSkill } from '@/lib/constants';

export async function GET(
  req: NextRequest,
  { params }: { params: { problemId: string } }
) {
  try {
    // 1. Check authentication
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required. Please log in.');
    }

    const { problemId } = params;
    if (!problemId) {
      return notFoundResponse('Problem ID is required');
    }

    // 2. Fetch the problem
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return notFoundResponse(`Problem with id '${problemId}' not found`);
    }

    const requiredSkills = problem.requiredSkills ?? [];
    if (requiredSkills.length === 0) {
      return NextResponse.json({ steps: [] }, { status: 200 });
    }

    // 3. Fetch the authenticated user's skills through SkillProof
    const userProofs = await prisma.skillProof.findMany({
      where: { userId: auth.user.id },
      include: { skill: true },
    });

    const userSkillNames = new Set(
      userProofs.map((p) => p.skill.name.toLowerCase().trim())
    );

    // 4. Calculate missing skills (skillGap)
    const missingSkills = requiredSkills.filter(
      (skill) => !userSkillNames.has(skill.toLowerCase().trim())
    );

    // 5. Calculate predictedScoreBoost
    // Formula: Math.round(100 / totalRequiredSkills)
    const totalRequiredSkills = requiredSkills.length;
    const predictedScoreBoost =
      totalRequiredSkills > 0 ? Math.round(100 / totalRequiredSkills) : 0;

    // 6. Map missing skills to predefined learning resources
    const steps = missingSkills.map((skill) => {
      const resource = getResourceForSkill(skill);
      return {
        skill,
        url: resource.url,
        description: resource.description,
        minutes: resource.minutes,
        predictedScoreBoost,
      };
    });

    return NextResponse.json({ steps }, { status: 200 });
  } catch (error) {
    console.error('Error generating action plan:', error);
    return serverErrorResponse(error);
  }
}

