import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      id: `artifact-${Date.now()}`,
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to upload artifact' },
      { status: 400 }
    );
  }
}

