import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Creator token is required' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: true,
          },
        },
        attempts: {
          orderBy: { createdAt: 'desc' },
          include: {
            answers: {
              include: {
                question: true,
                selectedOption: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.creatorToken !== token) {
      return NextResponse.json({ error: 'Unauthorized invalid creator token' }, { status: 403 });
    }

    // Map attempts to include correct option text alongside selected option
    const processedAttempts = quiz.attempts.map((attempt) => {
      const detailedAnswers = attempt.answers.map((ans) => {
        const question = quiz.questions.find((q) => q.id === ans.questionId);
        const correctOption = question?.options.find((opt) => opt.isCorrect);

        return {
          id: ans.id,
          questionId: ans.questionId,
          questionText: ans.question?.text || question?.text || 'Unknown Question',
          selectedOptionText: ans.selectedOption?.text || 'No answer',
          correctOptionText: correctOption?.text || 'Unknown',
          isCorrect: ans.isCorrect,
        };
      });

      return {
        id: attempt.id,
        participantName: attempt.participantName,
        phone: attempt.phone,
        email: attempt.email,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        createdAt: attempt.createdAt,
        answers: detailedAnswers,
      };
    });

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        creatorName: quiz.creatorName,
        slug: quiz.slug,
        createdAt: quiz.createdAt,
      },
      attempts: processedAttempts,
    });
  } catch (error) {
    console.error('Error loading creator dashboard:', error);
    return NextResponse.json({ error: 'Failed to load creator dashboard' }, { status: 500 });
  }
}
