import { NextResponse } from 'next/server';
import { getProblems } from '@/lib/problemData';

export async function POST(request: Request) {
  try {
    const { problemId, tone } = await request.json();
    const problems = getProblems();
    const problem = problems.find((p) => p.id === problemId) || problems[0];

    const title = problem ? problem.title : 'Community Project';
    const org = problem ? problem.organizationName : 'Organization';

    let subjectLine = `Student Collaboration Inquiry: ${title}`;
    let body = '';

    if (tone === 'enthusiastic') {
      subjectLine = `Excited to help with: ${title}! 🚀`;
      body = `Hi ${org} Team!\n\nI just came across your project "${title}" and I am incredibly excited about the impact you are making. My background in ${problem?.skillOverlap?.join(', ') || 'software engineering'} matches your goals, and I would love the opportunity to contribute right away!\n\nI have previously worked on similar technical challenges and look forward to learning more about how I can help.\n\nBest regards,\nCandidate`;
    } else if (tone === 'casual') {
      subjectLine = `Quick note regarding ${title}`;
      body = `Hey ${org} Team,\n\nI saw your post about "${title}" and wanted to reach out. I have experience working with ${problem?.skillOverlap?.join(', ') || 'the requested stack'} and would love to chat briefly about collaborating.\n\nLet me know if you have time for a quick 10-minute sync this week!\n\nCheers,\nCandidate`;
    } else {
      // Formal default
      subjectLine = `Expression of Interest: ${title} - ${org}`;
      body = `Dear Hiring Team at ${org},\n\nI am writing to express my formal interest in contributing to the "${title}" initiative. Based on the requirements outlined, my competencies in ${problem?.skillOverlap?.join(', ') || 'the specified technologies'} align closely with your team's objectives.\n\nI would welcome the opportunity to discuss how my skill set can support your organization's goals.\n\nSincerely,\nCandidate`;
    }

    return NextResponse.json({
      id: `draft-${Date.now()}`,
      subjectLine,
      body,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to generate outreach email' },
      { status: 500 }
    );
  }
}

