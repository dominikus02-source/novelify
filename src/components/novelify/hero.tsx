'use client';

import { useEffect, useRef, useState } from 'react';
import { useNovelifyStore } from '@/lib/store';

const features = [
  { key: 'features', label: 'Features' },
  { key: 'how', label: 'How it works' },
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

const stats = [
  { num: '12', suffix: 'k+', label: 'Writers Active' },
  { num: '48', suffix: '+', label: 'Languages' },
  { num: '3.2', suffix: 'M', label: 'Words Written' },
  { num: '98', suffix: '%', label: 'Quality Score' },
];

const steps = [
  {
    num: '01',
    title: 'Write Your Story',
    desc: "Open Novelify's distraction-free editor. Outline chapters, write freely, or prompt the AI Co-Pilot to help you push through blocks.",
    tag: '~hours to weeks',
  },
  {
    num: '02',
    title: 'Refine & Polish',
    desc: 'AI suggests structural edits, pacing improvements, and line-level prose polish — always respecting your unique voice.',
    tag: '~days',
  },
  {
    num: '03',
    title: 'Translate Globally',
    desc: 'Choose your target markets. Literary AI translation preserves tone and nuance across 48+ languages in minutes, not months.',
    tag: '~minutes',
  },
  {
    num: '04',
    title: 'Publish & Earn',
    desc: 'Export EPUB, go live on Amazon KDP, and start earning royalties from readers worldwide. Novelify handles the formatting complexity.',
    tag: '~one click',
  },
];

const testimonials = [
  {
    stars: '★★★★★',
    quote: '"I published my Indonesian novel in English and German within a week. The translation actually sounded literary — not like Google Translate at all."',
    avatar: 'R',
    name: 'Rina Hartono',
    role: 'Romance Author · Jakarta',
    color: 'rgba(201,169,110,0.15)',
    textColor: '#C9A96E',
  },
  {
    stars: '★★★★★',
    quote: '"The EPUB export is flawless. What used to take me a full day of formatting is now done in seconds. My KDP page looks completely professional."',
    avatar: 'M',
    name: 'Marco Delgado',
    role: 'Thriller Writer · Madrid',
    color: 'rgba(167,139,250,0.12)',
    textColor: '#A78BFA',
  },
  {
    stars: '★★★★★',
    quote: '"The AI Co-Pilot helped me finish a 90,000-word fantasy novel in 4 months. It suggests, I decide. That balance is exactly right."',
    avatar: 'A',
    name: 'Aisha Kowalczyk',
    role: 'Fantasy Novelist · Warsaw',
    color: 'rgba(52,211,153,0.1)',
    textColor: '#34D399',
  },
];

const plans = [
  {
    tier: 'Starter',
    price: '0',
    desc: 'Try Novelify with no commitment.',
    features: [
      { text: '1 active novel project', muted: false },
      { text: '10,000 AI-assisted words / mo', muted: false },
      { text: 'EPUB export (with watermark)', muted: false },
      { text: 'Literary translation', muted: true },
      { text: 'KDP publish', muted: true },
    ],
    featured: false,
    btnClass: 'btn-plan-ghost',
  },
  {
    tier: 'Author',
    price: '19',
    desc: 'Everything a serious writer needs.',
    features: [
      { text: '5 novel projects', muted: false },
      { text: 'Unlimited AI Co-Pilot words', muted: false },
      { text: 'Clean EPUB export', muted: false },
      { text: 'Literary translation — 5 languages', muted: false },
      { text: 'Direct KDP publishing', muted: false },
      { text: 'Royalty intelligence dashboard', muted: false },
    ],
    featured: true,
    btnClass: 'btn-plan-solid',
  },
  {
    tier: 'Publisher',
    price: '49',
    desc: 'For prolific authors and small publishers.',
    features: [
      { text: 'Unlimited projects', muted: false },
      { text: 'Unlimited AI Co-Pilot', muted: false },
      { text: 'Translation — all 48 languages', muted: false },
      { text: 'Priority processing', muted: false },
      { text: 'Team collaboration (3 seats)', muted: false },
      { text: 'Genre targeting & SEO tools', muted: false },
    ],
    featured: false,
    btnClass: 'btn-plan-ghost',
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
        el.innerHTML = full.slice(0, ++i) + '<span class="cursor"></span>';
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
  const setCurrentView = useNovelifyStore((s) => s.setCurrentView);
  const typewriterRef = useTypewriter();
  useScrollReveal();

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
        @media (max-width: 768px) {
          .lp-mobile-hidden { display: none !important; }
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
          <a className="lp-serif" href="#" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--lp-white)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, height: 28, background: 'linear-gradient(135deg, var(--lp-gold), var(--lp-gold-light))', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0 }}>N</span>
            Novelify
          </a>
          <ul style={{ display: 'flex', alignItems: 'center', gap: 4, listStyle: 'none', margin: 0 }}>
            {features.map((f) => (
              <li key={f.key} className="lp-mobile-hidden">
                <button onClick={() => scrollTo(f.key)} style={{ color: 'var(--lp-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color .2s, background .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; e.currentTarget.style.background = 'var(--lp-glass-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-muted)'; e.currentTarget.style.background = 'transparent'; }}
                >{f.label}</button>
              </li>
            ))}
            <li>
              <button onClick={() => setCurrentView('dashboard')}
                style={{ background: 'var(--lp-white)', color: '#000', fontWeight: 600, padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: 14, cursor: 'pointer', transition: 'background .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,245,247,0.85)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--lp-white)'; }}
              >Start Free</button>
            </li>
          </ul>
        </nav>

        {/* HERO */}
        <section className="lp-hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--lp-glass)', border: '1px solid var(--lp-border-bright)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, color: 'var(--lp-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 32, animation: 'lp-fadeUp .6s ease both' }}>
            <span className="lp-eyebrow-dot"></span>
            AI-Powered Writing Platform
          </div>

          <h1 className="lp-serif" style={{ fontSize: 'clamp(44px, 7vw, 88px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: 800, color: 'var(--lp-white)', animation: 'lp-fadeUp .7s .1s ease both' }}>
            From <em style={{ fontStyle: 'italic', color: 'var(--lp-gold)', position: 'relative' }}>Idea</em><br />to Global — in Days.
          </h1>

          <p style={{ marginTop: 24, fontSize: 18, fontWeight: 400, color: 'var(--lp-muted)', maxWidth: 480, lineHeight: 1.6, animation: 'lp-fadeUp .7s .2s ease both' }}>
            Write, translate, and publish your novel to Amazon KDP and global markets with the power of AI — without losing your voice.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 40, animation: 'lp-fadeUp .7s .3s ease both', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setCurrentView('dashboard')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--lp-white)', color: '#000', fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 50, border: 'none', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s, background .2s', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'; e.currentTarget.style.background = '#e8e8ea'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; e.currentTarget.style.background = 'var(--lp-white)'; }}
            >
              <svg fill="none" viewBox="0 0 16 16" width="16" height="16"><path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10v2a2 2 0 002 2h8a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Start Writing Free
            </button>
            <button onClick={() => scrollTo('how')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--lp-muted)', fontSize: 15, fontWeight: 500, padding: '14px 20px', borderRadius: 50, border: '1px solid var(--lp-border-bright)', cursor: 'pointer', transition: 'color .2s, border-color .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-muted)'; e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; }}
            >
              See how it works →
            </button>
          </div>

          <div style={{ marginTop: 48, animation: 'lp-fadeUp .7s .4s ease both', width: '100%', maxWidth: 640 }}>
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

        {/* STATS STRIP */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0, borderTop: '1px solid var(--lp-border)', borderBottom: '1px solid var(--lp-border)', background: 'var(--lp-surface)' }}>
          {stats.map((s) => (
            <div key={s.label}
              style={{ flex: 1, minWidth: 140, maxWidth: 220, padding: '28px 24px', textAlign: 'center', borderRight: '1px solid var(--lp-border)', transition: 'background .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--lp-glass-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div className="lp-serif" style={{ fontSize: 32, fontWeight: 600, color: 'var(--lp-white)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {s.num}<span style={{ color: 'var(--lp-gold)' }}>{s.suffix}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--lp-muted)', marginTop: 4, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section id="features" style={{ padding: '100px 24px' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div className="reveal">
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Platform</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)', maxWidth: 520 }}>Every tool a novelist needs, unified.</h2>
              <p style={{ marginTop: 16, fontSize: 16, color: 'var(--lp-muted)', maxWidth: 440, lineHeight: 1.65 }}>From the first line to the published page — Novelify handles the complexity so you stay in the story.</p>
            </div>

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, marginTop: 56 }}>
              {/* Translation */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 7', background: 'linear-gradient(135deg, var(--lp-surface2) 0%, #0f0f14 100%)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 18, background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)' }}>🌐</div>
                <h3 className="lp-serif" style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>Literary Translation</h3>
                <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Not machine translation — AI that understands tone, idiom, and narrative voice. Publish in multiple languages without losing your soul.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20 }}>
                  {langPills.map((l) => (
                    <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: 'var(--lp-glass)', border: '1px solid var(--lp-border)', color: 'rgba(245,245,247,0.6)', transition: 'all .2s', cursor: 'default' }}>
                      {l.flag && <span style={{ fontSize: 14 }}>{l.flag}</span>}
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* KDP */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 5', background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 18, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.18)' }}>📦</div>
                <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>One-Click KDP Publish</h3>
                <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Export perfect EPUB files and publish directly to Amazon KDP — formatted, optimized, and ready for global readers.</p>
                <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,153,0,0.08)', border: '1px solid rgba(255,153,0,0.18)', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#FF9900' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 1.5L10 6h4.5l-3.5 2.5 1.5 4.5L8 10.5l-4.5 3L5 9 1.5 6.5H6L8 1.5z" fill="#FF9900" opacity=".9"/></svg>
                  Amazon KDP Ready
                </div>
              </div>

              {/* AI Co-Pilot */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 5', background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 18, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.18)' }}>✨</div>
                <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>AI Writing Co-Pilot</h3>
                <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Get contextual suggestions, continue scenes, and overcome writer&apos;s block without leaving your creative flow.</p>
                <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Chapter 1', pct: '100%', w: '100%' },
                    { label: 'Chapter 2', pct: '72%', w: '72%' },
                    { label: 'Chapter 3', pct: '24%', w: '24%' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--lp-muted)', marginBottom: 5 }}>
                        <span>{item.label}</span><span>{item.pct}</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--lp-border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div className="lp-progress-fill" style={{ width: item.w }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EPUB */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 7', background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 18, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}>📄</div>
                <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>Professional EPUB Export</h3>
                <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>Beautifully typeset EPUB files, auto-chapter splitting, cover integration, and metadata — all in one export. Readers expect quality; Novelify delivers it.</p>
              </div>

              {/* Bottom row */}
              <div className="lp-card-hover" style={{ gridColumn: 'span 12', background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s, box-shadow .25s', display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { icon: '🔒', bg: 'rgba(201,169,110,0.12)', border: 'rgba(201,169,110,0.2)', title: 'Your Voice, Your Rights', desc: 'All content you create stays yours. Novelify never trains on your writing, and you retain full copyright over every word.' },
                  { icon: '📊', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.18)', title: 'Royalty Intelligence', desc: 'Track estimated royalties across markets and languages before you publish. Know your earning potential before the launch.' },
                  { icon: '🎯', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.18)', title: 'Genre Targeting', desc: 'AI-assisted genre positioning and keyword optimization so your book reaches the right readers on Amazon and beyond.' },
                ].map((item, idx) => (
                  <div key={item.title} style={{ flex: 1, minWidth: 220, ...(idx > 0 ? { borderLeft: '1px solid var(--lp-border)', paddingLeft: 40 } : {}) }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 18, background: item.bg, border: `1px solid ${item.border}` }}>{item.icon}</div>
                    <h3 className="lp-serif" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--lp-white)', marginBottom: 8 }}>{item.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.65 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{ padding: '100px 24px', background: 'var(--lp-surface)' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div className="reveal">
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Process</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)', maxWidth: 520 }}>From blank page to bestseller — four steps.</h2>
              <p style={{ marginTop: 16, fontSize: 16, color: 'var(--lp-muted)', maxWidth: 440, lineHeight: 1.65 }}>A focused workflow that keeps you writing, not managing tools.</p>
            </div>

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, marginTop: 56, border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', overflow: 'hidden' }}>
              {steps.map((step) => (
                <div key={step.num}
                  style={{ padding: '36px 28px', background: 'var(--lp-surface)', transition: 'background .2s', borderRight: '1px solid var(--lp-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--lp-surface2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--lp-surface)'; }}
                >
                  <div className="lp-serif" style={{ fontSize: 48, fontWeight: 600, color: 'rgba(255,255,255,0.04)', lineHeight: 1, marginBottom: 16, letterSpacing: '-0.03em' }}>{step.num}</div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--lp-white)', marginBottom: 8 }}>{step.title}</h4>
                  <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.6 }}>{step.desc}</p>
                  <div style={{ display: 'inline-block', marginTop: 16, fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{step.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: '100px 24px' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div className="reveal">
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Writers Say</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)' }}>Trusted by serious authors.</h2>
            </div>

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 56 }}>
              {testimonials.map((t) => (
                <div key={t.name} className="lp-tcard-hover" style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: 'var(--lp-r)', padding: 28, transition: 'border-color .2s, transform .2s' }}>
                  <div style={{ color: 'var(--lp-gold)', fontSize: 12, marginBottom: 14, letterSpacing: 2 }}>{t.stars}</div>
                  <p className="lp-serif" style={{ fontSize: 15, fontStyle: 'italic', color: 'rgba(245,245,247,0.75)', lineHeight: 1.7, marginBottom: 20 }}>{t.quote}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, background: t.color, color: t.textColor }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lp-white)' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--lp-muted)' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
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

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 56 }}>
              {plans.map((plan) => (
                <div key={plan.tier} className="lp-pcard-hover" style={{
                  background: plan.featured ? 'linear-gradient(160deg, #16102A 0%, #0f0f14 100%)' : 'var(--lp-surface)',
                  border: `1px solid ${plan.featured ? 'rgba(167,139,250,0.3)' : 'var(--lp-border)'}`,
                  borderRadius: 'var(--lp-r)',
                  padding: '32px 28px',
                  position: 'relative',
                  transition: 'transform .25s, box-shadow .25s',
                  boxShadow: plan.featured ? '0 0 40px rgba(167,139,250,0.06)' : 'none',
                }}>
                  {plan.featured && (
                    <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, var(--lp-purple), #8B5CF6)', borderRadius: '0 0 10px 10px', padding: '4px 16px', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Most Popular
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600, color: plan.featured ? 'var(--lp-purple)' : 'var(--lp-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{plan.tier}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 20, color: plan.featured ? 'var(--lp-white)' : 'var(--lp-muted)', marginRight: 2 }}>$</span>
                    <span className="lp-serif" style={{ fontSize: 42, fontWeight: 600, color: 'var(--lp-white)', letterSpacing: '-0.03em' }}>{plan.price}</span>
                    <span style={{ fontSize: 13, color: 'var(--lp-muted)' }}>/ month</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--lp-muted)', marginBottom: 24 }}>{plan.desc}</p>
                  <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10, padding: 0 }}>
                    {plan.features.map((f) => (
                      <li key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: f.muted ? 'rgba(142,142,147,0.5)' : 'rgba(245,245,247,0.7)' }}>
                        <span style={{ color: f.muted ? 'var(--lp-muted)' : 'var(--lp-gold)', fontWeight: 700, flexShrink: 0, fontSize: 12, marginTop: 1 }}>{f.muted ? '–' : '✓'}</span>
                        {f.text}
                      </li>
                    ))}
                  </ul>
                  {plan.featured ? (
                    <button onClick={() => setCurrentView('dashboard')}
                      style={{ width: '100%', display: 'block', textAlign: 'center', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--lp-purple), #7C3AED)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.35)', transition: 'all .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >Start Author Plan</button>
                  ) : (
                    <button onClick={() => setCurrentView('dashboard')}
                      style={{ width: '100%', display: 'block', textAlign: 'center', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1px solid var(--lp-border-bright)', cursor: 'pointer', background: 'var(--lp-glass)', color: 'var(--lp-white)', transition: 'all .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--lp-glass-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--lp-glass)'; }}
                    >{plan.tier === 'Starter' ? 'Get Started' : 'Start Publisher Plan'}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
          <div className="reveal" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lp-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Begin</div>
            <h2 className="lp-serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--lp-white)', maxWidth: 560, margin: '0 auto' }}>Your story deserves to be read — everywhere.</h2>
            <p style={{ marginTop: 16, fontSize: 16, color: 'var(--lp-muted)', maxWidth: 400, lineHeight: 1.65, margin: '16px auto 0' }}>Join 12,000+ writers who chose to go global with Novelify.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 36, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setCurrentView('dashboard')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--lp-white)', color: '#000', fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 50, border: 'none', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s, background .2s', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'; e.currentTarget.style.background = '#e8e8ea'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; e.currentTarget.style.background = 'var(--lp-white)'; }}
              >
                Start Writing for Free
              </button>
              <button onClick={() => scrollTo('pricing')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--lp-muted)', fontSize: 15, fontWeight: 500, padding: '14px 20px', borderRadius: 50, border: '1px solid var(--lp-border-bright)', cursor: 'pointer', transition: 'color .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-muted)'; e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; }}
              >View Pricing</button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid var(--lp-border)', padding: '40px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, background: 'var(--lp-surface)' }}>
          <a className="lp-serif" href="#" style={{ fontSize: 15, fontWeight: 600, color: 'var(--lp-white)', textDecoration: 'none' }}>Novelify</a>
          <ul style={{ display: 'flex', gap: 20, flexWrap: 'wrap', listStyle: 'none', margin: 0 }}>
            {['Features', 'Pricing', 'Blog', 'Privacy', 'Terms', 'Contact'].map((link) => (
              <li key={link}>
                <a href="#" style={{ fontSize: 13, color: 'var(--lp-muted)', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-white)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-muted)'; }}
                >{link}</a>
              </li>
            ))}
          </ul>
          <span style={{ fontSize: 12, color: 'rgba(142,142,147,0.5)' }}>© 2025 Novelify. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
}
