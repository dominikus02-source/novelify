'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';

const STORY_TYPES = [
  { id: 'novel', label: 'A novel', desc: 'A full-length story' },
  { id: 'novella', label: 'A novella', desc: 'A shorter novel' },
  { id: 'short story', label: 'A short story', desc: 'A focused narrative' },
  { id: 'series', label: 'A series', desc: 'Multiple connected books' },
  { id: 'not sure', label: "I'm not sure yet", desc: "Let's figure it out together" },
];

const GENRES = [
  'Romance', 'Fantasy', 'Mystery / Thriller', 'Literary Fiction',
  'Sci-Fi', 'Young Adult', 'Horror', 'Historical', 'Other',
];

const STYLES = [
  { id: 'emotional', label: 'Emotional and cinematic', desc: 'Rich description, deep feelings' },
  { id: 'fast', label: 'Fast-paced and commercial', desc: 'Quick chapters, page-turner' },
  { id: 'literary', label: 'Literary and reflective', desc: 'Beautiful prose, layered meaning' },
  { id: 'dark', label: 'Dark and suspenseful', desc: 'Tension, mystery, edge-of-seat' },
  { id: 'light', label: 'Light and heartwarming', desc: 'Comfort, charm, feel-good' },
  { id: 'epic', label: 'Epic and immersive', desc: 'Large scope, detailed world' },
];

const LANGUAGES = [
  { id: 'en', label: 'English', desc: 'Write in English' },
  { id: 'id', label: 'Bahasa Indonesia', desc: 'Menulis dalam Bahasa Indonesia' },
  { id: 'both', label: 'Bilingual / translate later', desc: 'Write now, translate later' },
];

const AI_HELP_LEVELS = [
  { id: 'organize', label: 'Just help me organize my idea', desc: 'Basic structure and prompts' },
  { id: 'outline', label: 'Create an outline for me', desc: 'Full chapter outline + characters' },
  { id: 'chapter', label: 'Help me write chapter by chapter', desc: 'Guided writing with suggestions' },
  { id: 'full', label: 'Build a complete starter plan', desc: 'Everything: outline, bible, first scene' },
];

const IDEA_PROMPTS = [
  'A librarian discovers a hidden message in a century-old book that leads to a forgotten treasure.',
  'Two strangers swap lives for a week and learn what they\'ve been missing.',
  'A detective investigates a crime that hasn\'t happened yet — and must stop it.',
  'In a world where memories can be traded, a woman wakes up with someone else\'s past.',
  'An aspiring chef enters a competition where the real challenge is keeping their identity secret.',
  'A retired spy is pulled back into action when their past arrives at the front door.',
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 28 : 8,
          height: 8, borderRadius: 4,
          background: i <= current ? '#C9A96E' : 'rgba(255,255,255,0.1)',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  );
}

function SelectionPill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '14px 18px', borderRadius: 12, textAlign: 'left',
      border: selected ? '2px solid #C9A96E' : '1px solid rgba(255,255,255,0.08)',
      background: selected ? 'rgba(201,169,110,0.08)' : '#121212',
      color: selected ? '#F5F5F7' : '#aeaeb2',
      cursor: 'pointer', fontSize: 13, fontWeight: selected ? 600 : 400,
      transition: 'all 0.2s',
    }}>
      {children}
    </button>
  );
}

