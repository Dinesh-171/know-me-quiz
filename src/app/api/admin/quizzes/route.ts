import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    const totalAttempts = await prisma.attempt.count();

    return NextResponse.json({
      quizzes: quizzes.map((q) => ({
        id: q.id,
        creatorName: q.creatorName,
        title: q.title,
        slug: q.slug,
        creatorToken: q.creatorToken,
        createdAt: q.createdAt,
        questionCount: q._count.questions,
        attemptCount: q._count.attempts,
      })),
      totalQuizzes: quizzes.length,
      totalAttempts,
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin quizzes' }, { status: 500 });
  }
}
