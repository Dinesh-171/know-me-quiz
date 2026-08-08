import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample quiz data...');

  const sampleSlug = 'sample123';
  const creatorToken = 'creator-token-dinesh-123';

  // Cleanup existing sample if present
  await prisma.quiz.deleteMany({
    where: { slug: sampleSlug },
  });

  const quiz = await prisma.quiz.create({
    data: {
      creatorName: 'Dinesh',
      title: 'How Well Do You Know Me? 👀',
      slug: sampleSlug,
      creatorToken,
      questions: {
        create: [
          {
            text: "What's my favorite food?",
            order: 1,
            options: {
              create: [
                { text: 'Biryani', isCorrect: true },
                { text: 'Pizza', isCorrect: false },
                { text: 'Burger', isCorrect: false },
                { text: 'Sushi', isCorrect: false },
              ],
            },
          },
          {
            text: 'What do I do in my free time?',
            order: 2,
            options: {
              create: [
                { text: 'Gaming / Scrolling', isCorrect: true },
                { text: 'Reading books', isCorrect: false },
                { text: 'Binge watching shows', isCorrect: false },
                { text: 'Sleeping 12 hours', isCorrect: false },
              ],
            },
          },
          {
            text: 'Where would I like to travel?',
            order: 3,
            options: {
              create: [
                { text: 'Japan', isCorrect: true },
                { text: 'Bali', isCorrect: false },
                { text: 'Paris', isCorrect: false },
                { text: 'New York', isCorrect: false },
              ],
            },
          },
          {
            text: "What's my biggest pet peeve?",
            order: 4,
            options: {
              create: [
                { text: 'Slow Internet', isCorrect: true },
                { text: 'People being late', isCorrect: false },
                { text: 'Loud chewing', isCorrect: false },
                { text: 'Unread notifications', isCorrect: false },
              ],
            },
          },
          {
            text: "What's my personality like?",
            order: 5,
            options: {
              create: [
                { text: 'Night Owl 🌙', isCorrect: true },
                { text: 'Early Bird 🌅', isCorrect: false },
                { text: 'Caffeine Addict ☕', isCorrect: false },
                { text: 'Chaos & Good Energy ⚡', isCorrect: false },
              ],
            },
          },
        ],
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

  console.log(`Sample Quiz Created!`);
  console.log(`Public URL: http://localhost:3000/quiz/${quiz.slug}`);
  console.log(`Creator Dashboard URL: http://localhost:3000/dashboard/${quiz.id}?token=${creatorToken}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
