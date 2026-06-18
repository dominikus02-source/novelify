'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';

const STORY_TYPES = [
  { id: 'novel', label: 'Novel', desc: 'Full-length story' },
  { id: 'novella', label: 'Novella', desc: 'Shorter novel' },
  { id: 'short story', label: 'Short Story', desc: 'Focused narrative' },
  { id: 'series', label: 'Series', desc: 'Multiple connected books' },
  { id: 'not sure', label: "Not sure yet", desc: "We'll figure it out" },
];

const GENRES = [
  'Romance', 'Fantasy', 'Mystery / Thriller', 'Literary Fiction',
  'Sci-Fi', 'Young Adult', 'Horror', 'Historical', 'Other',
];

const STYLES = [
  { id: 'emotional', label: 'Emotional & cinematic', desc: 'Rich description, deep feelings' },
  { id: 'fast', label: 'Fast-paced & commercial', desc: 'Quick chapters, page-turner' },
  { id: 'literary', label: 'Literary & reflective', desc: 'Beautiful prose, layered meaning' },
  { id: 'dark', label: 'Dark & suspenseful', desc: 'Tension, mystery, edge-of-seat' },
  { id: 'light', label: 'Light & heartwarming', desc: 'Comfort, charm, feel-good' },
  { id: 'epic', label: 'Epic & immersive', desc: 'Large scope, detailed world' },
];

const LANGUAGES = [
  { id: 'en', label: 'English', desc: 'Write in English' },
  { id: 'id', label: 'Bahasa Indonesia', desc: 'Menulis dalam Bahasa Indonesia' },
  { id: 'both', label: 'Bilingual / translate later', desc: 'Write now, translate later' },
];

const IDEA_PROMPTS: Record<string, string[]> = {
  Romance: [
    'Two writers discover they are renting the same cabin at different times.',
    'A florist receives anonymous love letters with no return address.',
    'Childhood friends reunite at a wedding and realize what they have been missing.',
  ],
  Fantasy: [
    'A forgotten heir discovers they can speak to ancient spirits.',
    'A young mage must master forbidden magic to save their village.',
    'The last dragon chooses a new rider to restore balance to the world.',
  ],
  'Mystery / Thriller': [
    'A cold case reopens when a witness comes forward after decades.',
    'A detective finds their own name on a list of planned victims.',
    'An heirloom goes missing at a family reunion, revealing buried secrets.',
  ],
  'Literary Fiction': [
    'An elderly artist teaches a young skeptic to see beauty in imperfection.',
    'Three generations of women reunite in a house that holds their collective memory.',
    'A translator discovers she is changing the story with every word she chooses.',
  ],
  'Sci-Fi': [
    'A colony ship discovers an abandoned alien megastructure.',
    'A data analyst uncovers an algorithm predicting crimes before they happen.',
    'The last AI chooses to write a novel instead of saving humanity.',
  ],
  'Young Adult': [
    'A high school outcast inherits a mysterious book with blank pages.',
    'A summer camp competition forces two rivals to work together.',
    'A teenager discovers their town holds an annual secret ceremony.',
  ],
  Horror: [
    'A small town wakes up one day without any reflection in mirrors.',
    'An old radio station broadcasts from a frequency that should not exist.',
    'A novelist receives calls from their own main character at midnight.',
  ],
  Historical: [
    'An archaeologist finds a letter hidden in a medieval manuscript.',
    'A wartime journalist documents stories the government wants erased.',
    'A silk trader travels the ancient road and discovers a conspiracy.',
  ],
  Other: [
    'A librarian discovers a hidden message in a century-old book.',
    'Two strangers swap lives for a week and learn what they have been missing.',
    'A retired spy is pulled back when their past arrives at the front door.',
  ],
};

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 28 : 8, height: 8, borderRadius: 4,
          background: i <= current ? '#C9A96E' : 'rgba(255,255,255,0.1)',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  );
}

function OptionCard({ selected, onClick, children, subtitle }: { selected: boolean; onClick: () => void; children: React.ReactNode; subtitle?: string }) {
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
      {subtitle && <div style={{ fontSize: 11, color: '#636366', marginTop: 2 }}>{subtitle}</div>}
    </button>
  );
}

function GenrePill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      border: selected ? '2px solid #C9A96E' : '1px solid rgba(255,255,255,0.08)',
      background: selected ? 'rgba(201,169,110,0.12)' : '#121212',
      color: selected ? '#F5F5F7' : '#aeaeb2',
      cursor: 'pointer', transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  );
}

interface SimplifiedOnboardingWizardProps {
  onComplete: (answers: any) => void;
}

