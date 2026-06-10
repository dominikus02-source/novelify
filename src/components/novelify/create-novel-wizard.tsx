'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Users, MapPin, Globe, FileText, Check, Plus, X, Loader2,
  ChevronLeft, ChevronRight, Sparkles, PenTool, Target, Quote,
  Swords, Heart, Clock, BookMarked, Lightbulb,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  colors, FadeIn, fmtWords,
} from './dashboard-components';
import {
  STORY_TYPES, GENRES, STRUCTURE_TEMPLATES, WRITING_STYLES, WORD_COUNT_PRESETS,
  type StoryTemplate,
} from '@/lib/templates';

// ─── Types ───

interface GeneratedOutline {
  chapters: { number: number; title: string; summary: string }[];
  beats: { act: string; title: string; description: string }[];
  characters: { name: string; role: string; description: string }[];
  locations: { name: string; type: string; description: string }[];
}

interface WizardData {
  storyType: string;
  genre: string;
  customGenre: string;
  sourceLanguage: string;
  targetLanguage: string;
  useTargetForAI: boolean;
  aiOutputLanguage: string;
  structureTemplate: string;
  pov: string;
  tense: string;
  tone: string;
  proseStyle: string;
  targetAudience: string;
  wordCountPreset: string;
  targetWordCount: number;
  dailyWordGoal: number;
  chapterWordTarget: number;
  deadline: string;
  workingTitle: string;
  premise: string;
  mainCharacterIdea: string;
  settingIdea: string;
  conflictIdea: string;
  endingIdea: string;
  specialNotes: string;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'ru', label: 'Russian' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'th', label: 'Thai' },
  { value: 'vi', label: 'Vietnamese' },
];

const DEFAULT_WIZARD: WizardData = {
  storyType: '',
  genre: '',
  customGenre: '',
  sourceLanguage: '',
  targetLanguage: '',
  useTargetForAI: true,
  aiOutputLanguage: '',
  structureTemplate: '',
  pov: '',
  tense: '',
  tone: '',
  proseStyle: '',
  targetAudience: '',
  wordCountPreset: '',
  targetWordCount: 70000,
  dailyWordGoal: 1000,
  chapterWordTarget: 3000,
  deadline: '',
  workingTitle: '',
  premise: '',
  mainCharacterIdea: '',
  settingIdea: '',
  conflictIdea: '',
  endingIdea: '',
  specialNotes: '',
};

const STEPS = [
  { id: 'story-type', label: 'Story Type' },
  { id: 'genre', label: 'Genre' },
  { id: 'language', label: 'Language' },
  { id: 'structure', label: 'Structure' },
  { id: 'style', label: 'Style' },
  { id: 'goals', label: 'Goals' },
  { id: 'ai-starter', label: 'AI Starter' },
  { id: 'review', label: 'Review' },
];

const STORY_TYPE_ICONS: Record<string, React.ElementType> = {
  novel: BookOpen,
  webnovel: Globe,
  novella: FileText,
  'short-story': Quote,
  'series-starter': BookMarked,
};

const LANG_NAMES: Record<string, string> = {};
for (const l of LANGUAGES) LANG_NAMES[l.value] = l.label;

// ─── Sub Components ───

function Pill({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500,
        cursor: 'pointer', border: `1px solid ${selected ? colors.goldBorder : colors.border}`,
        background: selected ? colors.goldBg : '#161616',
        color: selected ? colors.gold : '#aeaeb2',
        transition: 'all .15s',
      }}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, multiline, rows = 2, type, style: extStyle }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  multiline?: boolean; rows?: number; type?: string; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    width: '100%', background: '#161616', border: `1px solid ${colors.border}`,
    color: '#F5F5F7', fontSize: 12, padding: multiline ? '10px 12px' : '8px 12px',
    borderRadius: 10, outline: 'none', transition: 'border-color .2s',
    fontFamily: 'inherit', resize: multiline ? 'vertical' : 'none', ...extStyle,
  };
  if (multiline) {
    return (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        rows={rows} style={base}
        onFocus={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
        onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
      />
    );
  }
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      type={type || 'text'} style={base}
      onFocus={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
      onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
    />
  );
}

