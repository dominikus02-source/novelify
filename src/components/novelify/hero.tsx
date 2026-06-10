'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useNovelifyStore } from '@/lib/store';

const featurePills = [
  'AI Writing',
  'Literary Translation',
  'EPUB Export',
  'KDP Ready',
  'Multi-Language',
  'Global Reach',
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  }),
};

export function Hero() {
  const setCurrentView = useNovelifyStore((s) => s.setCurrentView);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#0D0D0D]">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 75% 40%, rgba(200,135,58,0.12) 0%, transparent 70%)',
        }}
      />

      {/* ─── Top bar ─── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0 }}
        className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#C8873A]" />
          <span className="font-bold text-lg text-[#F7F3EC]">Noveli</span>
          <span className="font-bold text-lg text-[#C8873A]">fy</span>
        </div>

        <span className="rounded-full border border-[#C8873A]/30 bg-[#C8873A]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-[#C8873A]">
          Technical Blueprint v1.0
        </span>
      </motion.header>

      {/* ─── Main content ─── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center md:px-12">
        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#C8873A]"
        >
          AI-Powered Writing Platform
        </motion.p>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mb-6 max-w-4xl font-serif text-5xl font-bold leading-tight tracking-tight text-[#F7F3EC] md:text-7xl md:leading-[1.1]"
        >
          From Idea to{' '}
          <span className="italic text-[#C8873A]">Global</span>
          <span className="text-[#F7F3EC]">&mdash; in Days.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mb-10 max-w-2xl text-base leading-relaxed text-[#F7F3EC]/50 md:text-lg"
        >
          A complete platform that helps writers craft, translate, and publish
          their novels to global markets like Amazon KDP.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mb-12 flex flex-wrap items-center justify-center gap-2"
        >
          {featurePills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-[#C8873A]/40 bg-[#C8873A]/15 px-3 py-1 text-xs font-medium text-[#C8873A]"
            >
              {pill}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setCurrentView('dashboard')}
          className="group inline-flex items-center gap-2 rounded-lg bg-[#C8873A] px-8 py-3.5 text-sm font-semibold text-[#0D0D0D] transition-shadow hover:shadow-lg hover:shadow-[#C8873A]/25"
        >
          Start Writing
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      </div>

      {/* ─── Bottom bar ─── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-10 flex items-center justify-between border-t border-white/5 px-6 py-4 md:px-12"
      >
        <span className="text-xs text-[#F7F3EC]/30">Novelify Platform</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8873A]">
          Fullstack Spec
        </span>
      </motion.footer>
    </section>
  );
}
