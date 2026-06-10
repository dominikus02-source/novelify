'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, PenTool, Globe, Sparkles, Download, Bell,
  Puzzle, Shield, Palette, Check, Loader2, Save, X, ChevronRight,
  BookOpen, Mail, Link, Monitor, Sun, Moon, Eye, Lock, FileText,
  MessageSquare, Clock, Target, BookMarked, Languages,
} from 'lucide-react';
import { colors, Card, PageHeader, FadeIn } from './dashboard-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const languageOptions = [
  { value: 'id', label: 'Indonesian' }, { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' }, { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' }, { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' }, { value: 'pt', label: 'Portuguese' },
  { value: 'hi', label: 'Hindi' },
];

const genreOptions = [
  'Fiction', 'Fantasy', 'Romance', 'Mystery', 'Thriller', 'Sci-Fi',
  'Horror', 'Drama', 'Literary Fiction', 'Historical Fiction', 'Non-Fiction', 'Other',
];

type SectionId =
  | 'profile' | 'billing' | 'writing' | 'language' | 'ai'
  | 'export' | 'notifications' | 'integrations' | 'privacy' | 'appearance';

interface SectionDef {
  id: SectionId;
  icon: React.ElementType;
  label: string;
  desc: string;
}

const sections: SectionDef[] = [
  { id: 'profile', icon: User, label: 'Profile', desc: 'Your public author identity across exports and publishing assets.' },
  { id: 'billing', icon: CreditCard, label: 'Account & Billing', desc: 'Plan, subscription, and AI usage.' },
  { id: 'writing', icon: PenTool, label: 'Writing Preferences', desc: 'Set how Novelify prepares your writing space before every session.' },
  { id: 'language', icon: Globe, label: 'Language & AI Output', desc: 'Control the language Novelify uses when writing, revising, translating, and generating publishing assets.' },
  { id: 'ai', icon: Sparkles, label: 'AI Preferences', desc: 'Shape how your AI co-writer thinks, writes, and suggests changes.' },
  { id: 'export', icon: Download, label: 'Export & Publishing', desc: 'Prepare consistent metadata and formatting for every manuscript export.' },
  { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Writing reminders, goal alerts, and task notifications.' },
  { id: 'integrations', icon: Puzzle, label: 'Integrations', desc: 'Connect Novelify with your writing tools.' },
  { id: 'privacy', icon: Shield, label: 'Privacy & Security', desc: 'Control your manuscripts, account access, and data export options.' },
  { id: 'appearance', icon: Palette, label: 'Appearance', desc: 'Customize the look and feel of Novelify.' },
];

interface SettingsData {
  [key: string]: any;
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    Promise.all([
      fetch('/api/settings'),
      fetch('/api/auth/session').then(r => r.json()),
    ]).then(([settingsRes, session]) => {
      if (settingsRes.ok) settingsRes.json().then(d => setData(d));
      setUserEmail(session?.user?.email || '');
      setUserName(session?.user?.name || '');
      setUserPlan(session?.user?.plan || 'free');
    }).finally(() => setLoading(false));
  }, []);

  const updateField = (field: string, value: any) => {
    setData(prev => prev ? { ...prev, [field]: value } : { [field]: value });
    setSaveMsg(null);
  };

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSaveMsg({ type: 'success', text: 'Settings saved successfully.' });
        setTimeout(() => setSaveMsg(null), 3000);
      } else {
        setSaveMsg({ type: 'error', text: 'Failed to save settings.' });
      }
    } catch {
      setSaveMsg({ type: 'error', text: 'Connection error.' });
    } finally {
      setSaving(false);
    }
  }, [data]);

  const ActiveIcon = sections.find(s => s.id === activeSection)?.icon || User;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: colors.darkBg }}>
        <Loader2 className="size-6 animate-spin" style={{ color: colors.gold }} />
      </div>
    );
  }

  const s = data || {};

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <PageHeader title="Settings" subtitle="Manage your writing workspace, AI behavior, publishing preferences, and account" />

        <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 160px)' }}>
          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-1 shrink-0" style={{ width: 220 }}>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const active = activeSection === sec.id;
              return (
                <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all w-full"
                  style={{
                    background: active ? 'rgba(201,169,110,0.10)' : 'transparent',
                    color: active ? '#E8C98A' : '#8E8E93',
                    border: `1px solid ${active ? 'rgba(201,169,110,0.2)' : 'transparent'}`,
                  }}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="text-xs font-medium">{sec.label}</span>
                  {active && <ChevronRight className="size-3 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Mobile tab selector */}
          <div className="flex md:hidden overflow-x-auto gap-1.5 pb-2 -mx-2 px-2">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const active = activeSection === sec.id;
              return (
                <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all"
                  style={{
                    background: active ? 'rgba(201,169,110,0.10)' : '#161616',
                    color: active ? '#E8C98A' : '#8E8E93',
                    border: `1px solid ${active ? 'rgba(201,169,110,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                ><Icon className="size-3" /> {sec.label}</button>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                <Card>
                  <div style={{ padding: 24 }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex size-9 items-center justify-center rounded-xl" style={{ background: 'rgba(201,169,110,0.10)' }}>
                        <ActiveIcon className="size-5" style={{ color: colors.gold }} />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold" style={{ color: '#F5F5F7' }}>{sections.find(s => s.id === activeSection)?.label}</h2>
                        <p className="text-[11px]" style={{ color: '#636366' }}>{sections.find(s => s.id === activeSection)?.desc}</p>
                      </div>
                    </div>

                    {/* ─── PROFILE ─── */}
                    {activeSection === 'profile' && (
                      <div className="space-y-4 max-w-xl">
                        <Field label="Display Name" desc="Your name as shown in the app">
                          <Input value={userName} disabled
                            style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                          />
                        </Field>
                        <Field label="Email" desc="Your account email (read-only)">
                          <Input value={userEmail} disabled
                            style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                          />
                        </Field>
                        <Field label="Pen Name" desc="Your author name used in exports and publishing">
                          <Input value={s.penName || ''} onChange={(e) => updateField('penName', e.target.value)}
                            placeholder="e.g., J.K. Rowling"
                            style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                          />
                        </Field>
                        <Field label="Author Bio" desc="A short bio for your book descriptions and author page">
                          <Textarea value={s.authorBio || ''} onChange={(e) => updateField('authorBio', e.target.value)}
                            rows={3} placeholder="Write a short author bio..."
                            style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                          />
                        </Field>
                        <Field label="Default Author Name" desc="Default name for copyright page and metadata">
                          <Input value={s.defaultAuthorName || ''} onChange={(e) => updateField('defaultAuthorName', e.target.value)}
                            placeholder="Author name for exports"
                            style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                          />
                        </Field>
                        <Field label="Website" desc="Your author website or social media URL">
                          <Input value={s.website || ''} onChange={(e) => updateField('website', e.target.value)}
                            placeholder="https://yoursite.com"
                            style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                          />
                        </Field>
                      </div>
                    )}

                    {/* ─── BILLING ─── */}
                    {activeSection === 'billing' && (
                      <div className="max-w-xl">
                        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)' }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>Current Plan</p>
                              <p className="text-xs mt-1" style={{ color: '#8E8E93' }}>
                                {userPlan === 'free' ? 'Free — 1,000 AI words/day' : 'Pro — 10,000 AI words/day'}
                              </p>
                            </div>
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg capitalize"
                              style={{ background: userPlan === 'free' ? 'rgba(142,142,147,0.15)' : 'rgba(52,211,153,0.12)', color: userPlan === 'free' ? '#8E8E93' : '#34D399' }}
                            >{userPlan}</span>
                          </div>
                        </div>
                        <div className="rounded-xl p-4 mb-4" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-sm font-medium mb-1" style={{ color: '#F5F5F7' }}>AI Usage</p>
                          <p className="text-xs" style={{ color: '#8E8E93' }}>Your daily AI word usage tracking will appear here once available.</p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-xs italic" style={{ color: '#636366' }}>Billing management will be available when subscriptions are enabled.</p>
                        </div>
                      </div>
                    )}

                    {/* ─── WRITING PREFERENCES ─── */}
                    {activeSection === 'writing' && (
                      <div className="space-y-4 max-w-xl">
                        <Field label="Default Genre" desc="Pre-selected genre when creating a new novel">
                          <Select value={s.defaultGenre || ''} onValueChange={(v) => updateField('defaultGenre', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue placeholder="Not set" />
                            </SelectTrigger>
                            <SelectContent>
                              {genreOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Default POV" desc="Point of view">
                            <Select value={s.defaultPOV || 'third_person_limited'} onValueChange={(v) => updateField('defaultPOV', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="first_person">First Person</SelectItem>
                                <SelectItem value="third_person_limited">Third Person Limited</SelectItem>
                                <SelectItem value="third_person_omniscient">Third Person Omniscient</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Default Tense">
                            <Select value={s.defaultTense || 'past'} onValueChange={(v) => updateField('defaultTense', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="past">Past Tense</SelectItem>
                                <SelectItem value="present">Present Tense</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Chapter Word Target" desc="Default target words per chapter">
                            <Input type="number" value={s.defaultChapterWordTarget || 3000}
                              onChange={(e) => updateField('defaultChapterWordTarget', parseInt(e.target.value) || 3000)}
                              style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                            />
                          </Field>
                          <Field label="Daily Word Goal" desc="Default daily writing target">
                            <Input type="number" value={s.defaultDailyWordGoal || 1000}
                              onChange={(e) => updateField('defaultDailyWordGoal', parseInt(e.target.value) || 1000)}
                              style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                            />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Autosave Interval (ms)" desc="How often your work is auto-saved">
                            <Input type="number" value={s.autosaveInterval || 2000}
                              onChange={(e) => updateField('autosaveInterval', parseInt(e.target.value) || 2000)}
                              style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                            />
                          </Field>
                          <Field label="Default Writing Mode">
                            <Select value={s.defaultWritingMode || 'chapter'} onValueChange={(v) => updateField('defaultWritingMode', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="chapter">Chapter</SelectItem>
                                <SelectItem value="scene">Scene</SelectItem>
                                <SelectItem value="focus">Focus</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Editor Font">
                            <Select value={s.manuscriptFont || 'serif'} onValueChange={(v) => updateField('manuscriptFont', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="serif">Serif</SelectItem>
                                <SelectItem value="sans">Sans-Serif</SelectItem>
                                <SelectItem value="mono">Monospace</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Editor Density">
                            <Select value={s.editorDensity || 'comfortable'} onValueChange={(v) => updateField('editorDensity', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="comfortable">Comfortable</SelectItem>
                                <SelectItem value="compact">Compact</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                      </div>
                    )}

                    {/* ─── LANGUAGE & AI OUTPUT ─── */}
                    {activeSection === 'language' && (
                      <div className="space-y-4 max-w-xl">
                        <div className="rounded-xl p-4" style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)' }}>
                          <p className="text-xs font-medium mb-1" style={{ color: '#C9A96E' }}>Important</p>
                          <p className="text-[11px]" style={{ color: '#8E8E93' }}>
                            These settings control the language Novelify uses for ALL AI-generated content. If a project has a target language set, that takes priority over your defaults when "Use project language" is enabled.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Default Source Language" desc="Language your manuscripts are written in">
                            <Select value={s.defaultSourceLanguage || 'id'} onValueChange={(v) => updateField('defaultSourceLanguage', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {languageOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Default Target Language" desc="Language for translation and AI output">
                            <Select value={s.defaultTargetLanguage || 'en'} onValueChange={(v) => updateField('defaultTargetLanguage', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {languageOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <Field label="Default AI Output Language" desc="Language the AI uses when generating content">
                          <Select value={s.defaultAiOutputLanguage || 'en'} onValueChange={(v) => updateField('defaultAiOutputLanguage', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languageOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </Field>
                        <ToggleField label="Always use project target language for AI" desc="When enabled, AI output follows each project's target language setting" checked={s.alwaysUseProjectTargetLanguage !== false} onChange={(v) => updateField('alwaysUseProjectTargetLanguage', v)} />
                        <Field label="Translation Style" desc="How the AI approaches translation">
                          <Select value={s.translationStyle || 'literary'} onValueChange={(v) => updateField('translationStyle', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="faithful">Faithful (word-for-word accurate)</SelectItem>
                              <SelectItem value="literary">Literary (meaning-for-meaning)</SelectItem>
                              <SelectItem value="localized">Localized (adapt to target culture)</SelectItem>
                              <SelectItem value="simple">Simple (plain language)</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <ToggleField label="Preserve character names" checked={s.preserveCharacterNames !== false} onChange={(v) => updateField('preserveCharacterNames', v)} />
                        <ToggleField label="Preserve place names" checked={s.preservePlaceNames !== false} onChange={(v) => updateField('preservePlaceNames', v)} />
                        <Field label="Glossary Behavior" desc="How known terms are handled in translation">
                          <Select value={s.glossaryBehavior || 'preserve'} onValueChange={(v) => updateField('glossaryBehavior', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="preserve">Preserve original terms</SelectItem>
                              <SelectItem value="translate">Translate all terms</SelectItem>
                              <SelectItem value="ask">Ask me each time</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                    )}

                    {/* ─── AI PREFERENCES ─── */}
                    {activeSection === 'ai' && (
                      <div className="space-y-4 max-w-xl">
                        <Field label="AI Creativity" desc="How creative vs precise the AI should be">
                          <Select value={s.aiCreativity || 'balanced'} onValueChange={(v) => updateField('aiCreativity', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="precise">Precise (follows instructions strictly)</SelectItem>
                              <SelectItem value="balanced">Balanced (creative but controlled)</SelectItem>
                              <SelectItem value="imaginative">Imaginative (highly creative)</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Default Tone" desc="The default narrative tone">
                          <Select value={s.defaultTone || 'literary'} onValueChange={(v) => updateField('defaultTone', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="literary">Literary</SelectItem>
                              <SelectItem value="cinematic">Cinematic</SelectItem>
                              <SelectItem value="simple">Simple</SelectItem>
                              <SelectItem value="emotional">Emotional</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Prose Style">
                            <Select value={s.proseStyle || 'clean'} onValueChange={(v) => updateField('proseStyle', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="clean">Clean</SelectItem>
                                <SelectItem value="poetic">Poetic</SelectItem>
                                <SelectItem value="fast_paced">Fast-Paced</SelectItem>
                                <SelectItem value="descriptive">Descriptive</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Content Level">
                            <Select value={s.contentLevel || 'general'} onValueChange={(v) => updateField('contentLevel', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="mature">Mature</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <Field label="AI Suggestion Mode" desc="How AI suggestions are presented">
                          <Select value={s.aiSuggestionMode || 'append_after_confirmation'} onValueChange={(v) => updateField('aiSuggestionMode', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="suggest_only">Suggest only (show in panel)</SelectItem>
                              <SelectItem value="append_after_confirmation">Append after confirmation</SelectItem>
                              <SelectItem value="never_auto_replace">Never auto-replace</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <ToggleField label="Include Story Bible context" desc="AI uses characters, locations, and lore when writing" checked={s.includeStoryBibleContext !== false} onChange={(v) => updateField('includeStoryBibleContext', v)} />
                        <ToggleField label="Include previous chapter context" checked={s.includePreviousChapterContext !== false} onChange={(v) => updateField('includePreviousChapterContext', v)} />
                        <ToggleField label="Include style guide context" checked={s.includeStyleGuideContext !== false} onChange={(v) => updateField('includeStyleGuideContext', v)} />
                      </div>
                    )}

                    {/* ─── EXPORT & PUBLISHING ─── */}
                    {activeSection === 'export' && (
                      <div className="space-y-4 max-w-xl">
                        <Field label="Default Export Format">
                          <Select value={s.defaultExportFormat || 'epub'} onValueChange={(v) => updateField('defaultExportFormat', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="epub">EPUB</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="docx">DOCX</SelectItem>
                              <SelectItem value="markdown">Markdown</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Page Size">
                          <Select value={s.pageSize || '6x9'} onValueChange={(v) => updateField('pageSize', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1c', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                              <SelectItem value="6x9">6x9 (Trade)</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <ToggleField label="Include Table of Contents" checked={s.includeTableOfContents !== false} onChange={(v) => updateField('includeTableOfContents', v)} />
                        <ToggleField label="Include Copyright Page" checked={s.includeCopyrightPage !== false} onChange={(v) => updateField('includeCopyrightPage', v)} />
                        <Field label="Default Copyright Text">
                          <Textarea value={s.defaultCopyrightText || ''} onChange={(e) => updateField('defaultCopyrightText', e.target.value)}
                            rows={2} placeholder="Copyright © [Year] [Author Name]. All rights reserved."
                            style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Publisher Name">
                            <Input value={s.publisherName || ''} onChange={(e) => updateField('publisherName', e.target.value)}
                              placeholder="Optional"
                              style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                            />
                          </Field>
                          <Field label="ISBN">
                            <Input value={s.isbn || ''} onChange={(e) => updateField('isbn', e.target.value)}
                              placeholder="Optional"
                              style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                            />
                          </Field>
                        </div>
                        <Field label="Author Bio for Export">
                          <Textarea value={s.authorBioForExport || ''} onChange={(e) => updateField('authorBioForExport', e.target.value)}
                            rows={2} placeholder="About the author page content..."
                            style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                          />
                        </Field>
                      </div>
                    )}

                    {/* ─── NOTIFICATIONS ─── */}
                    {activeSection === 'notifications' && (
                      <div className="space-y-4 max-w-xl">
                        <ToggleField label="Writing Reminder" desc="Daily reminder to write" checked={s.writingReminderEnabled !== false} onChange={(v) => updateField('writingReminderEnabled', v)} />
                        <Field label="Reminder Time">
                          <Input type="time" value={s.writingReminderTime || '18:00'} onChange={(e) => updateField('writingReminderTime', e.target.value)}
                            style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7', width: 150 }}
                          />
                        </Field>
                        <ToggleField label="Daily Goal Reminder" checked={s.dailyGoalReminder !== false} onChange={(v) => updateField('dailyGoalReminder', v)} />
                        <ToggleField label="Weekly Progress Email" checked={s.weeklyProgressEmail === true} onChange={(v) => updateField('weeklyProgressEmail', v)} />
                        <ToggleField label="Export Completed Notification" checked={s.exportCompletedNotification !== false} onChange={(v) => updateField('exportCompletedNotification', v)} />
                        <ToggleField label="AI Task Completed Notification" checked={s.aiTaskCompletedNotification !== false} onChange={(v) => updateField('aiTaskCompletedNotification', v)} />
                        <ToggleField label="Marketing Reminder" checked={s.marketingReminder === true} onChange={(v) => updateField('marketingReminder', v)} />
                      </div>
                    )}

                    {/* ─── INTEGRATIONS ─── */}
                    {activeSection === 'integrations' && (
                      <div className="space-y-3 max-w-xl">
                        {[
                          { icon: BookOpen, name: 'Google Docs', desc: 'Import and export documents from Google Docs' },
                          { icon: Mail, name: 'Google Drive', desc: 'Sync manuscripts to Google Drive' },
                          { icon: Link, name: 'Notion', desc: 'Connect your Notion workspace for research notes' },
                        ].map((int) => (
                          <div key={int.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center gap-3">
                              <int.icon className="size-4" style={{ color: colors.gold }} />
                              <div>
                                <p className="text-xs font-medium" style={{ color: '#F5F5F7' }}>{int.name}</p>
                                <p className="text-[10px]" style={{ color: '#636366' }}>{int.desc}</p>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(142,142,147,0.1)', color: '#8E8E93', fontStyle: 'italic' }}>Coming soon</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ─── PRIVACY & SECURITY ─── */}
                    {activeSection === 'privacy' && (
                      <div className="space-y-4 max-w-xl">
                        <Field label="Manuscript Privacy" desc="Who can access your manuscripts">
                          <Select value={s.manuscriptPrivacy || 'private'} onValueChange={(v) => updateField('manuscriptPrivacy', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private">Private (only me)</SelectItem>
                              <SelectItem value="link_shared">Link-shared</SelectItem>
                              <SelectItem value="collaborator_only">Collaborators only</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <ToggleField label="Allow AI training on my manuscripts" desc="When disabled, your content will never be used for AI training" checked={s.allowAITrainingOnMyManuscript === true} onChange={(v) => updateField('allowAITrainingOnMyManuscript', v)} />
                        <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                          <p className="text-xs font-medium mb-3" style={{ color: '#F5F5F7' }}>Danger Zone</p>
                          <p className="text-[11px] mb-3" style={{ color: '#636366' }}>Data export and account deletion features will be available soon.</p>
                        </div>
                      </div>
                    )}

                    {/* ─── APPEARANCE ─── */}
                    {activeSection === 'appearance' && (
                      <div className="space-y-4 max-w-xl">
                        <Field label="Theme">
                          <Select value={s.theme || 'dark'} onValueChange={(v) => updateField('theme', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="size-3" /> Dark</div></SelectItem>
                              <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="size-3" /> Light</div></SelectItem>
                              <SelectItem value="system"><div className="flex items-center gap-2"><Monitor className="size-3" /> System</div></SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Accent Color">
                          <Select value={s.accentColor || 'gold'} onValueChange={(v) => updateField('accentColor', v)}>
                            <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gold">Gold</SelectItem>
                              <SelectItem value="amber">Amber</SelectItem>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="violet">Violet</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Editor Paper">
                            <Select value={s.editorPaper || 'warm'} onValueChange={(v) => updateField('editorPaper', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warm">Warm</SelectItem>
                                <SelectItem value="white">White</SelectItem>
                                <SelectItem value="sepia">Sepia</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Editor Font">
                            <Select value={s.editorFont || 'serif'} onValueChange={(v) => updateField('editorFont', v)}>
                              <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="serif">Serif</SelectItem>
                                <SelectItem value="sans">Sans-Serif</SelectItem>
                                <SelectItem value="mono">Monospace</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <ToggleField label="Reduced Motion" checked={s.reducedMotion === true} onChange={(v) => updateField('reducedMotion', v)} />
                        <ToggleField label="Compact Sidebar" checked={s.compactSidebar === true} onChange={(v) => updateField('compactSidebar', v)} />
                      </div>
                    )}

                    {/* Save / Status */}
                    <div className="flex items-center gap-3 mt-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <Button onClick={handleSave} disabled={saving}
                        className="bg-amber hover:bg-amber/90 text-ink font-semibold"
                        style={{ fontSize: 12, gap: 6 }}
                      >
                        {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      {saveMsg && (
                        <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1.5 text-xs"
                          style={{ color: saveMsg.type === 'success' ? '#34D399' : '#F87171' }}
                        >
                          {saveMsg.type === 'success' ? <Check className="size-3" /> : <X className="size-3" />}
                          {saveMsg.text}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium" style={{ color: '#F5F5F7' }}>{label}</Label>
      {desc && <p className="text-[10px] mb-1.5" style={{ color: '#636366' }}>{desc}</p>}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ToggleField({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-xs font-medium" style={{ color: '#F5F5F7' }}>{label}</p>
        {desc && <p className="text-[10px]" style={{ color: '#636366' }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className="relative shrink-0 rounded-full transition-all"
        style={{
          width: 40, height: 22,
          background: checked ? 'rgba(201,169,110,0.4)' : 'rgba(255,255,255,0.1)',
          border: `1px solid ${checked ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        <div className="absolute top-0.5 rounded-full transition-all" style={{
          width: 18, height: 18, background: checked ? '#C9A96E' : '#636366',
          left: checked ? 20 : 1,
        }} />
      </button>
    </div>
  );
}
