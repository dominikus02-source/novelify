'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNovelifyStore } from '@/lib/store';
import { PLANS } from '@/lib/billing/plans';
import { trackEvent } from '@/lib/analytics';
import Link from 'next/link';
import {
  Globe2, Package, Sparkles, FileText, Lock, BarChart3, Target,
  PenTool, BookOpen, BookMarked, Wand2, Languages, Download, Megaphone,
  Check, Star, Zap, Crown, Layers, Menu, X,
} from 'lucide-react';

const navLinks = [
  { key: 'features', label: 'Features' },
  { key: 'workflow', label: 'How it works' },
  { key: 'faq', label: 'FAQ' },
  { key: 'pricing', label: 'Pricing' },
];

const langPills = [
  { flag: '🇮🇩', label: 'Bahasa' },
  { flag: '🇬🇧', label: 'English' },
  { flag: '🇯🇵', label: 'Japanese' },
  { flag: '🇩🇪', label: 'German' },
  { flag: '🇫🇷', label: 'French' },
  { flag: '🇪🇸', label: 'Spanish' },
  { label: '+42 more →' },
];

const workflowSteps = [
  {
    icon: BookMarked, color: '#A78BFA', bgColor: 'rgba(167,139,250,0.1)',
    title: 'Plan',
    desc: 'Build outlines, Story Bible, character profiles, locations, and plot beats with structure templates.',
  },
  {
    icon: PenTool, color: '#C9A96E', bgColor: 'rgba(201,169,110,0.1)',
    title: 'Write',
    desc: 'Draft chapters and scenes in a focused writing studio with AI assistance and autosave.',
  },
  {
    icon: Wand2, color: '#34D399', bgColor: 'rgba(52,211,153,0.1)',
    title: 'Revise',
    desc: 'Check continuity, pacing, dialogue, prose, and publishing readiness with the revision engine.',
  },
  {
    icon: Languages, color: '#60A5FA', bgColor: 'rgba(96,165,250,0.1)',
    title: 'Translate',
    desc: 'Translate chapters while preserving tone, names, places, and story context.',
  },
  {
    icon: Download, color: '#F87171', bgColor: 'rgba(248,113,113,0.1)',
    title: 'Publish',
    desc: 'Prepare metadata, front and back matter, cover, and export EPUB, PDF, or DOCX.',
  },
  {
    icon: Megaphone, color: '#FBBF24', bgColor: 'rgba(251,191,36,0.1)',
    title: 'Market',
    desc: 'Generate blurbs, taglines, Amazon descriptions, and social captions for launch.',
  },
];

const features = [
  {
    icon: PenTool, color: '#C9A96E', bgColor: 'rgba(201,169,110,0.12)',
    title: 'Writing Studio',
    desc: 'A focused manuscript editor built for chapters, scenes, autosave, word goals, and AI writing support.',
  },
  {
    icon: BookMarked, color: '#A78BFA', bgColor: 'rgba(167,139,250,0.1)',
    title: 'Story Bible',
    desc: 'Keep every character, location, rule, relationship, and secret consistent across your novel.',
  },
  {
    icon: Layers, color: '#34D399', bgColor: 'rgba(52,211,153,0.1)',
    title: 'Plot Board',
    desc: 'Turn story beats into chapters and scenes with structure templates like Three-Act, Hero\'s Journey, and Romance Beats.',
  },
  {
    icon: Sparkles, color: '#F87171', bgColor: 'rgba(248,113,113,0.1)',
    title: 'AI Co-Writer',
    desc: 'Generate ideas, continue scenes, rewrite passages, improve dialogue, and expand descriptions.',
  },
  {
    icon: Wand2, color: '#60A5FA', bgColor: 'rgba(96,165,250,0.1)',
    title: 'Revision Engine',
    desc: 'Find continuity issues, pacing problems, weak dialogue, and style inconsistencies before readers do.',
  },
  {
    icon: Languages, color: '#FBBF24', bgColor: 'rgba(251,191,36,0.1)',
    title: 'Translation Studio',
    desc: 'Translate your manuscript while preserving tone, names, places, and story context.',
  },
  {
    icon: Download, color: '#C9A96E', bgColor: 'rgba(201,169,110,0.12)',
    title: 'Publishing Center',
    desc: 'Prepare metadata, front matter, back matter, cover, synopsis, and export publishing-ready files.',
  },
  {
    icon: Megaphone, color: '#A78BFA', bgColor: 'rgba(167,139,250,0.1)',
    title: 'Marketing Kit',
    desc: 'Create launch copy, Amazon KDP descriptions, Goodreads descriptions, taglines, and social captions.',
  },
];

