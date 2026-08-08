'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CheckCircle2, ArrowRight, Sparkles, HelpCircle, Loader2 } from 'lucide-react';

interface OptionInput {
  text: string;
  isCorrect: boolean;
}

interface QuestionInput {
  text: string;
  options: OptionInput[];
}

const DEFAULT_QUESTIONS: QuestionInput[] = [
  {
    text: "What's my favorite food?",
    options: [
      { text: "Biryani", isCorrect: true },
      { text: "Pizza", isCorrect: false },
      { text: "Burger", isCorrect: false },
      { text: "Sushi", isCorrect: false },
    ],
  },
  {
    text: "What do I do most in my free time?",
    options: [
      { text: "Gaming / Scrolling", isCorrect: true },
      { text: "Reading books", isCorrect: false },
      { text: "Binge watching shows", isCorrect: false },
      { text: "Sleeping 12 hours", isCorrect: false },
    ],
  },
  {
    text: "Where would I love to travel next?",
    options: [
      { text: "Japan", isCorrect: true },
      { text: "Bali", isCorrect: false },
      { text: "Paris", isCorrect: false },
      { text: "New York", isCorrect: false },
    ],
  },
  {
    text: "What's my biggest pet peeve?",
    options: [
      { text: "Slow Internet", isCorrect: true },
      { text: "People being late", isCorrect: false },
      { text: "Loud chewing", isCorrect: false },
      { text: "Unread notifications", isCorrect: false },
    ],
  },
  {
    text: "What's my overall personality vibe?",
    options: [
      { text: "Night Owl 🌙", isCorrect: true },
      { text: "Early Bird 🌅", isCorrect: false },
      { text: "Caffeine Addict ☕", isCorrect: false },
      { text: "Chaos & Good Energy ⚡", isCorrect: false },
    ],
  },
];

export default function CreateQuizPage() {
  const router = useRouter();
  const [creatorName, setCreatorName] = useState('');
  const [quizTitle, setQuizTitle] = useState('How Well Do You Know Me? 👀');
  const [questions, setQuestions] = useState<QuestionInput[]>(DEFAULT_QUESTIONS);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Question Text Edit
  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].text = text;
    setQuestions(updated);
  };

  // Handle Option Text Edit
  const handleOptionTextChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = text;
    setQuestions(updated);
  };

  // Select Correct Option
  const handleSelectCorrectOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === oIndex,
    }));
    setQuestions(updated);
  };

  // Add Option
  const handleAddOption = (qIndex: number) => {
    if (questions[qIndex].options.length >= 6) return;
    const updated = [...questions];
    updated[qIndex].options.push({ text: `Option ${updated[qIndex].options.length + 1}`, isCorrect: false });
    setQuestions(updated);
  };

  // Remove Option
  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    if (questions[qIndex].options.length <= 2) return;
    const updated = [...questions];
    const wasCorrect = updated[qIndex].options[oIndex].isCorrect;
    updated[qIndex].options.splice(oIndex, 1);
    if (wasCorrect && updated[qIndex].options.length > 0) {
      updated[qIndex].options[0].isCorrect = true;
    }
    setQuestions(updated);
  };

  // Add Question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: `Question ${questions.length + 1}`,
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
          { text: 'Option C', isCorrect: false },
          { text: 'Option D', isCorrect: false },
        ],
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  // Submit Quiz
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!creatorName.trim()) {
      setErrorMessage('Please enter your name!');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: creatorName.trim(),
          title: quizTitle.trim() || 'How Well Do You Know Me? 👀',
          questions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create quiz');
      }

      // Store in localStorage for quick creator session fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem(`creator_token_${data.quizId}`, data.creatorToken);
      }

      router.push(`/quiz/${data.slug}/share?token=${data.creatorToken}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMessage(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold mb-3 border border-pink-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 2: Create Quiz</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Create Your <span className="gradient-text">Personal Quiz</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Set up questions about yourself & select the correct answer for each!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Creator Info Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
          <h2 className="text-lg font-bold flex items-center gap-2 text-pink-300">
            <HelpCircle className="w-5 h-5 text-pink-400" />
            Basic Info
          </h2>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              Your Name <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dinesh"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              Quiz Title
            </label>
            <input
              type="text"
              placeholder="How Well Do You Know Me? 👀"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-base"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-200">
              Questions ({questions.length})
            </h2>
            <span className="text-xs text-pink-400 font-medium">
              💡 Tap radio to set correct answer
            </span>
          </div>

          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10 relative group transition hover:border-white/20"
            >
              {/* Question Number & Delete */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Question {qIndex + 1}
                </span>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Question Text */}
              <input
                type="text"
                required
                value={q.text}
                onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                placeholder="Enter question text..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white font-medium focus:outline-none focus:border-pink-500 transition text-base"
              />

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-semibold text-gray-400">
                  Options (Select green check for correct answer):
                </label>

                {q.options.map((opt, oIndex) => (
                  <div
                    key={oIndex}
                    className={`flex items-center gap-3 p-2 rounded-2xl border transition ${
                      opt.isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/50'
                        : 'bg-black/20 border-white/5'
                    }`}
                  >
                    {/* Correct Radio Selector */}
                    <button
                      type="button"
                      onClick={() => handleSelectCorrectOption(qIndex, oIndex)}
                      className={`p-2 rounded-xl transition flex items-center justify-center ${
                        opt.isCorrect
                          ? 'text-emerald-400 bg-emerald-500/20'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                      }`}
                      title={opt.isCorrect ? 'Correct Answer' : 'Mark as Correct Answer'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    {/* Option Text */}
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none"
                    />

                    {/* Remove Option Button */}
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Option Button */}
                {q.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => handleAddOption(qIndex)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold px-3 py-1.5 rounded-xl border border-purple-500/20 hover:bg-purple-500/10 transition mt-2 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full glass-card hover:bg-white/10 p-4 rounded-3xl border border-dashed border-white/20 text-gray-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-5 h-5 text-pink-400" />
            <span>Add Another Question</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Submit CTA */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full gradient-button p-4 rounded-3xl text-white font-bold text-lg shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition"
          >
            {submitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Creating Your Quiz...</span>
              </>
            ) : (
              <>
                <span>Create Quiz & Get Share Link</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