function NumberInput({ value, onChange, placeholder, min, style: extStyle }: {
  value: number; onChange: (v: number) => void; placeholder?: string; min?: number; style?: React.CSSProperties;
}) {
  return (
    <input value={value || ''} onChange={(e) => onChange(parseInt(e.target.value) || 0)} placeholder={placeholder}
      type="number" min={min}
      style={{
        width: '100%', background: '#161616', border: `1px solid ${colors.border}`,
        color: '#F5F5F7', fontSize: 12, padding: '8px 12px',
        borderRadius: 10, outline: 'none', transition: 'border-color .2s',
        fontFamily: 'inherit', ...extStyle,
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
      onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', background: '#161616', border: `1px solid ${colors.border}`,
        color: value ? '#F5F5F7' : '#636366', fontSize: 12, padding: '8px 12px',
        borderRadius: 10, outline: 'none', cursor: 'pointer', appearance: 'none',
        fontFamily: 'inherit',
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
      onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Main Component ───

export function CreateNovelWizard({ initialTemplate }: { initialTemplate?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [wizard, setWizard] = useState<WizardData>(DEFAULT_WIZARD);
  const [generatedOutline, setGeneratedOutline] = useState<GeneratedOutline | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});

  const updater = useCallback((field: keyof WizardData) => (value: any) => {
    setWizard(prev => ({ ...prev, [field]: value }));
    if (stepErrors[step]) setStepErrors(prev => ({ ...prev, [step]: '' }));
  }, [step, stepErrors]);

  const setW = (patch: Partial<WizardData>) => setWizard(prev => ({ ...prev, ...patch }));

  const selectedType = useMemo(() => STORY_TYPES.find(t => t.id === wizard.storyType), [wizard.storyType]);
  const selectedGenre = useMemo(() => GENRES.find(g => g.id === wizard.genre), [wizard.genre]);
  const selectedStructure = useMemo(() => STRUCTURE_TEMPLATES.find(s => s.id === wizard.structureTemplate), [wizard.structureTemplate]);
  const selectedPreset = useMemo(() => WORD_COUNT_PRESETS.find(p => p.id === wizard.wordCountPreset), [wizard.wordCountPreset]);

  const isCustomPreset = wizard.wordCountPreset === 'custom';

  const aiOutputLanguageValue = useMemo(() => {
    if (wizard.useTargetForAI && wizard.targetLanguage) return wizard.targetLanguage;
    return wizard.aiOutputLanguage || wizard.targetLanguage || '';
  }, [wizard.useTargetForAI, wizard.targetLanguage, wizard.aiOutputLanguage]);

  // Validation
  const validate = (s: number): boolean => {
    const errs: Record<number, string> = {};
    if (s === 0 && !wizard.storyType) errs[0] = 'Please select a story type';
    if (s === 1 && !wizard.genre) errs[1] = 'Please select a genre';
    if (s === 2 && (!wizard.sourceLanguage || !wizard.targetLanguage)) errs[2] = 'Please select both languages';
    if (s === 5 && wizard.targetWordCount < 1) errs[5] = 'Please set a target word count';
    if (s === 6 && !wizard.workingTitle.trim()) errs[6] = 'Please enter a working title';
    setStepErrors(errs);
    return !errs[s];
  };

  const handleNext = () => {
    if (!validate(step)) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  // Generate AI outline
  const handleGenerateOutline = async () => {
    if (!wizard.workingTitle.trim()) {
      setStepErrors({ 6: 'Please enter a working title before generating' });
      return;
    }
    setGenerateLoading(true);
    setGenerateError('');
    try {
      const res = await fetch('/api/projects/starter-outline', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workingTitle: wizard.workingTitle.trim(),
          storyType: wizard.storyType,
          genre: wizard.genre === 'custom' ? wizard.customGenre : wizard.genre,
          premise: wizard.premise || null,
          mainCharacterIdea: wizard.mainCharacterIdea || null,
          settingIdea: wizard.settingIdea || null,
          conflictIdea: wizard.conflictIdea || null,
          endingIdea: wizard.endingIdea || null,
          specialNotes: wizard.specialNotes || null,
          structureTemplate: wizard.structureTemplate || null,
          pov: wizard.pov || null,
          tense: wizard.tense || null,
          tone: wizard.tone || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate outline');
      }
      const data = await res.json();
      setGeneratedOutline(data);
    } catch (e: any) {
      setGenerateError(e.message || 'Something went wrong');
    } finally {
      setGenerateLoading(false);
    }
  };

  // Create project
  const handleCreate = async (openStudio: boolean) => {
    setCreateLoading(true);
    setCreateError('');
    try {
      const res = await fetch('/api/projects/create-from-wizard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wizard,
          genre: wizard.genre === 'custom' ? wizard.customGenre : wizard.genre,
          aiOutputLanguage: aiOutputLanguageValue,
          hasGeneratedOutline: !!generatedOutline,
          generatedOutline,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create project');
      }
      const project = await res.json();
      if (openStudio) {
        router.push(`/dashboard/writing/${project.id}`);
      } else {
        router.push(`/dashboard/novels`);
      }
    } catch (e: any) {
      setCreateError(e.message || 'Something went wrong');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ width: '100%', maxWidth: 760 }}>
        {/* Progress Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F5F5F7', fontFamily: "'Playfair Display',serif", letterSpacing: '-0.02em' }}>Create New Novel</h1>
              <p style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Step {step + 1} of {STEPS.length} &mdash; {STEPS[step].label}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
            {STEPS.map((s, i) => (
              <div key={s.id}
                onClick={() => { if (i < step) setStep(i); }}
                style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i <= step ? 'linear-gradient(90deg, #C9A96E, #E8C98A)' : 'rgba(255,255,255,0.06)',
                  cursor: i < step ? 'pointer' : 'default',
                  transition: 'background .3s',
                }}
              />
            ))}
          </div>

          {/* Step labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => { if (i <= step) setStep(i); }}
                style={{
                  fontSize: 9, fontWeight: 500,
                  color: i === step ? colors.gold : i < step ? '#34D399' : '#636366',
                  background: 'none', border: 'none', cursor: i <= step ? 'pointer' : 'default',
                  padding: '2px 0', transition: 'color .2s',
                  textTransform: 'uppercase', letterSpacing: '0.03em',
                }}
              >
                {i < step ? <Check style={{ width: 9, height: 9, display: 'inline', marginRight: 2 }} /> : null}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {stepErrors[step] && (
          <div style={{ fontSize: 11, color: '#F87171', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <X style={{ width: 11, height: 11, flexShrink: 0 }} />
            {stepErrors[step]}
          </div>
        )}

        {createError && (
          <div style={{ fontSize: 11, color: '#F87171', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <X style={{ width: 11, height: 11, flexShrink: 0 }} />
            {createError}
          </div>
        )}

        {/* Step Content */}
        <div style={{ minHeight: 360 }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }}>
              {step === 0 && renderStep1()}
              {step === 1 && renderStep2()}
              {step === 2 && renderStep3()}
              {step === 3 && renderStep4()}
              {step === 4 && renderStep5()}
              {step === 5 && renderStep6()}
              {step === 6 && renderStep7()}
              {step === 7 && renderStep8()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
          <button onClick={step === 0 ? () => router.push('/dashboard/novels') : handlePrev}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: `1px solid ${colors.border}`, background: '#161616',
              color: '#aeaeb2', cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.borderLight; e.currentTarget.style.color = '#F5F5F7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = '#aeaeb2'; }}
          >
            <ChevronLeft style={{ width: 13, height: 13 }} />
            {step === 0 ? 'Cancel' : 'Previous'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step < STEPS.length - 1 && (
              <button onClick={handleNext}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: 'none', background: colors.gold, color: '#1a0f00',
                  cursor: 'pointer', transition: 'background .15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E8C98A'}
                onMouseLeave={(e) => e.currentTarget.style.background = colors.gold}
              >
                Next <ChevronRight style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // Step 1 — Story Type
  // ═══════════════════════════════════════════
  function renderStep1() {
    return (
      <FadeIn>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>What kind of story are you writing?</h2>
        <p style={{ fontSize: 11, color: colors.muted, marginBottom: 16 }}>Choose the format that best fits your project</p>
        <div style={{ display: 'grid', gap: 10 }}>
          {STORY_TYPES.map((t) => {
            const Icon = STORY_TYPE_ICONS[t.id] || BookOpen;
            const selected = wizard.storyType === t.id;
            return (
              <button key={t.id} onClick={() => setW({ storyType: t.id })}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: selected ? 'rgba(201,169,110,0.06)' : colors.cardBg,
                  border: `1px solid ${selected ? colors.goldBorder : colors.border}`,
                  transition: 'all .2s',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: selected ? colors.goldBg : '#161616',
                  border: `1px solid ${selected ? colors.goldBorder : colors.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  color: selected ? colors.gold : colors.muted,
                }}>
                  <Icon style={{ width: 17, height: 17 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selected ? colors.gold : '#F5F5F7', marginBottom: 2 }}>
                    {t.title}
                    {selected && <Check style={{ width: 12, height: 12, marginLeft: 6, display: 'inline' }} />}
                  </div>
                  <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.5 }}>{t.desc}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    <span style={{ fontSize: 9, color: '#636366' }}>{t.recommendedWords} words</span>
                    <span style={{ fontSize: 9, color: '#636366' }}>{t.useCase}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Step 2 — Genre
  // ═══════════════════════════════════════════
  function renderStep2() {
    return (
      <FadeIn>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>Choose your genre</h2>
        <p style={{ fontSize: 11, color: colors.muted, marginBottom: 16 }}>Pick the genre that best describes your story</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {GENRES.map((g) => {
            const selected = wizard.genre === g.id;
            return (
              <button key={g.id} onClick={() => setW({ genre: g.id })}
                style={{
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: selected ? 'rgba(201,169,110,0.06)' : colors.cardBg,
                  border: `1px solid ${selected ? colors.goldBorder : colors.border}`,
                  transition: 'all .2s',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: selected ? colors.gold : '#F5F5F7', marginBottom: 2 }}>
                  {g.name}
                  {selected && <Check style={{ width: 11, height: 11, marginLeft: 4, display: 'inline' }} />}
                </div>
                <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.4 }}>{g.desc}</div>
              </button>
            );
          })}
        </div>
        {wizard.genre === 'custom' && (
          <div style={{ marginTop: 12 }}>
            <Input value={wizard.customGenre} onChange={updater('customGenre')} placeholder="Enter your custom genre..." />
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Step 3 — Language
  // ═══════════════════════════════════════════
  function renderStep3() {
    return (
      <FadeIn>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>Choose your languages</h2>
        <p style={{ fontSize: 11, color: colors.muted, marginBottom: 16 }}>Set the source and target languages for your project</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 6 }}>Source Language</div>
            <Select value={wizard.sourceLanguage} onChange={updater('sourceLanguage')} options={LANGUAGES} placeholder="Select language..." />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 6 }}>Target Language</div>
            <Select value={wizard.targetLanguage} onChange={updater('targetLanguage')} options={LANGUAGES} placeholder="Select language..." />
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          borderRadius: 12, background: colors.cardBg, border: `1px solid ${colors.border}`,
          marginBottom: 12,
        }}>
          <button onClick={() => setW({ useTargetForAI: !wizard.useTargetForAI })}
            style={{
              width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: wizard.useTargetForAI ? colors.gold : '#3a3a3c',
              position: 'relative', transition: 'background .2s', flexShrink: 0,
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 2, transition: 'left .2s',
              left: wizard.useTargetForAI ? 18 : 2,
            }} />
          </button>
          <div style={{ fontSize: 11, color: '#aeaeb2' }}>
            Use target language for all AI outputs
          </div>
        </div>

        {aiOutputLanguageValue && (
          <div style={{ fontSize: 10, color: colors.muted, fontStyle: 'italic' }}>
            AI output language: <span style={{ color: colors.gold }}>{LANG_NAMES[aiOutputLanguageValue] || aiOutputLanguageValue}</span>
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Step 4 — Story Structure
  // ═══════════════════════════════════════════
  function renderStep4() {
    return (
      <FadeIn>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 2 }}>Choose your narrative structure</h2>
        <p style={{ fontSize: 11, color: colors.muted, marginBottom: 16, fontStyle: 'italic' }}>
          Your outline is only a starting point. You can change every chapter later.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {STRUCTURE_TEMPLATES.map((s) => {
            const selected = wizard.structureTemplate === s.id;
            return (
              <button key={s.id} onClick={() => setW({ structureTemplate: s.id })}
                style={{
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: selected ? 'rgba(201,169,110,0.06)' : colors.cardBg,
                  border: `1px solid ${selected ? colors.goldBorder : colors.border}`,
                  transition: 'all .2s',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: selected ? colors.gold : '#F5F5F7', marginBottom: 2 }}>
                  {s.name}
                  {selected && <Check style={{ width: 11, height: 11, marginLeft: 4, display: 'inline' }} />}
                </div>
                <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.4, marginBottom: 6 }}>{s.desc}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.acts.map((a) => (
                    <span key={a} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 6, background: '#161616', color: '#636366', border: `1px solid ${colors.border}` }}>
                      {a}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 9, color: '#636366' }}>
                  <span>{s.estChapters} chapters</span>
                  <span>{s.estScenes} scenes</span>
                </div>
              </button>
            );
          })}
        </div>
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Step 5 — Writing Style
  // ═══════════════════════════════════════════
  function renderStep5() {
    return (
      <FadeIn>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>Let&apos;s shape the voice of your story</h2>
        <p style={{ fontSize: 11, color: colors.muted, marginBottom: 16 }}>Choose your narrative voice, tone, and style preferences</p>

        {/* POV */}
        <SectionLabel>Point of View</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {WRITING_STYLES.pov.map((o) => (
            <Pill key={o.id} selected={wizard.pov === o.id} onClick={() => setW({ pov: o.id })}>
              {o.name}
            </Pill>
          ))}
        </div>

        {/* Tense */}
        <SectionLabel>Tense</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {WRITING_STYLES.tense.map((o) => (
            <Pill key={o.id} selected={wizard.tense === o.id} onClick={() => setW({ tense: o.id })}>
              {o.name}
            </Pill>
          ))}
        </div>

        {/* Tone */}
        <SectionLabel>Tone</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {WRITING_STYLES.tone.map((o) => (
            <Pill key={o.id} selected={wizard.tone === o.id} onClick={() => setW({ tone: o.id })}>
              {o.name}
            </Pill>
          ))}
        </div>

        {/* Prose Style */}
        <SectionLabel>Prose Style</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {WRITING_STYLES.proseStyle.map((o) => (
            <Pill key={o.id} selected={wizard.proseStyle === o.id} onClick={() => setW({ proseStyle: o.id })}>
              {o.name}
            </Pill>
          ))}
        </div>

        {/* Target Audience */}
        <SectionLabel>Target Audience</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {WRITING_STYLES.targetAudience.map((o) => (
            <Pill key={o.id} selected={wizard.targetAudience === o.id} onClick={() => setW({ targetAudience: o.id })}>
              {o.name}
            </Pill>
          ))}
        </div>
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Step 6 — Writing Goals
  // ═══════════════════════════════════════════
  function renderStep6() {
    return (
      <FadeIn>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 2 }}>Set your writing goals</h2>
        <p style={{ fontSize: 11, color: colors.muted, marginBottom: 16, fontStyle: 'italic' }}>
          Goals help you stay on track, but you can change them anytime.
        </p>

        {/* Presets */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {WORD_COUNT_PRESETS.map((p) => {
            const selected = wizard.wordCountPreset === p.id;
            return (
              <button key={p.id} onClick={() => {
                setW({
                  wordCountPreset: p.id,
                  targetWordCount: p.words || 70000,
                  chapterWordTarget: p.words && p.chapters ? Math.round(p.words / p.chapters) : 3000,
                });
              }}
                style={{
                  padding: '8px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                  cursor: 'pointer', border: `1px solid ${selected ? colors.goldBorder : colors.border}`,
                  background: selected ? colors.goldBg : '#161616',
                  color: selected ? colors.gold : '#aeaeb2',
                  transition: 'all .15s',
                }}
              >
                {p.label}
                {p.words > 0 && <span style={{ fontSize: 9, color: selected ? colors.gold : '#636366', marginLeft: 4 }}>({fmtWords(p.words)} words)</span>}
              </button>
            );
          })}
        </div>

        {isCustomPreset && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 6 }}>Target Word Count</div>
            <NumberInput value={wizard.targetWordCount} onChange={updater('targetWordCount')} placeholder="e.g. 70000" min={1} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 6 }}>Daily Word Goal</div>
            <NumberInput value={wizard.dailyWordGoal} onChange={updater('dailyWordGoal')} placeholder="e.g. 1000" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 6 }}>Chapter Word Target</div>
            <NumberInput value={wizard.chapterWordTarget} onChange={updater('chapterWordTarget')} placeholder="e.g. 3000" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 6 }}>Deadline (optional)</div>
            <input type="date" value={wizard.deadline} onChange={(e) => setW({ deadline: e.target.value })}
              style={{
                width: '100%', background: '#161616', border: `1px solid ${colors.border}`,
                color: '#F5F5F7', fontSize: 12, padding: '8px 12px',
                borderRadius: 10, outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
            />
          </div>
        </div>

        {wizard.targetWordCount > 0 && (
          <div style={{ fontSize: 10, color: colors.muted, fontStyle: 'italic' }}>
            At {fmtWords(wizard.dailyWordGoal)} words/day, you&apos;ll finish in ~{Math.max(1, Math.round(wizard.targetWordCount / (wizard.dailyWordGoal || 1)))} days
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Step 7 — AI Starter
  // ═══════════════════════════════════════════
  function renderStep7() {
    const hasOutline = !!generatedOutline;
    return (
      <FadeIn>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>Tell us about your story</h2>
        <p style={{ fontSize: 11, color: colors.muted, marginBottom: 16 }}>
          The more you share, the better your AI-generated outline will be.
        </p>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 5 }}>Working Title <span style={{ color: '#F87171' }}>*</span></div>
          <Input value={wizard.workingTitle} onChange={updater('workingTitle')} placeholder="What's your novel called?" />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 5 }}>Premise</div>
          <Input value={wizard.premise} onChange={updater('premise')} placeholder="What's your story about? Write a few sentences." multiline rows={3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 5 }}>Main Character Idea (optional)</div>
            <Input value={wizard.mainCharacterIdea} onChange={updater('mainCharacterIdea')} placeholder="Who is your main character?" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 5 }}>Setting Idea (optional)</div>
            <Input value={wizard.settingIdea} onChange={updater('settingIdea')} placeholder="Where does it take place?" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 5 }}>Conflict Idea (optional)</div>
            <Input value={wizard.conflictIdea} onChange={updater('conflictIdea')} placeholder="What's the central conflict?" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 5 }}>Ending Idea (optional)</div>
            <Input value={wizard.endingIdea} onChange={updater('endingIdea')} placeholder="How might it end?" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 5 }}>Special Notes (optional)</div>
          <Input value={wizard.specialNotes} onChange={updater('specialNotes')} placeholder="Any other details, themes, or notes..." multiline rows={2} />
        </div>

        {/* AI Generated Outline Result */}
        {hasOutline && generatedOutline && (
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Sparkles style={{ width: 14, height: 14, color: '#34D399' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#34D399' }}>AI Outline Generated</span>
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 10, color: '#aeaeb2' }}><span style={{ color: '#F5F5F7', fontWeight: 600 }}>{generatedOutline.chapters?.length || 0}</span> chapters</div>
              <div style={{ fontSize: 10, color: '#aeaeb2' }}><span style={{ color: '#F5F5F7', fontWeight: 600 }}>{generatedOutline.beats?.length || 0}</span> beats</div>
              <div style={{ fontSize: 10, color: '#aeaeb2' }}><span style={{ color: '#F5F5F7', fontWeight: 600 }}>{generatedOutline.characters?.length || 0}</span> characters</div>
              <div style={{ fontSize: 10, color: '#aeaeb2' }}><span style={{ color: '#F5F5F7', fontWeight: 600 }}>{generatedOutline.locations?.length || 0}</span> locations</div>
            </div>

            {generatedOutline.chapters && generatedOutline.chapters.length > 0 && (
              <details style={{ marginBottom: 6 }}>
                <summary style={{ fontSize: 10, fontWeight: 600, color: colors.gold, cursor: 'pointer', marginBottom: 4 }}>Chapters</summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {generatedOutline.chapters.map((ch, i) => (
                    <div key={i} style={{ padding: '6px 8px', borderRadius: 8, background: '#161616', fontSize: 10, color: '#aeaeb2' }}>
                      <span style={{ color: colors.gold, fontWeight: 600 }}>Ch. {ch.number}:</span> {ch.title}
                    </div>
                  ))}
                </div>
              </details>
            )}

            {generatedOutline.beats && generatedOutline.beats.length > 0 && (
              <details style={{ marginBottom: 6 }}>
                <summary style={{ fontSize: 10, fontWeight: 600, color: colors.gold, cursor: 'pointer', marginBottom: 4 }}>Story Beats</summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {generatedOutline.beats.map((b, i) => (
                    <div key={i} style={{ padding: '6px 8px', borderRadius: 8, background: '#161616', fontSize: 10, color: '#aeaeb2' }}>
                      <span style={{ color: colors.amber, fontWeight: 600 }}>[{b.act}]</span> {b.title}
                    </div>
                  ))}
                </div>
              </details>
            )}

            {generatedOutline.characters && generatedOutline.characters.length > 0 && (
              <details style={{ marginBottom: 6 }}>
                <summary style={{ fontSize: 10, fontWeight: 600, color: colors.gold, cursor: 'pointer', marginBottom: 4 }}>Characters</summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {generatedOutline.characters.map((c, i) => (
                    <div key={i} style={{ padding: '6px 8px', borderRadius: 8, background: '#161616', fontSize: 10, color: '#aeaeb2' }}>
                      <span style={{ color: '#F5F5F7', fontWeight: 600 }}>{c.name}</span> — <span style={{ color: colors.muted }}>{c.role}</span>
                      <div style={{ color: '#636366' }}>{c.description}</div>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {generatedOutline.locations && generatedOutline.locations.length > 0 && (
              <details>
                <summary style={{ fontSize: 10, fontWeight: 600, color: colors.gold, cursor: 'pointer', marginBottom: 4 }}>Locations</summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {generatedOutline.locations.map((l, i) => (
                    <div key={i} style={{ padding: '6px 8px', borderRadius: 8, background: '#161616', fontSize: 10, color: '#aeaeb2' }}>
                      <span style={{ color: '#F5F5F7', fontWeight: 600 }}>{l.name}</span> — <span style={{ color: colors.muted }}>{l.type}</span>
                      <div style={{ color: '#636366' }}>{l.description}</div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Error state */}
        {generateError && (
          <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <div style={{ fontSize: 11, color: '#F87171', marginBottom: 8 }}>{generateError}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleGenerateOutline}
                style={{
                  padding: '6px 14px', borderRadius: 16, border: `1px solid ${colors.goldBorder}`,
                  background: 'transparent', color: colors.gold, fontSize: 10, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
              <button onClick={() => { setGeneratedOutline(null); setGenerateError(''); }}
                style={{
                  padding: '6px 14px', borderRadius: 16, border: `1px solid ${colors.border}`,
                  background: '#161616', color: '#aeaeb2', fontSize: 10, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Skip and create blank
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!hasOutline && !generateError && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleGenerateOutline} disabled={generateLoading || !wizard.workingTitle.trim()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 20px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: 'none', background: colors.gold, color: '#1a0f00',
                cursor: (generateLoading || !wizard.workingTitle.trim()) ? 'not-allowed' : 'pointer',
                opacity: (generateLoading || !wizard.workingTitle.trim()) ? 0.6 : 1,
                transition: 'background .15s',
              }}
            >
              {generateLoading ? (
                <><Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> AI is crafting your outline...</>
              ) : (
                <><Sparkles style={{ width: 13, height: 13 }} /> Generate Starter Outline</>
              )}
            </button>
            <button onClick={() => { setGeneratedOutline(null); setGenerateError(''); setStep(7); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: `1px solid ${colors.border}`, background: '#161616',
                color: '#aeaeb2', cursor: 'pointer',
              }}
            >
              Skip AI &mdash; Create Blank Project
            </button>
          </div>
        )}

        {/* After outline generated: navigation hint */}
        {hasOutline && (
          <div style={{ marginTop: 12, fontSize: 10, color: colors.muted, fontStyle: 'italic' }}>
            Your outline is only a starting point &mdash; you can change everything later during writing.
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Step 8 — Review & Create
  // ═══════════════════════════════════════════
  function renderStep8() {
    const genreName = wizard.genre === 'custom' ? wizard.customGenre : selectedGenre?.name || '—';
    const structureName = selectedStructure?.name || 'None (Blank)';

    return (
      <FadeIn>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>Review your novel settings</h2>
        <p style={{ fontSize: 11, color: colors.muted, marginBottom: 16 }}>
          Everything looks good? You can go back to change anything.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Summary Cards */}
          <SummaryCard title="Story Type">
            <SummaryRow label="Format" value={selectedType?.title || '—'} />
            {selectedType && <SummaryRow label="Recommended" value={`${selectedType.recommendedWords} words`} />}
          </SummaryCard>

          <SummaryCard title="Genre">
            <SummaryRow label="Genre" value={genreName} />
          </SummaryCard>

          <SummaryCard title="Languages">
            <SummaryRow label="Source" value={LANG_NAMES[wizard.sourceLanguage] || wizard.sourceLanguage || '—'} />
            <SummaryRow label="Target" value={LANG_NAMES[wizard.targetLanguage] || wizard.targetLanguage || '—'} />
            <SummaryRow label="AI Output" value={LANG_NAMES[aiOutputLanguageValue] || aiOutputLanguageValue || '—'} />
          </SummaryCard>

          <SummaryCard title="Structure">
            <SummaryRow label="Template" value={structureName} />
          </SummaryCard>

          <SummaryCard title="Style">
            <SummaryRow label="POV" value={WRITING_STYLES.pov.find(p => p.id === wizard.pov)?.name || 'Not set'} />
            <SummaryRow label="Tense" value={WRITING_STYLES.tense.find(t => t.id === wizard.tense)?.name || 'Not set'} />
            <SummaryRow label="Tone" value={WRITING_STYLES.tone.find(t => t.id === wizard.tone)?.name || 'Not set'} />
            <SummaryRow label="Prose" value={WRITING_STYLES.proseStyle.find(p => p.id === wizard.proseStyle)?.name || 'Not set'} />
            <SummaryRow label="Audience" value={WRITING_STYLES.targetAudience.find(a => a.id === wizard.targetAudience)?.name || 'Not set'} />
          </SummaryCard>

          <SummaryCard title="Writing Goals">
            <SummaryRow label="Target" value={`${fmtWords(wizard.targetWordCount)} words`} />
            <SummaryRow label="Daily Goal" value={`${fmtWords(wizard.dailyWordGoal)} words`} />
            <SummaryRow label="Per Chapter" value={`${fmtWords(wizard.chapterWordTarget)} words`} />
            {wizard.deadline && <SummaryRow label="Deadline" value={wizard.deadline} />}
          </SummaryCard>

          <SummaryCard title="Project Details">
            <SummaryRow label="Title" value={wizard.workingTitle || '—'} />
            <SummaryRow label="AI Status" value={generatedOutline ? `Generated (${generatedOutline.chapters?.length || 0} ch, ${generatedOutline.beats?.length || 0} beats, ${generatedOutline.characters?.length || 0} chars, ${generatedOutline.locations?.length || 0} locs)` : 'Blank project'} />
          </SummaryCard>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={() => handleCreate(false)} disabled={createLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 22px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: 'none', background: colors.gold, color: '#1a0f00',
                cursor: createLoading ? 'not-allowed' : 'pointer',
                opacity: createLoading ? 0.6 : 1,
                transition: 'background .15s',
              }}
            >
              {createLoading ? <><Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Creating...</> : <><Sparkles style={{ width: 13, height: 13 }} /> Create Novel</>}
            </button>
            <button onClick={() => handleCreate(true)} disabled={createLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 22px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1px solid ${colors.goldBorder}`, background: colors.goldBg,
                color: colors.gold, cursor: createLoading ? 'not-allowed' : 'pointer',
                opacity: createLoading ? 0.6 : 1,
                transition: 'all .15s',
              }}
            >
              <PenTool style={{ width: 13, height: 13 }} /> Create and Open Writing Studio
            </button>
          </div>

          {createError && (
            <div style={{ fontSize: 11, color: '#F87171', marginTop: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
              {createError}
            </div>
          )}
        </div>
      </FadeIn>
    );
  }
}

// ─── Summary Sub-components ───

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12,
      background: colors.cardBg, border: `1px solid ${colors.border}`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: colors.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}>
      <span style={{ color: '#aeaeb2' }}>{label}</span>
      <span style={{ color: '#F5F5F7', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}