const trustItems = [
  {
    icon: Lock, color: '#C9A96E',
    title: 'You keep ownership',
    desc: 'Novelify does not claim ownership of your manuscripts, characters, notes, outlines, or exports.',
  },
  {
    icon: Sparkles, color: '#A78BFA',
    title: 'AI only assists when requested',
    desc: 'Manuscript context is only sent to AI providers when you use an AI feature. Your content is not used for training without explicit opt-in.',
  },
  {
    icon: Download, color: '#34D399',
    title: 'Export anytime',
    desc: 'Prepare and export your work in publishing-ready formats depending on your plan.',
  },
  {
    icon: FileText, color: '#60A5FA',
    title: 'Clear billing and policies',
    desc: 'Subscription billing, refund rules, and manuscript privacy are explained in our policies.',
  },
];

const faqItems = [
  {
    q: 'Who owns my manuscript?',
    a: 'You do. Novelify does not claim ownership of your creative work. Your manuscripts, characters, story bibles, outlines, and exports remain yours.',
  },
  {
    q: 'Do you train AI on my writing?',
    a: 'Novelify does not use your manuscripts to train AI models unless you explicitly opt in. AI features may send selected context to AI providers to generate requested outputs.',
  },
  {
    q: 'Can I export my novel?',
    a: 'Yes. Novelify supports publishing workflows and export options including EPUB, PDF, and DOCX depending on your plan.',
  },
  {
    q: 'Can Novelify translate my novel?',
    a: 'Yes. Translation tools are designed to preserve names, places, tone, and story context where supported.',
  },
  {
    q: 'How does billing work?',
    a: 'Novelify offers Free, Starter, Pro, and Studio plans. Paid subscriptions are processed through our billing provider. You can upgrade, downgrade, or cancel at any time.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes. You can cancel at any time. Access continues through the end of your billing period. See our Refund Policy for details on refunds.',
  },
];

const typewriterLines = [
  'The lantern swayed over the old harbor, casting long shadows across the cobblestones.',
  ' She had been waiting for this moment since the night her father disappeared into the fog.',
];

function useTypewriter() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let full = typewriterLines[0];
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    function type() {
      if (i < full.length) {
        if (el) el.innerHTML = full.slice(0, ++i) + '<span class="cursor"></span>';
        timeout = setTimeout(type, 28 + Math.random() * 30);
      } else if (full === typewriterLines[0]) {
        timeout = setTimeout(() => {
          full = typewriterLines[0] + typewriterLines[1];
          type();
        }, 800);
      }
    }

    const startTimeout = setTimeout(type, 600);
    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeout);
    };
  }, []);

  return ref;
}

function useScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, []);
}

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export function Hero() {
  const { data: session } = useSession();
  const router = useRouter();
  const setCurrentView = useNovelifyStore((s) => s.setCurrentView);
  const typewriterRef = useTypewriter();
  useScrollReveal();

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setDrawerOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goToApp = useCallback(() => {
    trackEvent('hero_cta_click', { destination: session ? 'dashboard' : 'signup' });
    if (session) {
      setCurrentView('dashboard');
    } else {
      router.push('/signup');
    }
  }, [session, router, setCurrentView]);

  const goToPricing = useCallback(() => {
    trackEvent('pricing_click', { source: 'hero' });
    router.push('/pricing');
  }, [router]);

  return (
    <>
      <style>{`
        :root {
          --lp-black: #080808;
          --lp-surface: #111111;
          --lp-surface2: #181818;
          --lp-border: rgba(255,255,255,0.08);
          --lp-border-bright: rgba(255,255,255,0.14);
          --lp-white: #F5F5F7;
          --lp-muted: #8E8E93;
          --lp-gold: #C9A96E;
          --lp-gold-light: #E8C98A;
          --lp-purple: #A78BFA;
          --lp-purple-dim: rgba(167,139,250,0.12);
          --lp-glass: rgba(255,255,255,0.04);
          --lp-glass-hover: rgba(255,255,255,0.07);
          --lp-r: 18px;
        }
        .lp-body {
          background: var(--lp-black);
          color: var(--lp-white);
          font-family: var(--font-geist-sans), 'Inter', -apple-system, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        .lp-serif {
          font-family: var(--font-playfair), 'Playfair Display', serif;
        }
        .lp-hero::before {
          content: '';
          position: absolute;
          top: -20%; left: 50%; transform: translateX(-50%);
          width: 800px; height: 600px;
          background: radial-gradient(ellipse, rgba(167,139,250,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .lp-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 30%;
          width: 400px; height: 400px;
          background: radial-gradient(ellipse, rgba(201,169,110,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .lp-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--lp-gold);
          box-shadow: 0 0 8px var(--lp-gold);
          animation: lp-pulse 2s ease infinite;
        }
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
        .lp-hero h1 em::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--lp-gold), transparent);
        }
        .lp-editor-mock::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 19px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(201,169,110,0.3), transparent 50%, rgba(167,139,250,0.15));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none;
        }
        .cursor {
          display: inline-block;
          width: 2px; height: 1.1em;
          background: var(--lp-gold);
          margin-left: 1px;
          vertical-align: text-bottom;
          animation: lp-blink 1s step-end infinite;
        }
        @keyframes lp-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes lp-fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal {
          opacity: 0; transform: translateY(28px);
          transition: opacity .65s ease, transform .65s ease;
        }
        .reveal.visible {
          opacity: 1; transform: translateY(0);
        }
        .lp-progress-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, var(--lp-gold), var(--lp-gold-light));
          animation: lp-fillBar 1.4s ease both;
        }
        @keyframes lp-fillBar { from { width: 0 !important; } }
        .lp-card-hover:hover {
          border-color: var(--lp-border-bright);
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
        }
        .lp-tcard-hover:hover {
          border-color: var(--lp-border-bright);
          transform: translateY(-2px);
        }
        .lp-pcard-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }
        .faq-answer {
          max-height: 0; overflow: hidden;
          transition: max-height .3s ease, padding .3s ease;
        }
        .faq-open .faq-answer {
          max-height: 300px;
        }
        .lp-mobile-visible { display: none !important; }
        @media (max-width: 768px) {
          .lp-mobile-hidden { display: none !important; }
          .lp-mobile-visible { display: inline-flex !important; }
        }
        @keyframes lp-drawerIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes lp-drawerOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div className="lp-body">
        {/* NAV */}
        <nav
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            padding: '0 24px', height: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(8,8,8,0.7)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderBottom: '1px solid var(--lp-border)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, height: 28, background: 'linear-gradient(135deg, var(--lp-gold), var(--lp-gold-light))', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0 }}>N</span>
            <span className="lp-serif" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--lp-white)' }}>Novelify</span>
          </span>
          <ul style={{ display: 'flex', alignItems: 'center', gap: 4, listStyle: 'none', margin: 0 }}>
            {navLinks.map((f) => (
              <li key={f.key} className="lp-mobile-hidden">
                <button onClick={() => scrollTo(f.key)} style={{ color: 'var(--lp-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color .2s, background .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; e.currentTarget.style.background = 'var(--lp-glass-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-muted)'; e.currentTarget.style.background = 'transparent'; }}
                >{f.label}</button>
              </li>
            ))}
            {!session && (
              <li>
                <button onClick={() => router.push('/login')}
                  style={{ color: 'var(--lp-muted)', fontSize: 14, fontWeight: 500, padding: '6px 14px', borderRadius: 20, background: 'transparent', border: '1px solid var(--lp-border)', cursor: 'pointer', transition: 'color .2s, border-color .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-muted)'; e.currentTarget.style.borderColor = 'var(--lp-border)'; }}
                >Sign in</button>
              </li>
            )}
            <li>
              <button onClick={goToApp}
                style={{ background: 'var(--lp-white)', color: '#000', fontWeight: 600, padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: 14, cursor: 'pointer', transition: 'background .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,245,247,0.85)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--lp-white)'; }}
               >{session ? 'Dashboard' : 'Start Free'}</button>
             </li>
             <li className="lp-mobile-visible">
               <button onClick={() => setDrawerOpen(true)} aria-label="Toggle menu"
                 style={{
                   width: 44, height: 44,
                   display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                   background: 'transparent', border: 'none', cursor: 'pointer',
                   color: 'var(--lp-white)',
                 }}
               >
                 <Menu size={22} />
               </button>
             </li>
           </ul>
         </nav>

        {/* MOBILE DRAWER */}
        {drawerOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex',
            animation: 'lp-drawerOverlay .2s ease',
          }}>
            <div onClick={() => setDrawerOpen(false)}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: 400,
              background: '#080808',
              borderRight: '1px solid var(--lp-border)',
              display: 'flex', flexDirection: 'column',
              animation: 'lp-drawerIn .25s ease',
              overflowY: 'auto',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid var(--lp-border)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 28, height: 28,
                    background: 'linear-gradient(135deg, var(--lp-gold), var(--lp-gold-light))',
                    borderRadius: 7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0,
                  }}>N</span>
                  <span className="lp-serif" style={{
                    fontSize: 18, fontWeight: 600,
                    letterSpacing: '-0.02em', color: 'var(--lp-white)',
                  }}>Novelify</span>
                </span>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close menu"
                  style={{
                    width: 44, height: 44,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--lp-surface)', border: '1px solid var(--lp-border)',
                    borderRadius: 10, cursor: 'pointer',
                    color: 'var(--lp-white)',
                    transition: 'background .2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--lp-glass-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--lp-surface)'; }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{
                padding: '12px 20px',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                {navLinks.map((f) => (
                  <button key={f.key}
                    onClick={() => { scrollTo(f.key); setDrawerOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', width: '100%',
                      padding: '14px 16px', borderRadius: 10,
                      fontSize: 16, fontWeight: 500, color: 'var(--lp-white)',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--lp-glass-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div style={{ margin: '8px 20px', borderTop: '1px solid var(--lp-border)' }} />

              <div style={{
                padding: '12px 20px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {!session && (
                  <button onClick={() => router.push('/login')}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 12,
                      fontSize: 15, fontWeight: 500, color: 'var(--lp-white)',
                      background: 'var(--lp-surface2)',
                      border: '1px solid var(--lp-border)', cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border)'; }}
                  >
                    Sign in
                  </button>
                )}
                <button onClick={goToApp}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    fontSize: 15, fontWeight: 600, color: '#000',
                    background: 'linear-gradient(135deg, var(--lp-gold), var(--lp-gold-light))',
                    border: 'none', cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,110,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {session ? 'Dashboard' : 'Start Free'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HERO */}
        <section className="lp-hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--lp-glass)', border: '1px solid var(--lp-border-bright)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, color: 'var(--lp-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 32, animation: 'lp-fadeUp .6s ease both' }}>
            <span className="lp-eyebrow-dot"></span>
            AI-Powered Novel Writing Platform
          </div>

          <h1 className="lp-serif" style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: 840, color: 'var(--lp-white)', animation: 'lp-fadeUp .7s .1s ease both' }}>
            Write, revise, translate, and publish your novel<br />
            with an <em style={{ fontStyle: 'italic', color: 'var(--lp-gold)', position: 'relative' }}>AI-powered writing studio</em>.
          </h1>

          <p style={{ marginTop: 24, fontSize: 18, fontWeight: 400, color: 'var(--lp-muted)', maxWidth: 520, lineHeight: 1.6, animation: 'lp-fadeUp .7s .2s ease both' }}>
            Plan your story, build your world, draft chapters, revise with confidence, translate to global markets, and prepare publishing-ready exports — all in one focused platform.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 40, animation: 'lp-fadeUp .7s .3s ease both', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={goToApp}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--lp-white)', color: '#000', fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 50, border: 'none', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s, background .2s', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'; e.currentTarget.style.background = '#e8e8ea'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; e.currentTarget.style.background = 'var(--lp-white)'; }}
            >
              <svg fill="none" viewBox="0 0 16 16" width="16" height="16"><path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10v2a2 2 0 002 2h8a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Start Writing Free
            </button>
            <button onClick={goToPricing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--lp-muted)', fontSize: 15, fontWeight: 500, padding: '14px 20px', borderRadius: 50, border: '1px solid var(--lp-border-bright)', cursor: 'pointer', transition: 'color .2s, border-color .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-muted)'; e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; }}
            >
              View Pricing
            </button>
          </div>

          <p style={{ marginTop: 16, fontSize: 12, color: 'var(--lp-muted)', animation: 'lp-fadeUp .7s .4s ease both' }}>
            No credit card required. Your manuscript belongs to you.
          </p>

          <div style={{ marginTop: 40, animation: 'lp-fadeUp .7s .4s ease both', width: '100%', maxWidth: 640 }}>
            <div className="lp-editor-mock" style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border-bright)', borderRadius: 'var(--lp-r)', padding: '24px 28px', textAlign: 'left', position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }}></span>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }}></span>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }}></span>
              </div>
              <div ref={typewriterRef} className="lp-serif" style={{ fontSize: 15, color: 'rgba(245,245,247,0.75)', lineHeight: 1.8, minHeight: 80 }}>
                <span className="cursor"></span>
              </div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--lp-purple-dim)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 500, color: 'var(--lp-purple)' }}>
                  <svg fill="none" viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 6.5l1.5 1.5L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  AI Assist
                </div>
                <span style={{ fontSize: 12, color: 'var(--lp-muted)', marginLeft: 4 }}>Continuing your scene…</span>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0, borderTop: '1px solid var(--lp-border)', borderBottom: '1px solid var(--lp-border)', background: 'var(--lp-surface)' }}>
          {[
            { text: 'Your manuscript stays yours', icon: Lock },
            { text: 'AI-powered story planning', icon: Sparkles },
            { text: 'EPUB, PDF, and DOCX export', icon: FileText },
            { text: '48+ language support', icon: Globe2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text}
                style={{ flex: 1, minWidth: 160, maxWidth: 260, padding: '20px 24px', textAlign: 'center', borderRight: '1px solid var(--lp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Icon size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--lp-muted)' }}>{item.text}</span>
              </div>
            );
          })}
        </div>

        {/* FEATURES */}
        <section id="features" style={{ padding: '100px 24px' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div className="reveal">
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Platform</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)', maxWidth: 520 }}>Every tool a novelist needs, unified.</h2>
              <p style={{ marginTop: 16, fontSize: 16, color: 'var(--lp-muted)', maxWidth: 440, lineHeight: 1.65 }}>From the first idea to the published page — Novelify handles the complexity so you stay in the story.</p>
            </div>

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, marginTop: 56 }}>
              {/* Translation — widened */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 7', background: 'linear-gradient(135deg, var(--lp-surface2) 0%, #0f0f14 100%)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)' }}>
                  <Globe2 size={20} style={{ color: 'var(--lp-gold)' }} />
                </div>
                <h3 className="lp-serif" style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>AI Translation</h3>
                <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Translate your manuscript while preserving tone, idiom, names, and narrative voice. Publish in multiple languages without losing your voice.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20 }}>
                  {langPills.map((l) => (
                    <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: 'var(--lp-glass)', border: '1px solid var(--lp-border)', color: 'rgba(245,245,247,0.6)', transition: 'all .2s', cursor: 'default' }}>
                      {l.flag && <span style={{ fontSize: 14 }}>{l.flag}</span>}
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Writing Studio */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 5', background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.18)' }}>
                  <PenTool size={20} style={{ color: 'var(--lp-purple)' }} />
                </div>
                <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>Writing Studio</h3>
                <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Draft chapters and scenes in a focused editor with autosave, word goals, AI assistance, and full version history.</p>
              </div>

              {/* Story Bible */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 5', background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.18)' }}>
                  <BookMarked size={20} style={{ color: '#34D399' }} />
                </div>
                <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>Story Bible</h3>
                <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Build characters, locations, timelines, lore, and research — all connected and accessible while you write.</p>
              </div>

              {/* Plot Board + AI Co-Writer */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 7', background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.18)' }}>
                      <Sparkles size={20} style={{ color: 'var(--lp-purple)' }} />
                    </div>
                    <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>AI Co-Writer</h3>
                    <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Get contextual suggestions, continue scenes, improve dialogue, and overcome writer&apos;s block — all without leaving your flow.</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 200, borderLeft: '1px solid var(--lp-border)', paddingLeft: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)' }}>
                      <Layers size={20} style={{ color: 'var(--lp-gold)' }} />
                    </div>
                    <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>Plot Board</h3>
                    <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Visualize your story structure with templates like Three-Act, Hero&apos;s Journey, and Romance Beats.</p>
                  </div>
                </div>
              </div>

              {/* Publishing + Export */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 12', background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s', display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)' }}>
                    <Download size={20} style={{ color: 'var(--lp-gold)' }} />
                  </div>
                  <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>Publishing Center</h3>
                  <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Prepare metadata, front matter, back matter, cover, and export EPUB, PDF, or DOCX files — formatted and publishing-ready.</p>
                </div>
                <div style={{ flex: 1, minWidth: 220, borderLeft: '1px solid var(--lp-border)', paddingLeft: 40 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.18)' }}>
                    <Megaphone size={20} style={{ color: 'var(--lp-purple)' }} />
                  </div>
                  <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>Revision Engine</h3>
                  <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Check continuity, pacing, dialogue, style, and publishing readiness before you export or publish.</p>
                </div>
                <div style={{ flex: 1, minWidth: 220, borderLeft: '1px solid var(--lp-border)', paddingLeft: 40 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.18)' }}>
                    <Package size={20} style={{ color: '#34D399' }} />
                  </div>
                  <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>Marketing Kit</h3>
                  <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Generate blurbs, taglines, Amazon KDP descriptions, and social captions to prepare your launch.</p>
                </div>
              </div>
            </div>

            <div className="reveal" style={{ textAlign: 'center', marginTop: 48 }}>
              <button onClick={goToApp}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--lp-white)', color: '#000', fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 50, border: 'none', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s, background .2s', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
              >
                Start Your First Novel
              </button>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="workflow" style={{ padding: '100px 24px', background: 'var(--lp-surface)' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div className="reveal">
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Workflow</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)', maxWidth: 520 }}>From first idea to export-ready manuscript.</h2>
              <p style={{ marginTop: 16, fontSize: 16, color: 'var(--lp-muted)', maxWidth: 440, lineHeight: 1.65 }}>A complete writing workflow in one focused platform.</p>
            </div>

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 56 }}>
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="lp-card-hover" style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 24, transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, background: step.bgColor, border: `1px solid ${step.color}25` }}>
                      <Icon size={18} style={{ color: step.color }} />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--lp-white)', marginBottom: 6, margin: '0 0 6px' }}>{step.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--lp-muted)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TRUST & MANUSCRIPT PRIVACY */}
        <section id="trust" style={{ padding: '100px 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <div className="reveal">
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Trust</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)' }}>Your story belongs to you.</h2>
            </div>

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 48 }}>
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="lp-card-hover" style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, textAlign: 'left', transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--lp-white)', margin: '0 0 6px' }}>{item.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--lp-muted)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="reveal" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginTop: 36 }}>
              {[
                { label: 'Manuscript Privacy', href: '/manuscript-privacy' },
                { label: 'AI Usage Policy', href: '/ai-usage-policy' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((link) => (
                <Link key={link.label} href={link.href}
                  style={{ fontSize: 12, fontWeight: 500, color: 'var(--lp-gold)', textDecoration: 'none', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(201,169,110,0.25)', transition: 'all .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ padding: '100px 24px', background: 'var(--lp-surface)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <div className="reveal">
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)' }}>Simple, transparent plans.</h2>
              <p style={{ marginTop: 16, fontSize: 16, color: 'var(--lp-muted)', maxWidth: 440, lineHeight: 1.65, margin: '16px auto 0' }}>No hidden fees. No surprises. Cancel anytime.</p>
            </div>

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 56 }}>
              {(['free', 'starter', 'pro', 'studio'] as const).map((tier) => {
                const plan = PLANS[tier];
                const isFeatured = plan.highlighted;
                return (
                  <div key={tier} className="lp-pcard-hover" style={{
                    background: isFeatured ? 'linear-gradient(160deg, #16102A 0%, #0f0f14 100%)' : 'var(--lp-surface)',
                    border: `1px solid ${isFeatured ? 'rgba(201,169,110,0.3)' : 'var(--lp-border)'}`,
                    borderRadius: 'var(--lp-r)',
                    padding: '28px 20px',
                    position: 'relative',
                    transition: 'transform .25s, box-shadow .25s',
                    boxShadow: isFeatured ? '0 0 40px rgba(201,169,110,0.06)' : 'none',
                  }}>
                    {isFeatured && (
                      <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, var(--lp-gold), var(--lp-gold-light))', borderRadius: '0 0 10px 10px', padding: '4px 16px', fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Most Popular
                      </div>
                    )}
                    <div style={{ fontSize: 12, fontWeight: 600, color: isFeatured ? 'var(--lp-gold)' : 'var(--lp-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{plan.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4, justifyContent: 'center' }}>
                      <span style={{ fontSize: 16, color: plan.monthlyPrice > 0 ? 'var(--lp-white)' : 'var(--lp-muted)' }}>$</span>
                      <span className="lp-serif" style={{ fontSize: 36, fontWeight: 600, color: 'var(--lp-white)', letterSpacing: '-0.03em' }}>{plan.monthlyPrice}</span>
                      <span style={{ fontSize: 13, color: 'var(--lp-muted)' }}>/ mo</span>
                    </div>
                    {plan.yearlyPrice > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--lp-muted)', marginBottom: 12 }}>
                        ${plan.yearlyPrice}/yr (${Math.round(plan.yearlyPrice / 12)}/mo)
                      </div>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--lp-muted)', marginBottom: 20 }}>{plan.description}</p>

                    <ul style={{ listStyle: 'none', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8, padding: 0, textAlign: 'left' }}>
                      {tier === 'free' && (
                        <>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />1 project</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Writing Studio + AI Co-Writer</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Story Bible + Plot Board</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />EPUB + Markdown export</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.5)' }}><span style={{ color: 'var(--lp-muted)', flexShrink: 0 }}>–</span>Full revision</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.5)' }}><span style={{ color: 'var(--lp-muted)', flexShrink: 0 }}>–</span>PDF/DOCX export</li>
                        </>
                      )}
                      {tier === 'starter' && (
                        <>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />5 projects</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />500 AI credits / mo</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Full manuscript revision</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />PDF export</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Marketing assets</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.5)' }}><span style={{ color: 'var(--lp-muted)', flexShrink: 0 }}>–</span>DOCX export</li>
                        </>
                      )}
                      {tier === 'pro' && (
                        <>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />20 projects</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />3,000 AI credits / mo</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />DOCX export</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Amazon metadata optimization</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Priority support</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />3 team seats</li>
                        </>
                      )}
                      {tier === 'studio' && (
                        <>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Unlimited projects</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Unlimited AI credits</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Unlimited exports</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Unlimited translation</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />Team collaboration (10 seats)</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(245,245,247,0.7)' }}><Check size={14} style={{ color: 'var(--lp-gold)', flexShrink: 0, marginTop: 1 }} />API access</li>
                        </>
                      )}
                    </ul>

                    {isFeatured ? (
                      <button onClick={goToPricing}
                        style={{ width: '100%', display: 'block', textAlign: 'center', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--lp-gold), var(--lp-gold-light))', color: '#000', transition: 'all .2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,110,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >Get Started</button>
                    ) : (
                      <button onClick={goToPricing}
                        style={{ width: '100%', display: 'block', textAlign: 'center', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1px solid var(--lp-border-bright)', cursor: 'pointer', background: 'var(--lp-glass)', color: 'var(--lp-white)', transition: 'all .2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--lp-glass-hover)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--lp-glass)'; }}
                      >{tier === 'free' ? 'Start Free' : 'Learn More'}</button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="reveal" style={{ marginTop: 32, fontSize: 12, color: 'var(--lp-muted)' }}>
              <Link href="/pricing" style={{ color: 'var(--lp-gold)', textDecoration: 'none', fontWeight: 500 }}>Compare Plans</Link>
              <span style={{ margin: '0 12px', color: 'var(--lp-border)' }}>·</span>
              <Link href="/refund" style={{ color: 'var(--lp-gold)', textDecoration: 'none', fontWeight: 500 }}>Refund Policy</Link>
              <span style={{ margin: '0 12px', color: 'var(--lp-border)' }}>·</span>
              <Link href="/billing-policy" style={{ color: 'var(--lp-gold)', textDecoration: 'none', fontWeight: 500 }}>Billing Policy</Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding: '100px 24px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>FAQ</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)' }}>Frequently Asked Questions</h2>
            </div>

            <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faqItems.map((faq) => (
                <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
          <div className="reveal" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Begin</div>
            <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)', maxWidth: 560, margin: '0 auto' }}>Start your first novel today.</h2>
            <p style={{ marginTop: 16, fontSize: 16, color: 'var(--lp-muted)', maxWidth: 400, lineHeight: 1.65, margin: '16px auto 0' }}>Join a growing community of writers using Novelify to plan, write, revise, translate, and publish their work.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 36, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={goToApp}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--lp-white)', color: '#000', fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 50, border: 'none', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s, background .2s', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'; e.currentTarget.style.background = '#e8e8ea'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; e.currentTarget.style.background = 'var(--lp-white)'; }}
              >
                Start Writing for Free
              </button>
              <button onClick={goToPricing}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--lp-muted)', fontSize: 15, fontWeight: 500, padding: '14px 20px', borderRadius: 50, border: '1px solid var(--lp-border-bright)', cursor: 'pointer', transition: 'color .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-muted)'; e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; }}
              >View Pricing</button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid var(--lp-border)', padding: '40px 24px', background: 'var(--lp-surface)' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
              <div>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, background: 'linear-gradient(135deg, var(--lp-gold), var(--lp-gold-light))', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>N</span>
                  <span className="lp-serif" style={{ fontSize: 15, fontWeight: 600, color: 'var(--lp-white)' }}>Novelify</span>
                </Link>
                <p style={{ fontSize: 11, color: 'var(--lp-muted)', margin: '8px 0 0', maxWidth: 260, lineHeight: 1.5 }}>
                  AI-powered writing studio for novelists. Plan, write, revise, translate, and publish.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--lp-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Product</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Link href="/pricing" style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,245,247,0.6)'; }}
                    >Pricing</Link>
                    <Link href="/contact" style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,245,247,0.6)'; }}
                    >Contact</Link>
                    <Link href="/support" style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,245,247,0.6)'; }}
                    >Support</Link>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--lp-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Legal</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Link href="/terms" style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,245,247,0.6)'; }}
                    >Terms</Link>
                    <Link href="/privacy" style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,245,247,0.6)'; }}
                    >Privacy</Link>
                    <Link href="/refund" style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,245,247,0.6)'; }}
                    >Refund</Link>
                    <Link href="/billing-policy" style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,245,247,0.6)'; }}
                    >Billing</Link>
                    <Link href="/ai-usage-policy" style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,245,247,0.6)'; }}
                    >AI Usage</Link>
                    <Link href="/manuscript-privacy" style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,245,247,0.6)'; }}
                    >Manuscript Privacy</Link>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--lp-border)', paddingTop: 16, textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(142,142,147,0.5)' }}>&copy; {new Date().getFullYear()} Novelify. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={detailsRef} style={{
      background: 'var(--lp-surface)',
      border: '1px solid var(--lp-border)',
      borderRadius: 'var(--lp-r)',
      overflow: 'hidden',
      transition: 'border-color .2s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border)'; }}
    >
      <summary style={{
        padding: '18px 24px',
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--lp-white)',
        cursor: 'pointer',
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        {question}
        <ChevronDownIcon />
      </summary>
      <div style={{ padding: '0 24px 18px', fontSize: 13, color: 'var(--lp-muted)', lineHeight: 1.6 }}>
        {answer}
      </div>
    </details>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--lp-muted)', transition: 'transform .2s' }}>
      <path d="M3.5 5.25L7 8.75L10.5 5.25" />
    </svg>
  );
}
