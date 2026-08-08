'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Users, HelpCircle, ExternalLink, BarChart3, Search, Loader2, Sparkles, Clock } from 'lucide-react';

interface AdminQuiz {
  id: string;
  creatorName: string;
  title: string;
  slug: string;
  creatorToken: string;
  createdAt: string;
  questionCount: number;
  attemptCount: number;
}

export default function AdminOverviewPage() {
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const res = await fetch('/api/admin/quizzes');
        if (!res.ok) {
          throw new Error('Failed to load admin data');
        }
        const data = await res.json();
        setQuizzes(data.quizzes || []);
        setTotalQuizzes(data.totalQuizzes || 0);
        setTotalAttempts(data.totalAttempts || 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const filteredQuizzes = quizzes.filter((q) =>
    q.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatTime(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading admin overview...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
            <Crown className="w-3.5 h-3.5" /> Platform Admin Hub
          </div>
          <h1 className="text-3xl font-black text-white">All Quizzes Overview</h1>
          <p className="text-xs text-gray-400 mt-1">Live tracking of all social quizzes created across the platform.</p>
        </div>

        <Link
          href="/create"
          className="gradient-button px-5 py-3 rounded-2xl font-bold text-white text-sm shadow-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" /> Create New Quiz
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalQuizzes}</div>
            <div className="text-xs text-gray-400 font-medium">Total Quizzes Created</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black gradient-text">{totalAttempts}</div>
            <div className="text-xs text-gray-400 font-medium">Total Friend Attempts</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {totalQuizzes > 0 ? (totalAttempts / totalQuizzes).toFixed(1) : '0'}
            </div>
            <div className="text-xs text-gray-400 font-medium">Avg Responses / Quiz</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Search by creator name, quiz title, or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-white/5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quizzes List */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Created Quizzes ({filteredQuizzes.length})
          </h2>
          <span className="text-xs text-gray-400 font-medium">Sorted by newest</span>
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No quizzes matched your search.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-white text-lg">{quiz.creatorName}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                        /{quiz.slug}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-300">{quiz.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {quiz.questionCount} Questions
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {quiz.attemptCount} Responses
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Created on {formatTime(quiz.createdAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/quiz/${quiz.slug}`}
                      target="_blank"
                      className="glass-card hover:bg-white/10 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition"
                    >
                      <span>Take Quiz</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/dashboard/${quiz.id}?token=${quiz.creatorToken}`}
                      className="gradient-button px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md transition"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>View Responses</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
