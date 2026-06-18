'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PenTool, Plus, Sparkles, BookOpen, FileText, CheckCircle2, Target, BookMarked, Upload } from 'lucide-react';
import { useNovelifyStore, type Project, type Chapter } from '@/lib/store';
import { colors, FadeIn, GlassButton } from './dashboard-components';
import { getStageFromProjects, STAGE_DASHBOARD_RECOMMENDATIONS, type UserStage } from '@/lib/user-stage';

interface Props {
  projects: Project[];
  totalWords: number;
  lastEdited: Project | undefined;
  lastChapter: Chapter | null;
  navigate: (view: string, project?: Project | null) => void;
  onCreateNew: () => void;
}

const STAGE_ICONS: Record<string, React.ElementType> = {
  NEW_USER: BookOpen,
  FIRST_PROJECT_CREATED: PenTool,
  ACTIVE_WRITER: Sparkles,
  DRAFT_IN_PROGRESS: Target,
  READY_TO_PUBLISH: CheckCircle2,
  POWER_USER: BookMarked,
};

export function StageDashboardBanner({ projects, totalWords, lastEdited, lastChapter, navigate, onCreateNew }: Props) {
  const router = useRouter();

  const stage = useMemo(() => {
    return getStageFromProjects(projects, false);
  }, [projects]);

  const recommendation = STAGE_DASHBOARD_RECOMMENDATIONS[stage];

  const handleAction = (action: string) => {
    switch (action) {
      case 'create-first':
        router.push('/dashboard/start');
        break;
      case 'sample':
        router.push('/onboarding');
        break;
      case 'start-chapter':
        if (lastEdited) navigate('writing', lastEdited);
        break;
      case 'story-bible':
        if (lastEdited) navigate('story-bible', lastEdited);
        break;
      case 'continue-writing':
        if (lastEdited) navigate('writing', lastEdited);
        break;
      case 'revision':
        if (lastEdited) navigate('revision', lastEdited);
        break;
      case 'continuity':
        if (lastEdited) navigate('revision', lastEdited);
        break;
      case 'publishing':
        if (lastEdited) navigate('publishing', lastEdited);
        break;
      case 'export':
        if (lastEdited) navigate('publishing', lastEdited);
        break;
      case 'my-novels':
        navigate('my-novels');
        break;
      case 'settings':
        navigate('settings');
        break;
      default:
        if (lastEdited) navigate('writing', lastEdited);
    }
  };

  const StageIcon = STAGE_ICONS[stage] || BookOpen;

  return (
    <FadeIn>
      <div className="grid-cols-1 md:grid-cols-[1fr_auto]" style={{
        display: 'grid', gap: 16, alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(201,169,110,0.08), rgba(201,169,110,0.02))',
        border: `1px solid ${colors.goldBorder}`, borderRadius: 20, padding: '24px 28px',
      }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
            {recommendation.title}
          </h2>
          <p style={{ fontSize: 12, color: colors.muted, lineHeight: 1.6 }}>
            {lastChapter && stage !== 'NEW_USER'
              ? `Chapter ${lastChapter.chapterNumber}: ${lastChapter.title} · Last saved ${timeAgo(lastChapter.updatedAt)}`
              : recommendation.description}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleAction(recommendation.action)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 20, border: 'none',
                background: colors.gold, color: '#1a0f00',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'opacity .15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <StageIcon style={{ width: 14, height: 14 }} /> {recommendation.cta}
            </button>
            {recommendation.ctaSecondary && (
              <button
                onClick={() => handleAction(recommendation.actionSecondary || '')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '8px 16px', borderRadius: 20,
                  border: `1px solid ${colors.goldBorder}`,
                  background: 'rgba(201,169,110,0.06)', color: colors.gold,
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}
              >
                {recommendation.ctaSecondary}
              </button>
            )}
            <button onClick={onCreateNew}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '8px 16px', borderRadius: 20,
                border: `1px solid ${colors.border}`,
                background: '#161616', color: '#aeaeb2',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus style={{ width: 13, height: 13 }} /> New Novel
            </button>
          </div>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(201,169,110,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.gold, flexShrink: 0,
        }}>
          <StageIcon style={{ width: 22, height: 22 }} />
        </div>
      </div>
    </FadeIn>
  );
}

function timeAgo(date: string | Date): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
