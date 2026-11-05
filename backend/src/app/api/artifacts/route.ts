import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { createArtifactSchema } from '@/lib/validations';
import {
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    // 1. Check Supabase authentication
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required. Please log in.');
    }

    // 2. Validate request body using Zod
    let body: any;
    try {
      body = await req.json();
    } catch {
      return badRequestResponse('Invalid JSON body');
    }

    const validationResult = createArtifactSchema.safeParse(body);
    if (!validationResult.success) {
      return badRequestResponse(
        'Validation failed',
        validationResult.error.flatten().fieldErrors
      );
    }

    const { type, url, description, skillNames } = validationResult.data;

    // Deduplicate submitted skill names
    const uniqueSkillNames = Array.from(new Set(skillNames.map((s) => s.trim())));

    // 3. Verify that submitted skills exist in the Skill database
    const existingSkills = await prisma.skill.findMany({
      where: {
        name: { in: uniqueSkillNames },
      },
    });

    if (existingSkills.length !== uniqueSkillNames.length) {
      const foundNames = new Set(existingSkills.map((s) => s.name));
      const missingSkills = uniqueSkillNames.filter((s) => !foundNames.has(s));
      return badRequestResponse(
        `The following skills do not exist in the predefined skill database: ${missingSkills.join(', ')}`
      );
    }

    // 4. Use Prisma transaction to create Artifact and SkillProof records
    const result = await prisma.$transaction(async (tx) => {
      // Create Artifact belonging to authenticated user
      const artifact = await tx.artifact.create({
        data: {
          userId: auth.user.id,
          type,
          url: url || null,
          description: description || null,
        },
      });

      // Create SkillProof records for each selected skill
      for (const skill of existingSkills) {
        await tx.skillProof.upsert({
          where: {
            userId_skillId_artifactId: {
              userId: auth.user.id,
              skillId: skill.id,
              artifactId: artifact.id,
            },
          },
          update: {
            confidenceScore: 80,
            source: 'SELF_REPORTED',
          },
          create: {
            userId: auth.user.id,
            skillId: skill.id,
            artifactId: artifact.id,
            confidenceScore: 80,
            source: 'SELF_REPORTED',
          },
        });
      }

      return artifact;
    });

    return NextResponse.json(
      {
        artifact: result,
        skills: existingSkills.map((s) => s.name),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating artifact:', error);
    return serverErrorResponse(error);
  }
}