interface OnboardingWizardProps {
  onComplete: (answers: any) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    storyType: '',
    genre: '',
    idea: '',
    style: '',
    language: 'en',
    aiHelp: 'full',
  });
  const [showPrompts, setShowPrompts] = useState(false);
  const [direction, setDirection] = useState(0);

  const totalSteps = 7;

  const update = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const next = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return answers.storyType !== '';
      case 1: return answers.genre !== '';
      case 2: return answers.idea !== '' || showPrompts;
      case 3: return answers.style !== '';
      case 4: return answers.language !== '';
      case 5: return answers.aiHelp !== '';
      case 6: return true;
      default: return true;
    }
  };

  const handleFinish = () => {
    onComplete({ ...answers, idea: answers.idea || undefined });
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <StepIndicator current={step} total={totalSteps} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={step} custom={direction} variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {/* Step 0: Story Type */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
                What do you want to write?
              </h2>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 24 }}>
                Choose the format that fits your story best.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STORY_TYPES.map(t => (
                  <SelectionPill key={t.id} selected={answers.storyType === t.id} onClick={() => { update('storyType', t.id); setTimeout(next, 200); }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: answers.storyType === t.id ? 'rgba(245,245,247,0.6)' : '#636366' }}>{t.desc}</div>
                  </SelectionPill>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Genre */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
                Choose your genre
              </h2>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 24 }}>
                Pick the closest match — you can change it later.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {GENRES.map(g => (
                  <SelectionPill key={g} selected={answers.genre === g} onClick={() => { update('genre', g); }}>
                    <div style={{ textAlign: 'center' }}>{g}</div>
                  </SelectionPill>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={next} disabled={!canProceed()} style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: answers.genre ? '#C9A96E' : 'rgba(255,255,255,0.06)',
                  color: answers.genre ? '#1a0f00' : '#636366',
                  fontSize: 14, fontWeight: 600, cursor: answers.genre ? 'pointer' : 'default',
                }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Idea */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
                Tell us your idea
              </h2>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 16 }}>
                One sentence about your story. Don't overthink it.
              </p>
              <textarea value={answers.idea} onChange={e => update('idea', e.target.value)}
                placeholder="A young teacher discovers a secret that changes the future of her village."
                style={{
                  width: '100%', minHeight: 100, padding: 14, borderRadius: 12,
                  background: '#121212', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F5F5F7', fontSize: 14, lineHeight: 1.6, resize: 'vertical',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setShowPrompts(true)} style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                  background: '#161616', color: '#8E8E93', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>
                  I don't have an idea yet
                </button>
                <button onClick={next} disabled={!answers.idea} style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                  background: answers.idea ? '#C9A96E' : 'rgba(255,255,255,0.06)',
                  color: answers.idea ? '#1a0f00' : '#636366',
                  fontSize: 12, fontWeight: 600, cursor: answers.idea ? 'pointer' : 'default',
                }}>
                  {answers.idea ? 'Continue →' : 'Need an idea first'}
                </button>
              </div>

              {showPrompts && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 12, color: '#636366', marginBottom: 10 }}>Pick a story spark:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {IDEA_PROMPTS.map((p, i) => (
                      <button key={i} onClick={() => { update('idea', p); setShowPrompts(false); }} style={{
                        width: '100%', padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                        border: '1px solid rgba(255,255,255,0.06)', background: '#121212',
                        color: '#aeaeb2', fontSize: 12, lineHeight: 1.5, cursor: 'pointer',
                      }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Writing Style */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
                Choose your writing style
              </h2>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 24 }}>
                This helps us set the right tone for your workspace.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STYLES.map(s => (
                  <SelectionPill key={s.id} selected={answers.style === s.id} onClick={() => { update('style', s.id); }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: answers.style === s.id ? 'rgba(245,245,247,0.6)' : '#636366' }}>{s.desc}</div>
                  </SelectionPill>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={next} disabled={!canProceed()} style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: answers.style ? '#C9A96E' : 'rgba(255,255,255,0.06)',
                  color: answers.style ? '#1a0f00' : '#636366',
                  fontSize: 14, fontWeight: 600, cursor: answers.style ? 'pointer' : 'default',
                }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Language */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
                Choose your language
              </h2>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 24 }}>
                Your story, your language. You can add translation later.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {LANGUAGES.map(l => (
                  <SelectionPill key={l.id} selected={answers.language === l.id} onClick={() => { update('language', l.id); }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{l.label}</div>
                    <div style={{ fontSize: 11, color: answers.language === l.id ? 'rgba(245,245,247,0.6)' : '#636366' }}>{l.desc}</div>
                  </SelectionPill>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={next} style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: '#C9A96E', color: '#1a0f00',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 5: AI Help */}
          {step === 5 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
                How much help do you want?
              </h2>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 24 }}>
                Novelify can assist at every stage — from outline to final scene.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {AI_HELP_LEVELS.map(h => (
                  <SelectionPill key={h.id} selected={answers.aiHelp === h.id} onClick={() => { update('aiHelp', h.id); }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{h.label}</div>
                    <div style={{ fontSize: 11, color: answers.aiHelp === h.id ? 'rgba(245,245,247,0.6)' : '#636366' }}>{h.desc}</div>
                  </SelectionPill>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={next} style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: '#C9A96E', color: '#1a0f00',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Generate */}
          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1, padding: '40px 0' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(201,169,110,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24, color: '#C9A96E',
              }}>
                <Sparkles style={{ width: 32, height: 32 }} />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#F5F5F7', marginBottom: 8 }}>
                Your workspace is ready to build
              </h2>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 32, lineHeight: 1.6 }}>
                We'll prepare your novel workspace with characters,<br />
                chapter outline, plot structure, and your first scene.
              </p>
              <div style={{
                width: '100%', padding: 16, borderRadius: 12,
                background: '#121212', border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 32, textAlign: 'left',
              }}>
                <div style={{ fontSize: 11, color: '#636366', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Summary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <SummaryRow label="Type" value={answers.storyType} />
                  <SummaryRow label="Genre" value={answers.genre} />
                  <SummaryRow label="Style" value={STYLES.find(s => s.id === answers.style)?.label || answers.style} />
                  <SummaryRow label="Language" value={LANGUAGES.find(l => l.id === answers.language)?.label || answers.language} />
                  <SummaryRow label="AI Help" value={AI_HELP_LEVELS.find(h => h.id === answers.aiHelp)?.label || answers.aiHelp} />
                </div>
              </div>
              <button onClick={handleFinish} style={{
                width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                background: '#C9A96E', color: '#1a0f00',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Sparkles style={{ width: 18, height: 18 }} /> Create My Novel Workspace
              </button>
              <button onClick={() => onComplete({ ...answers, skipGenerate: true })} style={{
                marginTop: 12, padding: '10px 20px', borderRadius: 8, border: 'none',
                background: 'transparent', color: '#636366', fontSize: 12, cursor: 'pointer',
              }}>
                Skip AI generation — I'll build it myself
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', marginTop: 'auto' }}>
        <button onClick={prev} disabled={step === 0} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: 'transparent', color: step === 0 ? '#2a2a2a' : '#8E8E93',
          fontSize: 12, fontWeight: 500, cursor: step === 0 ? 'default' : 'pointer',
        }}>
          <ChevronLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ fontSize: 11, color: '#636366' }}>Step {step + 1} of {totalSteps}</span>
        <div style={{ width: 60 }} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: '#636366' }}>{label}</span>
      <span style={{ color: '#F5F5F7', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
