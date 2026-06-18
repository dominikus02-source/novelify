'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PenTool, Sparkles, FileEdit, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { type Project } from '@/lib/store';

const chapterGoals = [
  'Introduce your protagonist',
  'Set the scene and atmosphere',
  'Hint at the main conflict',
  'Make the reader want to turn the page',
];

interface FirstWritingGuideProps {
  project: Project;
  onStartWriting: () => void;
  onAskAi: () => void;
  onEditOutline: () => void;
}

export function FirstWritingGuide({ project, onStartWriting, onAskAi, onEditOutline }: FirstWritingGuideProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('novelify:firstGuideDismissed') === 'true';
  });

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('novelify:firstGuideDismissed', 'true'); } catch {}
  };

  if (dismissed) return null;

  const chapter = (project as any)?.chapters?.[0];
  const sceneGoal = (project as any)?.chapters?.[0]?.scenes?.[0]?.goal || 'Open your story with a compelling moment that introduces the world and your main character.';

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(201,169,110,0.08), rgba(201,169,110,0.02))',
          border: '1px solid rgba(201,169,110,0.2)', borderRadius: 16, padding: 24, marginBottom: 16,
        }}
      >
        <button onClick={handleDismiss} style={{
          position: 'absolute', top: 12, right: 12, padding: 4, borderRadius: 6,
          border: 'none', background: 'rgba(255,255,255,0.04)', color: '#636366',
          cursor: 'pointer', display: 'flex',
        }}>
          <X style={{ width: 14, height: 14 }} />
        </button>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(201,169,110,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: '#C9A96E',
          }}>
            <PenTool style={{ width: 22, height: 22 }} />
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#F5F5F7', marginBottom: 2 }}>
              Your first chapter is ready
            </h3>
            <p style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>
              <span style={{ color: '#C9A96E', fontWeight: 600 }}>{project.title}</span>
              {chapter ? ` — ${chapter.title || 'Chapter 1'}` : ''}
            </p>
            <p style={{ fontSize: 11, color: '#636366', lineHeight: 1.5, marginBottom: 14 }}>
              {sceneGoal}
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={onStartWriting} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: '#C9A96E', color: '#1a0f00',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                <PenTool style={{ width: 14, height: 14 }} /> Start Writing
              </button>
              <button onClick={onAskAi} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(201,169,110,0.3)',
                background: 'rgba(201,169,110,0.06)', color: '#C9A96E',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                <Sparkles style={{ width: 14, height: 14 }} /> Ask AI to Draft Opening
              </button>
              <button onClick={onEditOutline} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent', color: '#8E8E93',
                fontSize: 11, fontWeight: 500, cursor: 'pointer',
              }}>
                <FileEdit style={{ width: 12, height: 12 }} /> Edit Outline First
              </button>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 14,
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#636366', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Scene Goal
              </div>
              <div style={{ fontSize: 12, color: '#aeaeb2', lineHeight: 1.6, marginBottom: 10 }}>
                {sceneGoal}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#636366', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Main Conflict
              </div>
              <div style={{ fontSize: 12, color: '#aeaeb2', lineHeight: 1.6 }}>
                {project.plotOutline || 'The central tension of your story will drive every scene forward.'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
