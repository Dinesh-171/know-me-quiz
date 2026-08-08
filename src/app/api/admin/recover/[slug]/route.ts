import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const quiz = await prisma.quiz.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        creatorName: true,
        slug: true,
        creatorToken: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Token recovery error:', error);
    return NextResponse.json({ error: 'Failed to recover token' }, { status: 500 });
  }
}
