'use client';

import { useRouter } from 'next/navigation';
import {
  Heart, Sparkles, Search, Users, Globe, FileText,
  BookOpen, AlignLeft, BookMarked, PenTool,
  Layout, Download, Layers, Settings,
} from 'lucide-react';
import { colors } from './dashboard-components';

const genres = [
  { id: 'romance', icon: Heart, name: 'Romance', desc: 'Meet-cute, conflict, resolution' },
  { id: 'fantasy', icon: Sparkles, name: 'Fantasy', desc: 'World-building, quest, climax' },
  { id: 'mystery', icon: Search, name: 'Mystery', desc: 'Crime, investigation, twist' },
  { id: 'ya', icon: Users, name: 'Young Adult', desc: 'Coming-of-age, voice-driven' },
  { id: 'webnovel', icon: Globe, name: 'Webnovel', desc: 'Serialized, fast-paced' },
  { id: 'blank', icon: FileText, name: 'Blank Novel', desc: 'Start from scratch' },
];

const workflowSteps = [
  { number: 1, icon: BookOpen, label: 'Choose Your Story', desc: 'Pick a genre and template' },
  { number: 2, icon: AlignLeft, label: 'Generate Outline', desc: 'AI builds your chapter plan' },
  { number: 3, icon: BookMarked, label: 'Build Bible', desc: 'Define characters and world' },
  { number: 4, icon: PenTool, label: 'Start Writing', desc: 'Write your first chapter' },
];

const benefits = [
  { icon: Sparkles, title: 'AI-Powered Outline', desc: 'Generate complete chapter outlines from your premise' },
  { icon: BookMarked, title: 'Story Bible Starter', desc: 'Build rich character profiles and world lore' },
  { icon: Layout, title: 'Plot Board Starter', desc: 'Visualize your story structure with plot beats' },
  { icon: Download, title: 'Publishing-Ready', desc: 'Export formatted manuscripts for any platform' },
];

export function ActivationScreen() {
  const router = useRouter();

  const handleTemplate = (id: string) => {
    router.push(`/dashboard/projects/new?template=${id}`);
  };

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>

        {/* ─── Hero ─── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontFamily: "'Playfair Display',serif", fontSize: 38, fontWeight: 700,
            color: '#F5F5F7', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12,
          }}>
            Start your first novel with Novelify
          </h1>
          <p style={{ fontSize: 14, color: colors.muted, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            Choose a genre, pick a structure, let AI build your first outline, then begin writing in your studio.
          </p>
        </div>

        {/* ─── Primary CTAs ─── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/dashboard/projects/new')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 24, border: 'none',
              background: colors.gold, color: '#1a0f00',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Sparkles style={{ width: 16, height: 16 }} /> Create Your First Novel
          </button>
          <button onClick={() => router.push('/dashboard/projects/new')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 24,
              border: `1px solid ${colors.goldBorder}`,
              background: 'rgba(201,169,110,0.06)', color: colors.gold,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <AlignLeft style={{ width: 16, height: 16 }} /> Start with AI Outline
          </button>
          <button onClick={() => router.push('/dashboard/projects/new?template=blank')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 24,
              border: `1px solid ${colors.border}`,
              background: '#161616', color: '#aeaeb2',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <FileText style={{ width: 16, height: 16 }} /> Start from Blank
          </button>
        </div>

        {/* ─── Genre Templates ─── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600,
            color: '#F5F5F7', textAlign: 'center', marginBottom: 20,
          }}>
            Choose a Genre Template
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {genres.map((genre) => {
              const Icon = genre.icon;
              return (
                <button key={genre.id} onClick={() => handleTemplate(genre.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: 8, padding: 16, borderRadius: 14,
                    background: colors.cardBg, border: `1px solid ${colors.border}`,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color .2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.goldBorder; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: colors.goldBg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: colors.gold,
                  }}>
                    <Icon style={{ width: 17, height: 17 }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{genre.name}</div>
                  <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.4 }}>{genre.desc}</div>
                  <span style={{ fontSize: 10, color: colors.gold, fontWeight: 500 }}>Use Template →</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Workflow ─── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600,
            color: '#F5F5F7', textAlign: 'center', marginBottom: 24,
          }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 24, left: '12.5%', right: '12.5%',
              height: 2,
              background: `linear-gradient(90deg, ${colors.gold}, rgba(255,255,255,0.06))`,
              zIndex: 0,
            }} />
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10, position: 'relative', zIndex: 1,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: colors.goldBg,
                    border: `2px solid ${colors.goldBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.gold, position: 'relative',
                  }}>
                    <Icon style={{ width: 20, height: 20 }} />
                    <div style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: colors.gold, color: '#1a0f00',
                      fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {step.number}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#F5F5F7', marginBottom: 2 }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 9, color: colors.muted, lineHeight: 1.3 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Benefits ─── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600,
            color: '#F5F5F7', textAlign: 'center', marginBottom: 20,
          }}>
            Everything You Need
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} style={{
                  padding: 18, borderRadius: 14,
                  background: colors.cardBg, border: `1px solid ${colors.border}`,
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: colors.goldBg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: colors.gold,
                  }}>
                    <Icon style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7', marginBottom: 2 }}>
                      {b.title}
                    </div>
                    <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.5 }}>
                      {b.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Secondary CTAs ─── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard/templates')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 20,
              border: `1px solid ${colors.border}`, background: '#161616',
              color: '#aeaeb2', fontSize: 12, fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Layers style={{ width: 14, height: 14 }} /> Explore Templates
          </button>
          <button onClick={() => router.push('/dashboard/settings')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 20,
              border: `1px solid ${colors.border}`, background: '#161616',
              color: '#aeaeb2', fontSize: 12, fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Settings style={{ width: 14, height: 14 }} /> Settings
          </button>
        </div>

      </div>
    </div>
  );
}
