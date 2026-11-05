import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { unauthorizedResponse, serverErrorResponse } from '@/lib/errors';
import { ProblemStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // 1. Check authentication
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required. Please log in.');
    }

    // 2. Fetch all OPEN problems with organization
    const problems = await prisma.problem.findMany({
      where: {
        status: ProblemStatus.OPEN,
      },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Fetch the current user's skills through SkillProof
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

    // 4. Compare user skills against each problem's requiredSkills and compute scores
    const results = await Promise.all(
      problems.map(async (problem) => {
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

        // Formula: matchScore = (matchingSkills / totalRequiredSkills) * 100 rounded to nearest integer
        // If requiredSkills is empty, return matchScore of 0
        const matchScore =
          requiredSkills.length > 0
            ? Math.round((skillOverlap.length / requiredSkills.length) * 100)
            : 0;

        // Upsert record into Match model
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
          // Non-blocking in case of concurrent writes
        }

        return {
          id: problem.id,
          title: problem.title,
          description: problem.description,
          organizationName: problem.organization.name,
          organizationType: problem.organization.type,
          organizationId: problem.organizationId,
          requiredSkills,
          domainTags: problem.domainTags,
          deadline: problem.deadline ? problem.deadline.toISOString() : null,
          commitmentType: problem.commitmentType,
          status: problem.status,
          matchScore,
          skillOverlap,
          skillGap,
        };
      })
    );

    // 10. Sort results by matchScore descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error fetching problems:', error);
    return serverErrorResponse(error);
  }
}

