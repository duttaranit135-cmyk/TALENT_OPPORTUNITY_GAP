import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Check authentication
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required. Please log in.');
    }

    const { id } = params;
    if (!id) {
      return notFoundResponse('Problem ID is required');
    }

    // 2. Fetch the selected problem with organization details
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    // 8. Return 404 if the problem does not exist
    if (!problem) {
      return notFoundResponse(`Problem with id '${id}' not found`);
    }

    // 3. Fetch the authenticated user's skills through SkillProof
    const userProofs = await prisma.skillProof.findMany({
      where: {
        userId: auth.user.id,
      },
      include: {
        skill: true,
      },
    });

    const userSkillNames = new Set(
      userProofs.map((p) => p.skill.name.toLowerCase().trim())
    );

    const requiredSkills = problem.requiredSkills ?? [];
    const skillOverlap: string[] = [];
    const skillGap: string[] = [];

    if (requiredSkills.length > 0) {
      for (const skill of requiredSkills) {
        if (userSkillNames.has(skill.toLowerCase().trim())) {
          skillOverlap.push(skill);
        } else {
          skillGap.push(skill);
        }
      }
    }

    const matchScore =
      requiredSkills.length > 0
        ? Math.round((skillOverlap.length / requiredSkills.length) * 100)
        : 0;

    // Upsert Match record
    try {
      await prisma.match.upsert({
        where: {
          userId_problemId: {
            userId: auth.user.id,
            problemId: problem.id,
          },
        },
        update: {
          matchScore,
          skillOverlap,
          skillGap,
        },
        create: {
          userId: auth.user.id,
          problemId: problem.id,
          matchScore,
          skillOverlap,
          skillGap,
        },
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json(
      {
        problem: {
          id: problem.id,
          title: problem.title,
          description: problem.description,
          organizationName: problem.organization.name,
          organizationType: problem.organization.type,
          organization: {
            id: problem.organization.id,
            name: problem.organization.name,
            type: problem.organization.type,
            description: problem.organization.description,
            website: problem.organization.website,
          },
          deadline: problem.deadline ? problem.deadline.toISOString() : null,
          commitmentType: problem.commitmentType,
          domainTags: problem.domainTags,
          requiredSkills: problem.requiredSkills,
          status: problem.status,
        },
        match: {
          matchScore,
          skillOverlap,
          skillGap,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching single problem:', error);
    return serverErrorResponse(error);
  }
}

