'use client';

import { FileEdit, Sparkles, BookOpen, CheckCircle, BookMarked } from 'lucide-react';

interface ContextualRevealProps {
  feature: 'revision' | 'continuity' | 'publishing' | 'marketing' | 'translation' | 'affiliate';
  wordCount: number;
  chapterCount: number;
  hasSynopsis: boolean;
  ctaLabel?: string;
  onCta?: () => void;
}

const FEATURE_CONFIG: Record<string, { icon: React.ElementType; title: string; guidanceLow: string; guidanceReady: string; ctaLow: string; ctaReady: string }> = {
  revision: {
    icon: FileEdit,
    title: 'Revision',
    guidanceLow: 'Write your first scene first. Revision tools will help after you have a draft worth polishing.',
    guidanceReady: 'Your draft is ready for revision. Novelify can help improve pacing, clarity, and emotion.',
    ctaLow: 'Go to Writing Studio',
    ctaReady: 'Run your first revision',
  },
  continuity: {
    icon: CheckCircle,
    title: 'Continuity',
    guidanceLow: 'Continuity checks become useful after several chapters when you need to track details across scenes.',
    guidanceReady: 'You have enough chapters for a meaningful continuity check.',
    ctaLow: 'Open Writing Studio',
    ctaReady: 'Check continuity',
  },
  publishing: {
    icon: BookOpen,
    title: 'Publishing',
    guidanceLow: 'Publishing tools will help when your manuscript takes shape. Focus on writing your draft first.',
    guidanceReady: 'Your manuscript is developing. Prepare metadata and exports for publishing.',
    ctaLow: 'Continue Writing',
    ctaReady: 'Prepare for publishing',
  },
  marketing: {
    icon: BookMarked,
    title: 'Marketing Kit',
    guidanceLow: 'Create a synopsis first. Marketing tools will help you generate blurbs and descriptions when your story has a clear premise.',
    guidanceReady: 'Generate your book description, blurb, and marketing materials.',
    ctaLow: 'Create Synopsis',
    ctaReady: 'Generate book description',
  },
  translation: {
    icon: Sparkles,
    title: 'Translation',
    guidanceLow: 'Translate when you have a chapter ready. Translation preserves your story voice across languages.',
    guidanceReady: 'Chapters ready for translation.',
    ctaLow: 'Open Writing Studio',
    ctaReady: 'Translate chapter',
  },
  affiliate: {
    icon: BookMarked,
    title: 'Affiliate Program',
    guidanceLow: 'Share Novelify with other writers and earn commission when they subscribe. Available after you have explored the product.',
    guidanceReady: 'Share Novelify with other writers and earn commission when they subscribe.',
    ctaLow: 'Learn More',
    ctaReady: 'Join Affiliate Program',
  },
};

export function ContextualFeatureReveal({ feature, wordCount, chapterCount, hasSynopsis, ctaLabel, onCta }: ContextualRevealProps) {
  const cfg = FEATURE_CONFIG[feature];
  if (!cfg) return null;

  const isReady = feature === 'revision' ? wordCount >= 300 :
    feature === 'continuity' ? chapterCount >= 3 :
    feature === 'publishing' ? wordCount >= 5000 :
    feature === 'marketing' ? hasSynopsis :
    feature === 'translation' ? wordCount >= 1000 :
    feature === 'affiliate' ? false : false;

  const Icon = cfg.icon;

  return (
    <div style={{
      padding: 20, borderRadius: 14,
      background: isReady ? 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02))' : 'rgba(142,142,147,0.04)',
      border: isReady ? '1px solid rgba(52,211,153,0.15)' : '1px solid rgba(255,255,255,0.06)',
      textAlign: 'center',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: isReady ? 'rgba(52,211,153,0.10)' : 'rgba(142,142,147,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
        color: isReady ? '#34D399' : '#636366',
      }}>
        <Icon style={{ width: 18, height: 18 }} />
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: isReady ? '#34D399' : '#8E8E93', marginBottom: 6 }}>
        {cfg.title}
      </h3>
      <p style={{ fontSize: 11, color: '#636366', lineHeight: 1.6, marginBottom: 14, maxWidth: 300, margin: '0 auto 14px' }}>
        {isReady ? cfg.guidanceReady : cfg.guidanceLow}
      </p>
      {onCta && (
        <button onClick={onCta} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 20,
          border: isReady ? 'none' : '1px solid rgba(255,255,255,0.08)',
          background: isReady ? '#34D399' : 'transparent',
          color: isReady ? '#080808' : '#8E8E93',
          fontSize: 11, fontWeight: 600, cursor: 'pointer',
        }}>
          {ctaLabel || (isReady ? cfg.ctaReady : cfg.ctaLow)}
        </button>
      )}
    </div>
  );
}
