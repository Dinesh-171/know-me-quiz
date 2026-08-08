'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Users, Trophy, CheckCircle2, XCircle, ChevronRight, Phone, Mail, Clock, ArrowLeft, Loader2, BarChart2, ShieldAlert } from 'lucide-react';

interface AnswerDetail {
  id: string;
  questionId: string;
  questionText: string;
  selectedOptionText: string;
  correctOptionText: string;
  isCorrect: boolean;
}

interface Attempt {
  id: string;
  participantName: string;
  phone: string | null;
  email: string | null;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
  answers: AnswerDetail[];
}

interface QuizData {
  id: string;
  title: string;
  creatorName: string;
  slug: string;
  createdAt: string;
}

export default function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { quizId } = use(params);
  const { token } = use(searchParams);

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      // Check token from searchParams or fallback to localStorage
      let activeToken = token;
      if (!activeToken && typeof window !== 'undefined') {
        activeToken = localStorage.getItem(`creator_token_${quizId}`) || undefined;
      }

      if (!activeToken) {
        setError('Unauthorized: Private creator token missing.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/dashboard/${quizId}?token=${activeToken}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load creator responses');
        }
        const data = await res.json();
        setQuiz(data.quiz);
        setAttempts(data.attempts);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [quizId, token]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading responses dashboard...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 flex items-center justify-center text-2xl mb-4">
          <ShieldAlert className="w-8 h-8 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400 max-w-sm mb-6">{error || 'Invalid or missing creator key.'}</p>
        <Link href="/" className="gradient-button px-6 py-3 rounded-2xl font-bold text-white">
          Return Home →
        </Link>
      </div>
    );
  }

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts)
    : 0;

  // Format relative time helper
  function formatTime(isoString: string) {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mins ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
              Creator Dashboard
            </span>
            <span className="text-xs text-gray-400 font-mono">/{quiz.slug}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{quiz.title}</h1>
          <p className="text-xs text-gray-400 mt-1">Created by {quiz.creatorName}</p>
        </div>

        <Link
          href={`/quiz/${quiz.slug}/share`}
          className="glass-card hover:bg-white/10 px-4 py-2.5 rounded-2xl text-xs font-bold text-pink-300 border border-pink-500/30 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Share Quiz Link</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalAttempts}</div>
            <div className="text-xs text-gray-400 font-medium">Total Responses</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black gradient-text">{avgScore}%</div>
            <div className="text-xs text-gray-400 font-medium">Average Score</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center gap-4 col-span-2 sm:col-span-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {attempts.filter((a) => a.percentage >= 80).length}
            </div>
            <div className="text-xs text-gray-400 font-medium">High Scorers (≥80%)</div>
          </div>
        </div>
      </div>

      {/* Responses List Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Responses Log</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-pink-300">
              {totalAttempts}
            </span>
          </h2>
          <p className="text-xs text-gray-400">Click any friend to inspect their exact answers 👇</p>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 text-gray-500 flex items-center justify-center mx-auto text-xl">
              ⏳
            </div>
            <p className="text-sm font-semibold text-gray-300">No responses yet!</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Share your quiz link with friends on WhatsApp or Instagram to start collecting responses.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                onClick={() => setSelectedAttempt(attempt)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  selectedAttempt?.id === attempt.id
                    ? 'bg-pink-950/30 border-pink-500'
                    : 'bg-black/30 hover:bg-white/5 border-white/10'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-base">{attempt.participantName}</span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        attempt.percentage >= 80
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : attempt.percentage >= 50
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {attempt.score} / {attempt.totalQuestions} ({attempt.percentage}%)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    {attempt.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-pink-400" /> {attempt.phone}
                      </span>
                    )}
                    {attempt.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-purple-400" /> {attempt.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" /> {formatTime(attempt.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-pink-400">
                  <span>View Breakdown</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Itemized Answer Detail Modal / Drawer */}
      {selectedAttempt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-pink-500/30 space-y-6 bg-[#0f1523] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs font-semibold text-pink-400 uppercase tracking-wider">
                  Itemized Response Breakdown
                </div>
                <h3 className="text-2xl font-black text-white">{selectedAttempt.participantName}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>Score: <strong className="text-white">{selectedAttempt.score}/{selectedAttempt.totalQuestions} ({selectedAttempt.percentage}%)</strong></span>
                  {selectedAttempt.phone && <span>&bull; Phone: {selectedAttempt.phone}</span>}
                  {selectedAttempt.email && <span>&bull; Email: {selectedAttempt.email}</span>}
                </div>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Answer Breakdown Items */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                Detailed Answers ({selectedAttempt.answers.length}):
              </h4>

              {selectedAttempt.answers.map((ans, idx) => (
                <div
                  key={ans.id}
                  className={`p-4 rounded-2xl border space-y-2 transition ${
                    ans.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-red-950/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-gray-400">Q{idx + 1}.</span>
                    <h5 className="flex-1 font-bold text-sm text-white leading-snug">
                      {ans.questionText}
                    </h5>
                    {ans.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1 pt-1 pl-5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-medium">{selectedAttempt.participantName} answered:</span>
                      <span className={`font-bold ${ans.isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                        {ans.selectedOptionText}
                      </span>
                    </div>

                    {!ans.isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">Correct answer:</span>
                        <span className="font-bold text-emerald-400">{ans.correctOptionText}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedAttempt(null)}
              className="w-full gradient-button p-3.5 rounded-2xl text-white font-bold text-sm"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
