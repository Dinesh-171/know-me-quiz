import Link from 'next/link';
import { Sparkles, ArrowRight, Eye, Heart, Trophy, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-between items-center px-4 py-8 max-w-4xl mx-auto w-full">
      {/* Top Navbar Brand */}
      <nav className="w-full flex justify-between items-center py-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center text-xl font-bold shadow-lg shadow-pink-500/20 animate-float">
            👀
          </div>
          <span className="font-extrabold text-lg tracking-tight gradient-text">
            KnowMe.vibe
          </span>
        </div>
        <Link
          href="/create"
          className="text-xs font-semibold px-4 py-2 rounded-full border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 transition"
        >
          Create Quiz
        </Link>
      </nav>

      {/* Main Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-pink-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
          <span>The #1 Social Quiz for Best Friends</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] mb-6">
          How well do your friends{' '}
          <span className="gradient-text block sm:inline">actually know you? 👀</span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl font-normal max-w-lg mb-10 leading-relaxed">
          Create a quiz. Share it on WhatsApp & Instagram. Find out who really remembers your vibe!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link
            href="/create"
            className="flex-1 gradient-button py-4 px-8 rounded-2xl font-bold text-white text-base shadow-xl flex items-center justify-center gap-2 group"
          >
            <span>Create My Quiz</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="flex-1 glass-card hover:bg-white/10 py-4 px-8 rounded-2xl font-semibold text-gray-200 text-base transition flex items-center justify-center border border-white/10"
          >
            How it works
          </a>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div id="how-it-works" className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 my-12">
        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base mb-1">1. Make Your Quiz</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Answer 5 quick questions about your food, travel, and pet peeves.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base mb-1">2. Share Link</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Post your custom link to WhatsApp or generate an aesthetic IG Story!
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base mb-1">3. See Who Knows You</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Get instant breakdown of scores and exact answers from every friend.
          </p>
        </div>
      </div>

      {/* Social Proof / Preview banner */}
      <div className="glass-card p-6 rounded-3xl w-full flex flex-col sm:flex-row items-center justify-between gap-4 border border-pink-500/20 bg-gradient-to-r from-pink-950/20 to-purple-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
            <Heart className="w-5 h-5 fill-pink-500/30" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-pink-200">No login required!</h4>
            <p className="text-xs text-gray-400">Takes less than 60 seconds to set up and share.</p>
          </div>
        </div>
        <Link
          href="/create"
          className="text-xs font-bold px-5 py-3 rounded-xl gradient-bg text-white hover:opacity-90 transition shadow-md w-full sm:w-auto text-center"
        >
          Get Started Now →
        </Link>
      </div>
    </div>
  );
}
