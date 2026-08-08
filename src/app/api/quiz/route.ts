import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Generate short random slug like 'a8K29x'
function generateSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { creatorName, title, questions } = body;

    if (!creatorName || !creatorName.trim()) {
      return NextResponse.json({ error: 'Creator name is required' }, { status: 400 });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'At least one question is required' }, { status: 400 });
    }

    // Validate each question has at least 2 options and 1 correct option
    for (const q of questions) {
      if (!q.text || !q.text.trim()) {
        return NextResponse.json({ error: 'All questions must have text' }, { status: 400 });
      }
      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json({ error: 'Each question must have at least 2 options' }, { status: 400 });
      }
      const hasCorrect = q.options.some((opt: { isCorrect?: boolean }) => opt.isCorrect);
      if (!hasCorrect) {
        return NextResponse.json({ error: 'Each question must have one correct answer selected' }, { status: 400 });
      }
    }

    let slug = generateSlug();
    // Ensure slug uniqueness
    let existing = await prisma.quiz.findUnique({ where: { slug } });
    let attempts = 0;
    while (existing && attempts < 5) {
      slug = generateSlug();
      existing = await prisma.quiz.findUnique({ where: { slug } });
      attempts++;
    }

    const creatorToken = crypto.randomUUID();

    const quiz = await prisma.quiz.create({
      data: {
        creatorName: creatorName.trim(),
        title: (title && title.trim()) ? title.trim() : 'How Well Do You Know Me? 👀',
        slug,
        creatorToken,
        questions: {
          create: questions.map((q: { text: string; options: { text: string; isCorrect: boolean }[] }, qIndex: number) => ({
            text: q.text.trim(),
            order: qIndex + 1,
            options: {
              create: q.options.map((opt: { text: string; isCorrect: boolean }) => ({
                text: opt.text.trim(),
                isCorrect: Boolean(opt.isCorrect),
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      slug: quiz.slug,
      creatorToken: quiz.creatorToken,
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}
