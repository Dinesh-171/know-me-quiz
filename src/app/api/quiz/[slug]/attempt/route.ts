import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { participantName, phone, email, answers } = body;

    if (!participantName || !participantName.trim()) {
      return NextResponse.json({ error: 'Participant name is required' }, { status: 400 });
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { slug },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;

    // Process each answer & compare against DB ground truth
    const answerRecordsToCreate: Array<{
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
    }> = [];

    for (const q of quiz.questions) {
      const submittedAnswer = answers.find((a: { questionId: string }) => a.questionId === q.id);
      const selectedOptionId = submittedAnswer ? submittedAnswer.selectedOptionId : '';
      const selectedOption = q.options.find((opt) => opt.id === selectedOptionId);

      const isCorrect = selectedOption ? Boolean(selectedOption.isCorrect) : false;
      if (isCorrect) {
        score += 1;
      }

      answerRecordsToCreate.push({
        questionId: q.id,
        selectedOptionId: selectedOptionId || q.options[0]?.id || '',
        isCorrect,
      });
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Save Attempt and Answer records
    const attempt = await prisma.attempt.create({
      data: {
        quizId: quiz.id,
        participantName: participantName.trim(),
        phone: phone && phone.trim() ? phone.trim() : null,
        email: email && email.trim() ? email.trim() : null,
        score,
        totalQuestions,
        percentage,
        answers: {
          create: answerRecordsToCreate,
        },
      },
      include: {
        answers: true,
      },
    });

    // Dynamic result message
    let message = '';
    if (percentage >= 90) {
      message = '🧠 Okay, you basically know them better than they know themselves.';
    } else if (percentage >= 70) {
      message = "👀 Not bad. You actually know them pretty well.";
    } else if (percentage >= 50) {
      message = "😂 You know them... but there's room for improvement.";
    } else {
      message = "💀 We need to have a conversation about this friendship.";
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      totalQuestions,
      percentage,
      message,
      creatorName: quiz.creatorName,
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json({ error: 'Failed to submit quiz attempt' }, { status: 500 });
  }
}
