'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, BarChart3, ArrowRight, Eye, Plus, Search, ShieldCheck } from 'lucide-react';

interface SavedQuiz {
  quizId: string;
  token: string;
  title?: string;
  slug?: string;
}

export default function GeneralDashboardPage() {
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [inputQuizId, setInputQuizId] = useState('');
  const [inputToken, setInputToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const items: SavedQuiz[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('creator_token_')) {
          const quizId = key.replace('creator_token_', '');
          const token = localStorage.getItem(key) || '';
          if (quizId && token) {
            items.push({ quizId, token });
          }
        }
      }
      setSavedQuizzes(items);
    }
  }, []);

  const handleManualAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuizId.trim() && inputToken.trim()) {
      window.location.href = `/dashboard/${inputQuizId.trim()}?token=${inputToken.trim()}`;
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 text-pink-300 text-xs font-semibold border border-pink-500/20">
          <BarChart3 className="w-3.5 h-3.5" /> Creator Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          My Quiz <span className="gradient-text">Dashboards</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          View responses and friend answer breakdowns for all quizzes created on this device.
        </p>
      </div>

      {/* Saved Quizzes Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center justify-between">
          <span>Quizzes Created On This Device</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
            {savedQuizzes.length}
          </span>
        </h2>

        {savedQuizzes.length === 0 ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 text-gray-400 flex items-center justify-center mx-auto text-xl">
              👀
            </div>
            <p className="text-sm font-semibold text-gray-300">No local quizzes found yet</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Create a new quiz or enter your Quiz ID & Creator Token below to view responses.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 gradient-button px-5 py-3 rounded-2xl text-white font-bold text-sm shadow-lg"
            >
              <Plus className="w-4 h-4" /> Create New Quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedQuizzes.map((quiz, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-white text-base">Quiz #{idx + 1}</div>
                  <div className="text-xs text-gray-400 font-mono">ID: {quiz.quizId}</div>
                </div>
                <Link
                  href={`/dashboard/${quiz.quizId}?token=${quiz.token}`}
                  className="gradient-button px-4 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-1.5 shadow-md"
                >
                  <span>View Responses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Access Card */}
      <form onSubmit={handleManualAccess} className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          Access Dashboard with Token
        </h2>
        <p className="text-xs text-gray-400">
          Enter your private Quiz ID and Creator Token if you created a quiz on another device.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            placeholder="Quiz ID"
            value={inputQuizId}
            onChange={(e) => setInputQuizId(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500"
          />
          <input
            type="text"
            required
            placeholder="Creator Token"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={!inputQuizId.trim() || !inputToken.trim()}
          className="w-full glass-card hover:bg-white/10 p-3.5 rounded-2xl text-pink-300 font-bold text-sm border border-pink-500/30 transition flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Search className="w-4 h-4" /> Open Dashboard
        </button>
      </form>
    </div>
  );
}
