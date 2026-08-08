'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, UserCheck, Loader2, Trophy, Share2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  order: number;
  options: Option[];
}

interface QuizData {
  id: string;
  title: string;
  creatorName: string;
  questions: Question[];
}

export default function PublicQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<QuizData | null>(null);

  // Flow State: 'landing' | 'details' | 'quiz' | 'submitting' | 'result'
  const [step, setStep] = useState<'landing' | 'details' | 'quiz' | 'submitting' | 'result'>('landing');

  // Participant Form
  const [participantName, setParticipantName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Quiz Progress
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { questionId: selectedOptionId }

  // Result Data
  const [resultData, setResultData] = useState<{
    score: number;
    totalQuestions: number;
    percentage: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quiz/${slug}`);
        if (!res.ok) {
          throw new Error('Quiz not found or link expired');
        }
        const data = await res.json();
        setQuiz(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [slug]);

  // Handle Option Select
  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Next Question
  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  // Back Question
  const handleBackQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    }
  };

  // Submit Quiz Server-side
  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    setStep('submitting');

    const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));

    try {
      const res = await fetch(`/api/quiz/${slug}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: participantName.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quiz');
      }

      setResultData({
        score: data.score,
        totalQuestions: data.totalQuestions,
        percentage: data.percentage,
        message: data.message,
      });

      setStep('result');

      // Trigger Confetti if high score
      if (data.percentage >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting quiz');
      setStep('quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading Quiz...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 flex items-center justify-center text-2xl mb-4">
          😅
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Oops! Quiz Not Found</h2>
        <p className="text-gray-400 max-w-sm mb-6">{error || 'This quiz link might be invalid or removed.'}</p>
        <Link href="/create" className="gradient-button px-6 py-3 rounded-2xl font-bold text-white">
          Create Your Own Quiz →
        </Link>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQIndex];
  const isLastQuestion = currentQIndex === quiz.questions.length - 1;
  const isOptionSelected = Boolean(currentQuestion && selectedAnswers[currentQuestion.id]);

  return (
    <div className="flex-1 max-w-xl mx-auto w-full px-4 py-8 flex flex-col justify-between">
      {/* 1. QUIZ LANDING STEP */}
      {step === 'landing' && (
        <div className="my-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl gradient-bg mx-auto flex items-center justify-center text-4xl shadow-xl shadow-pink-500/30 animate-float">
            👀
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-300 text-xs font-semibold border border-pink-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Quiz by {quiz.creatorName}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            How Well Do You Know <span className="gradient-text">{quiz.creatorName}? 👀</span>
          </h1>

          <p className="text-gray-400 text-base max-w-sm mx-auto">
            Answer {quiz.questions.length} questions to test your friendship score!
          </p>

          <button
            onClick={() => setStep('details')}
            className="w-full gradient-button p-4 rounded-3xl text-white font-bold text-lg shadow-xl flex items-center justify-center gap-2 mt-8"
          >
            <span>Start Quiz</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 2. PARTICIPANT DETAILS STEP */}
      {step === 'details' && (
        <div className="my-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">First, tell us who you are 👋</h2>
            <p className="text-xs text-gray-400">So {quiz.creatorName} knows who scored what!</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (participantName.trim()) setStep('quiz');
            }}
            className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Your Name <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name..."
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition text-base"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Phone Number <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email Address <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!participantName.trim()}
              className="w-full gradient-button p-4 rounded-2xl text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 pt-4 disabled:opacity-50"
            >
              <span>Let&apos;s Go →</span>
            </button>
          </form>
        </div>
      )}

      {/* 3. QUIZ QUESTIONS STEP */}
      {step === 'quiz' && currentQuestion && (
        <div className="my-auto flex flex-col justify-between space-y-6">
          {/* Header Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
              <span>Question {currentQIndex + 1} of {quiz.questions.length}</span>
              <span className="text-pink-400 font-bold">{Math.round(((currentQIndex + 1) / quiz.questions.length) * 100)}%</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/5">
              <div
                className="h-full gradient-bg transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 min-h-[300px] flex flex-col justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {currentQuestion.text}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                    className={`w-full p-4 rounded-2xl font-semibold text-left text-base flex items-center justify-between border transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-900/50 to-purple-900/50 border-pink-500 text-white shadow-lg shadow-pink-500/10 translate-x-1'
                        : 'bg-black/30 hover:bg-white/5 border-white/10 text-gray-200'
                    }`}
                  >
                    <span>{option.text}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-pink-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            {currentQIndex > 0 && (
              <button
                type="button"
                onClick={handleBackQuestion}
                className="glass-card hover:bg-white/10 p-4 rounded-2xl text-gray-300 font-bold text-sm flex items-center justify-center gap-1 border border-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            <button
              type="button"
              disabled={!isOptionSelected}
              onClick={handleNextQuestion}
              className="flex-1 gradient-button p-4 rounded-2xl text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-40 transition"
            >
              <span>{isLastQuestion ? 'Finish Quiz' : 'Next Question'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. SUBMITTING STATE */}
      {step === 'submitting' && (
        <div className="my-auto text-center space-y-4 py-12">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
          <h3 className="text-xl font-bold">Calculating Your Score...</h3>
          <p className="text-xs text-gray-400">Verifying answers with {quiz.creatorName}&apos;s key...</p>
        </div>
      )}

      {/* 5. RESULT STEP */}
      {step === 'result' && resultData && (
        <div className="my-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl gradient-bg mx-auto flex items-center justify-center text-4xl shadow-xl shadow-pink-500/30">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-pink-400">
              Quiz Result for {participantName}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black gradient-text">
              {resultData.score} / {resultData.totalQuestions}
            </h2>
            <div className="text-lg font-bold text-gray-300">
              {resultData.percentage}% Correct
            </div>
          </div>

          {/* Reaction Box */}
          <div className="glass-panel p-6 rounded-3xl border border-pink-500/30 bg-gradient-to-b from-pink-950/20 to-purple-950/20">
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {resultData.message}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => {
                const msg = `I scored ${resultData.score}/${resultData.totalQuestions} (${resultData.percentage}%) on ${quiz.creatorName}'s quiz! 😂 👀`;
                if (navigator.share) {
                  navigator.share({ title: quiz.title, text: msg, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(msg + ' ' + window.location.href);
                  alert('Result text copied to clipboard!');
                }
              }}
              className="w-full gradient-button p-4 rounded-2xl text-white font-bold text-base shadow-xl flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" /> Share Result
            </button>

            <Link
              href="/create"
              className="block w-full glass-card hover:bg-white/10 p-4 rounded-2xl text-pink-300 font-bold text-base border border-pink-500/30 transition text-center"
            >
              Create Your Own Quiz →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
