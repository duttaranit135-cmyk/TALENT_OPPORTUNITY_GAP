import { NextResponse } from 'next/server';
import { getProblems, addProblem } from '@/lib/problemData';

export async function GET() {
  const problems = getProblems();
  return NextResponse.json(problems);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addProblem(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Invalid payload' },
      { status: 400 }
    );
  }
}
