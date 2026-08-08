'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { Copy, Check, Share2, Download, Camera, ExternalLink, Eye, Sparkles, MessageCircle, BarChart3 } from 'lucide-react';
import QRCode from 'qrcode';

export default function ShareQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = use(params);
  const { token } = use(searchParams);

  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generatingStory, setGeneratingStory] = useState(false);
  const [creatorToken, setCreatorToken] = useState(token || '');
  const [quizDetails, setQuizDetails] = useState<{ id: string; title: string; creatorName: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const quizUrl = origin ? `${origin}/quiz/${slug}` : `/quiz/${slug}`;

  // Fetch quiz basic info & token fallback
  useEffect(() => {
    async function loadQuizInfo() {
      try {
        const res = await fetch(`/api/quiz/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setQuizDetails({
            id: data.id,
            title: data.title,
            creatorName: data.creatorName,
          });

          // Check fallback token in localStorage if not in URL query
          if (!creatorToken && typeof window !== 'undefined') {
            const savedToken = localStorage.getItem(`creator_token_${data.id}`);
            if (savedToken) {
              setCreatorToken(savedToken);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load quiz info:', err);
      }
    }
    loadQuizInfo();
  }, [slug, creatorToken]);

  // Generate QR Code
  useEffect(() => {
    if (quizUrl && quizUrl.startsWith('http')) {
      QRCode.toDataURL(quizUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#0b0f19',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [quizUrl]);

  // Copy Link Handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Share URL
  const whatsappMsg = `I made a quiz about myself 😂\nLet's see how well you know me 👀\n${quizUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMsg)}`;

  // Download Instagram Story Image (1080x1920 Canvas Export)
  const handleDownloadStory = () => {
    setGeneratingStory(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1080 x 1920 setup
    canvas.width = 1080;
    canvas.height = 1920;

    // Background Dark Vibrant Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGradient.addColorStop(0, '#0b0f19');
    bgGradient.addColorStop(0.3, '#1e112a');
    bgGradient.addColorStop(0.7, '#2b1035');
    bgGradient.addColorStop(1, '#0b0f19');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Neon Mesh Circles
    ctx.beginPath();
    ctx.arc(200, 300, 350, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(880, 1600, 400, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.fill();

    // Top Pill Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.roundRect(315, 220, 450, 80, 40);
    ctx.fill();
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#f472b6';
    ctx.textAlign = 'center';
    ctx.fillText('✨ KnowMe.vibe 👀', 540, 272);

    // Main Heading
    ctx.font = '900 68px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HOW WELL DO YOU', 540, 440);

    // Highlighted Text
    const textGrad = ctx.createLinearGradient(100, 0, 980, 0);
    textGrad.addColorStop(0, '#ec4899');
    textGrad.addColorStop(0.5, '#c084fc');
    textGrad.addColorStop(1, '#6366f1');
    ctx.fillStyle = textGrad;
    ctx.font = '900 84px sans-serif';
    ctx.fillText('KNOW ME? 👀', 540, 540);

    // Creator Subtext
    if (quizDetails?.creatorName) {
      ctx.font = '600 42px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Quiz created by ${quizDetails.creatorName}`, 540, 630);
    }

    // Story Card Box
    ctx.fillStyle = 'rgba(17, 24, 39, 0.75)';
    ctx.roundRect(140, 720, 800, 840, 48);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inside Card Callout
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Think you actually know me?', 540, 810);

    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#f472b6';
    ctx.fillText('Take the quiz now! 👇', 540, 870);

    // Draw QR Code onto Canvas if ready
    if (qrDataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 390, 930, 300, 300);

        // URL display box below QR
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.roundRect(240, 1300, 600, 70, 20);
        ctx.fill();

        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(quizUrl.replace(/^https?:\/\//, ''), 540, 1345);

        // Footer CTA
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Scan QR or tap link in bio! 🔥', 540, 1680);

        // Trigger PNG Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `KnowMe-Story-${slug}.png`;
        link.href = dataUrl;
        link.click();
        setGeneratingStory(false);
      };
      img.src = qrDataUrl;
    } else {
      setGeneratingStory(false);
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col items-center">
      {/* Offscreen Canvas for Story rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hero Badge */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl gradient-bg mx-auto flex items-center justify-center text-3xl shadow-xl shadow-pink-500/30 mb-4 animate-bounce">
          🎉
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Your Quiz is <span className="gradient-text">Ready!</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Share your link with friends to see who actually knows you.
        </p>
      </div>

      {/* Main Link Box */}
      <div className="glass-panel p-6 rounded-3xl w-full space-y-4 border border-pink-500/30 mb-6 bg-gradient-to-b from-pink-950/20 to-purple-950/20">
        <label className="block text-xs font-semibold uppercase tracking-wider text-pink-300">
          Your Unique Quiz Link
        </label>
        <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-2xl border border-white/10">
          <input
            type="text"
            readOnly
            value={quizUrl}
            className="flex-1 bg-transparent text-sm text-gray-200 px-3 outline-none font-mono truncate"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'gradient-button text-white shadow-md'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy
              </>
            )}
          </button>
        </div>

        {/* Instant Share Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-3.5 px-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg transition"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Share on WhatsApp</span>
          </a>

          {quizDetails?.id && creatorToken ? (
            <Link
              href={`/dashboard/${quizDetails.id}?token=${creatorToken}`}
              className="w-full glass-card hover:bg-white/10 py-3.5 px-4 rounded-2xl font-bold text-pink-300 text-sm flex items-center justify-center gap-2 border border-pink-500/30 transition"
            >
              <BarChart3 className="w-5 h-5 text-pink-400" />
              <span>View Responses</span>
            </Link>
          ) : (
            <div className="text-xs text-gray-500 flex items-center justify-center">
              Response dashboard available once created
            </div>
          )}
        </div>
      </div>

      {/* Instagram Story Share Card */}
      <div className="glass-panel p-6 rounded-3xl w-full border border-purple-500/30 space-y-4 mb-8 bg-gradient-to-b from-purple-950/20 to-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Instagram Story Generator</h3>
            <p className="text-xs text-gray-400">Download a 1080×1920 aesthetic story card with QR code!</p>
          </div>
        </div>

        {/* Story Visual Mock Preview */}
        <div className="relative aspect-[9/16] w-48 mx-auto rounded-2xl bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border border-white/20 p-4 flex flex-col items-center justify-between text-center shadow-2xl overflow-hidden">
          <div className="text-[10px] font-bold text-pink-400 bg-white/10 px-2 py-0.5 rounded-full border border-pink-500/20">
            👀 KnowMe.vibe
          </div>

          <div>
            <div className="text-xs font-black text-white leading-tight">
              HOW WELL DO YOU
            </div>
            <div className="text-sm font-black gradient-text">
              KNOW ME? 👀
            </div>
            <p className="text-[9px] text-gray-300 mt-1">Think you know me?</p>
          </div>

          {/* QR Code image preview */}
          {qrDataUrl && (
            <div className="bg-white p-1 rounded-xl shadow-lg">
              <img src={qrDataUrl} alt="QR Code" className="w-20 h-20" />
            </div>
          )}

          <div className="text-[9px] text-gray-400 font-semibold">
            Take the quiz →
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDownloadStory}
            disabled={generatingStory}
            className="flex-1 gradient-button py-3.5 px-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>{generatingStory ? 'Generating...' : 'Download Story Image'}</span>
          </button>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card hover:bg-white/10 py-3.5 px-4 rounded-2xl font-bold text-gray-300 hover:text-white text-sm flex items-center justify-center gap-2 border border-white/10 transition"
          >
            <span>Open Instagram</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
