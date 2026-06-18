'use client';

import { useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const GOLD = 'var(--novel-gold)';
const DARK = 'var(--novel-surface)';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  backLink?: boolean;
}

export function AuthLayout({ children, title, subtitle, backLink = true }: AuthLayoutProps) {
  useEffect(() => {
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--novel-surface)]" style={{ background: DARK }}>
      {/* Left Column — Auth Form */}
      <div className="relative flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 lg:flex-none lg:px-20 xl:px-28">
        {/* Background subtle pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, var(--novel-gold-bg) 0%, transparent 50%)`,
        }} />

        <div className="relative mx-auto w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image src="/images/Novelify_logo.jpeg" alt="Novelify" width={120} height={30} style={{ objectFit: 'contain' }} />
            </Link>
          </div>

          {/* Title area */}
          <h1
            className="text-[28px] font-semibold leading-tight tracking-tight mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: 'var(--novel-text)' }}
          >
            {title}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--novel-muted)', lineHeight: 1.5 }}>
            {subtitle}
          </p>

          {/* Form */}
          {children}

          {/* Footer legal */}
          <div className="mt-10 pt-6 border-t" style={{ borderColor: 'var(--novel-border)' }}>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]" style={{ color: 'var(--novel-muted-dark)' }}>
              <Link href="/terms" className="hover:text-[var(--novel-muted)] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[var(--novel-muted)] transition-colors">Privacy</Link>
              <Link href="/manuscript-privacy" className="hover:text-[var(--novel-muted)] transition-colors">Manuscript Privacy</Link>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed" style={{ color: 'var(--novel-muted-darker)' }}>
              Your manuscript belongs to you. Novelify provides the tools to plan, write, revise, translate, and publish with confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column — Visual Panel */}
      <div className="relative hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col overflow-hidden bg-gradient-to-br from-[var(--novel-bg)] via-[var(--novel-surface)] to-[var(--novel-card)]">
        {/* Novel Cover Collage */}
        <div className="absolute inset-0" style={{ maxWidth: 820 }}>
          <NovelCoverCollage />
        </div>

        {/* Gradient overlay at bottom for text */}
        <div className="absolute inset-x-0 bottom-0 h-[45%]" style={{
          background: 'linear-gradient(0deg, var(--novel-surface) 20%, color-mix(in srgb, var(--novel-surface) 60%, transparent) 60%, transparent 100%)',
        }} />

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-10 xl:p-14 z-10">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, var(--novel-gold), var(--novel-gold-border))' }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--novel-gold)' }}>
                Novel Writing Studio
              </span>
            </div>
            <h2
              className="text-[26px] font-semibold leading-tight tracking-tight mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: 'var(--novel-text)' }}
            >
              Where stories become structured, polished, and ready to publish.
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--novel-muted)' }}>
              Plan, write, revise, translate, and publish in one focused studio for authors.
            </p>
            <div className="flex flex-wrap gap-y-2 gap-x-5">
              {[
                'Story planning',
                'AI-assisted drafting',
                'Revision & continuity',
                'Publishing-ready export',
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--novel-text-secondary)' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                    <circle cx="6" cy="6" r="5" stroke="var(--novel-gold)" strokeWidth="1.2" opacity="0.5" />
                    <path d="M4 6.5L5.5 8L8 4.5" stroke="var(--novel-gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NovelCoverCollage() {
  const covers = [
    {
      id: 1, w: 160, h: 240, x: 50, y: 50, r: -4,
      src: '/auth/covers/p5896874.jpg',
      accent: '#e94560',
      title: 'The Midnight Protocol',
      author: 'S. A. Blackwell',
    },
    {
      id: 2, w: 140, h: 210, x: 240, y: 70, r: 2,
      src: '/auth/covers/p4434462.jpg',
      accent: '#e8c98a',
      title: 'Velvet Thorn',
      author: 'C. D. Marlowe',
    },
    {
      id: 3, w: 150, h: 225, x: 100, y: 330, r: 3,
      src: '/auth/covers/p7394282.jpg',
      accent: '#f0e6d3',
      title: 'The Iron Tide',
      author: 'K. A. Hayashi',
    },
    {
      id: 4, w: 170, h: 250, x: 310, y: 320, r: -3,
      src: '/auth/covers/p5047170.jpg',
      accent: '#d4a574',
      title: 'Beneath the Ashes',
      author: 'R. T. Crawford',
    },
    {
      id: 5, w: 130, h: 195, x: 280, y: 150, r: 4,
      src: '/auth/covers/p7510186.jpg',
      accent: '#94a3b8',
      title: 'Signal Drift',
      author: 'L. Nakamura',
    },
    {
      id: 6, w: 155, h: 235, x: 500, y: 200, r: -2,
      src: '/auth/covers/p3945317.jpg',
      accent: '#c9a96e',
      title: 'The Hollow Crown',
      author: 'E. W. Sinclair',
    },
    {
      id: 7, w: 135, h: 200, x: 500, y: 60, r: 1,
      src: '/auth/covers/p7265801.jpg',
      accent: '#e8d5b7',
      title: 'Cartographer\'s Dream',
      author: 'M. R. Jameson',
    },
    {
      id: 8, w: 145, h: 215, x: 680, y: 110, r: -5,
      src: '/auth/covers/p7829154.jpg',
      accent: '#f0c0a0',
      title: 'Silk and Shadow',
      author: 'N. D. Thorne',
    },
    {
      id: 9, w: 150, h: 225, x: 610, y: 360, r: 3,
      src: '/auth/covers/p4840970.jpg',
      accent: '#d4c4a0',
      title: 'Verdant Rising',
      author: 'A. P. Greenwood',
    },
    {
      id: 10, w: 135, h: 200, x: 780, y: 300, r: -1,
      src: '/auth/covers/p4596549.jpg',
      accent: '#c9a96e',
      title: 'The Amber Locket',
      author: 'J. Whitfield',
    },
  ];

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[var(--novel-gold)]/[0.02] blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-[#A78BFA]/[0.02] blur-3xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--novel-gold)]/15 to-transparent" />

      {covers.map((book) => (
        <div
          key={book.id}
          className="absolute"
          style={{
            left: book.x, top: book.y, width: book.w, height: book.h,
            transform: `rotate(${book.r}deg)`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = `rotate(${book.r}deg) translateY(-4px)`;
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = `rotate(${book.r}deg)`;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            className="w-full h-full rounded-[3px] overflow-hidden relative select-none"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 var(--novel-border)',
            }}
          >
            <Image
              src={book.src}
              alt={book.title}
              fill
              sizes="200px"
              className="object-cover"
              priority={book.id <= 3}
            />
            {/* Overlay gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ background: `linear-gradient(180deg, ${book.accent}55, ${book.accent}99, ${book.accent}55)` }}
            />
            <div
              className="absolute top-0 left-0 right-0 h-[60px]"
              style={{ background: `linear-gradient(180deg, ${book.accent}20, transparent)` }}
            />
            <div
              className="absolute bottom-[52px] left-[14px] right-[14px] text-center font-semibold leading-tight tracking-tight z-10"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: Math.min(13, book.w / 12),
                color: 'var(--novel-text)',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {book.title}
            </div>
            <div
              className="absolute bottom-[28px] left-[14px] right-[14px] text-center text-[10px] font-normal tracking-wider uppercase z-10"
              style={{
                fontFamily: "'Geist', system-ui, sans-serif",
                color: book.accent, opacity: 0.85,
                letterSpacing: '0.08em',
                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
            >
              {book.author}
            </div>
            <div
              className="absolute bottom-[20px] left-[30%] right-[30%] h-px z-10"
              style={{ background: `linear-gradient(90deg, transparent, ${book.accent}66, transparent)` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
