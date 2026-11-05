import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateOutreachSchema } from '@/lib/validations';
import {
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
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

    const validationResult = generateOutreachSchema.safeParse(body);
    if (!validationResult.success) {
      return badRequestResponse(
        'Validation failed',
        validationResult.error.flatten().fieldErrors
      );
    }

    const { problemId, tone } = validationResult.data;

    // 3. Fetch the problem and organization
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        organization: true,
      },
    });

    if (!problem) {
      return notFoundResponse(`Problem with id '${problemId}' not found`);
    }

    const org = problem.organization;

    // 4. Fetch authenticated user details
    const user = auth.user;
    const userName = user.name || 'Student';
    const userMajor = user.major || 'Computer Science';
    const userUniversity = user.university || 'university';

    // 5. Fetch the user's top skills using SkillProof
    const userProofs = await prisma.skillProof.findMany({
      where: { userId: user.id },
      include: { skill: true },
      orderBy: { confidenceScore: 'desc' },
    });

    const userSkillNames = Array.from(
      new Set(userProofs.map((p) => p.skill.name))
    );

    // Prioritize skills that overlap with the problem's required skills
    const overlappingSkills = userSkillNames.filter((s) =>
      problem.requiredSkills.includes(s)
    );
    const nonOverlappingSkills = userSkillNames.filter(
      (s) => !problem.requiredSkills.includes(s)
    );
    const topSkillsList = [...overlappingSkills, ...nonOverlappingSkills].slice(0, 3);
    const topSkills =
      topSkillsList.length > 0
        ? topSkillsList
        : ['problem solving', 'technical implementation'];

    // 6. Generate email using predefined TypeScript string templates
    let subjectLine = '';
    let emailBody = '';

    if (tone === 'formal') {
      subjectLine = `Application: ${problem.title} — ${userName}`;
      emailBody = `Dear ${org.name} Team,

My name is ${userName} and I am a ${userMajor} student at ${userUniversity}. I am writing to express my interest in your project: ${problem.title}.

My relevant skills include ${topSkills.join(', ')}. I believe these align well with your requirements.

I would welcome the opportunity to discuss how I can contribute to solving this problem.

Best regards,
${userName}`;
    } else if (tone === 'casual') {
      subjectLine = `Hey ${org.name}! I'd love to help with ${problem.title}`;
      emailBody = `Hi there!

I'm ${userName}, a ${userMajor} student at ${userUniversity}. I came across your project '${problem.title}' and it sounds like something I'd be great at.

I've got experience with ${topSkills.join(', ')} and I'd love to chat about how I can help.

Let me know if you're free for a quick call!

Cheers,
${userName}`;
    } else if (tone === 'enthusiastic') {
      subjectLine = `Super excited about ${problem.title}! 🚀`;
      emailBody = `Hello ${org.name} team!

I'm ${userName} from ${userUniversity} and I am incredibly excited about your project '${problem.title}'!

With my skills in ${topSkills.join(', ')}, I'm confident I can make a real impact on this problem.

I'd love to jump on a call and share some ideas I already have!

Looking forward to hearing from you!

${userName}`;
    }

    // 7. Store the draft in OutreachDraft
    const draft = await prisma.outreachDraft.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        tone,
        subjectLine,
        body: emailBody,
      },
    });

    // 8. Return the generated draft
    return NextResponse.json(
      {
        id: draft.id,
        subjectLine: draft.subjectLine,
        body: draft.body,
        tone: draft.tone,
        problemId: draft.problemId,
        createdAt: draft.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating outreach email:', error);
    return serverErrorResponse(error);
  }
}