export function SimplifiedOnboardingWizard({ onComplete }: SimplifiedOnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    storyType: '',
    genre: '',
    idea: '',
    style: '',
    language: 'en',
  });
  const [showIdeaPrompts, setShowIdeaPrompts] = useState(false);
  const [direction, setDirection] = useState(0);

  const totalSteps = 6;

  const updateAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = useCallback(() => {
    setDirection(1);
    setStep(s => Math.min(s + 1, totalSteps - 1));
  }, []);

  const prevStep = useCallback(() => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  }, []);

  const canProceed = () => {
    switch (step) {
      case 0: return !!answers.storyType;
      case 1: return !!answers.genre;
      case 2: return answers.idea.trim().length >= 3;
      case 3: return !!answers.style;
      case 4: return !!answers.language;
      case 5: return true;
      default: return false;
    }
  };

  const handleComplete = () => {
    onComplete({
      ...answers,
      aiHelp: 'full',
    });
  };

  const selectIdeaPrompt = (prompt: string) => {
    updateAnswer('idea', prompt);
    setShowIdeaPrompts(false);
  };

  const currentGenre = answers.genre || 'Other';
  const prompts = IDEA_PROMPTS[currentGenre] || IDEA_PROMPTS.Other;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
              What are you writing?
            </h2>
            <p style={{ fontSize: 12, color: '#8E8E93', marginBottom: 24 }}>
              Pick the format that feels right for your story.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STORY_TYPES.map(t => (
                <OptionCard key={t.id} selected={answers.storyType === t.id} onClick={() => { updateAnswer('storyType', t.id); }}>
                  {t.label}
                  <div style={{ fontSize: 11, color: '#636366', marginTop: 2 }}>{t.desc}</div>
                </OptionCard>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
              Choose your genre
            </h2>
            <p style={{ fontSize: 12, color: '#8E8E93', marginBottom: 24 }}>
              Select the genre that fits your story best.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {GENRES.map(g => (
                <GenrePill key={g} selected={answers.genre === g} onClick={() => { updateAnswer('genre', g); }}>
                  {g}
                </GenrePill>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
              What is your story about?
            </h2>
            <p style={{ fontSize: 12, color: '#8E8E93', marginBottom: 8 }}>
              Describe your idea in a sentence or two.
            </p>
            <textarea
              value={answers.idea}
              onChange={(e) => updateAnswer('idea', e.target.value)}
              placeholder="A young teacher discovers a secret that changes the future of her village."
              style={{
                width: '100%', minHeight: 100, padding: 14, borderRadius: 12, resize: 'vertical',
                background: '#121212', color: '#F5F5F7', border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 13, fontFamily: 'inherit', lineHeight: 1.6,
              }}
            />
            <button
              onClick={() => setShowIdeaPrompts(!showIdeaPrompts)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
                padding: '8px 14px', borderRadius: 8,
                border: '1px solid rgba(201,169,110,0.2)', background: 'rgba(201,169,110,0.06)',
                color: '#C9A96E', fontSize: 11, fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Lightbulb style={{ width: 12, height: 12 }} /> I need an idea
            </button>
            {showIdeaPrompts && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.1)' }}
              >
                <div style={{ fontSize: 10, color: '#636366', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Suggestions for {answers.genre || 'stories'}:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {prompts.map((p, i) => (
                    <button key={i} onClick={() => selectIdeaPrompt(p)} style={{
                      textAlign: 'left', padding: '8px 10px', borderRadius: 6,
                      border: 'none', background: 'rgba(255,255,255,0.02)', color: '#aeaeb2',
                      fontSize: 11, cursor: 'pointer', lineHeight: 1.5, transition: 'all 0.15s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.06)'; e.currentTarget.style.color = '#F5F5F7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = '#aeaeb2'; }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
              How should the story feel?
            </h2>
            <p style={{ fontSize: 12, color: '#8E8E93', marginBottom: 24 }}>
              Pick the writing style that matches your vision.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STYLES.map(s => (
                <OptionCard key={s.id} selected={answers.style === s.id} onClick={() => { updateAnswer('style', s.id); }} subtitle={s.desc}>
                  {s.label}
                </OptionCard>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
              What language will you write in?
            </h2>
            <p style={{ fontSize: 12, color: '#8E8E93', marginBottom: 24 }}>
              You can add other languages later.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LANGUAGES.map(l => (
                <OptionCard key={l.id} selected={answers.language === l.id} onClick={() => { updateAnswer('language', l.id); }} subtitle={l.desc}>
                  {l.label}
                </OptionCard>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
              Ready to create your workspace
            </h2>
            <p style={{ fontSize: 12, color: '#8E8E93', marginBottom: 24 }}>
              Novelify will generate your story outline, main characters, and first chapter starter.
            </p>
            <div style={{
              background: 'rgba(201,169,110,0.04)', borderRadius: 12,
              border: '1px solid rgba(201,169,110,0.1)', padding: 16, marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#636366', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Summary
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Type', value: STORY_TYPES.find(t => t.id === answers.storyType)?.label || answers.storyType },
                  { label: 'Genre', value: answers.genre },
                  { label: 'Idea', value: answers.idea.length > 60 ? answers.idea.slice(0, 60) + '...' : answers.idea },
                  { label: 'Style', value: STYLES.find(s => s.id === answers.style)?.label || answers.style },
                  { label: 'Language', value: LANGUAGES.find(l => l.id === answers.language)?.label || answers.language },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                    <span style={{ color: '#636366', minWidth: 50, flexShrink: 0 }}>{item.label}</span>
                    <span style={{ color: '#aeaeb2' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleComplete} style={{
              width: '100%', padding: '14px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #C9A96E, #E8C98A)', color: '#1a0f00',
              fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Sparkles style={{ width: 16, height: 16 }} />
                Create My Novel Workspace
              </span>
            </button>
            <p style={{ fontSize: 10, color: '#636366', textAlign: 'center', marginTop: 10 }}>
              You can change everything later.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080808', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <StepDots current={step} total={totalSteps} />
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button
            onClick={prevStep}
            disabled={step === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
              color: step === 0 ? '#2a2a2a' : '#aeaeb2', fontSize: 12, fontWeight: 500,
              cursor: step === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            }}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} /> Back
          </button>
          {step < totalSteps - 1 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10,
                border: 'none', background: canProceed() ? 'linear-gradient(135deg, #C9A96E, #E8C98A)' : 'rgba(255,255,255,0.06)',
                color: canProceed() ? '#1a0f00' : '#636366', fontSize: 12, fontWeight: 600,
                cursor: canProceed() ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              }}
            >
              Next <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
