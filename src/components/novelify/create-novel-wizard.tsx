'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Users, Map, Globe, FileText, Check, Plus, X, Loader2,
  ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNovelifyStore } from '@/lib/store';
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
  { value: 'hi', label: 'Hindi' }, { value: 'other', label: 'Other' },
];

const genreOptions = [
  'Fiction', 'Fantasy', 'Romance', 'Mystery', 'Thriller', 'Sci-Fi',
  'Horror', 'Drama', 'Literary Fiction', 'Historical Fiction', 'Non-Fiction', 'Other',
];

const roleOptions = ['protagonist', 'antagonist', 'supporting', 'minor'];
const importanceOptions = ['minor', 'major', 'critical'];

interface CharData { name: string; role: string; description: string; }
interface LocData { name: string; description: string; importance: string; }

const steps = [
  { id: 'basics', label: 'Title', icon: BookOpen },
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'locations', label: 'Locations', icon: Map },
  { id: 'worldbuilding', label: 'Setting', icon: Globe },
  { id: 'outline', label: 'Outline', icon: FileText },
];

export function CreateNovelWizard({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const { projects, setProjects, setSelectedProject, setCurrentView } = useNovelifyStore();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 - Basics
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('id');
  const [targetLanguage, setTargetLanguage] = useState('en');

  // Step 2 - Characters
  const [chars, setChars] = useState<CharData[]>([]);
  const [chName, setChName] = useState('');
  const [chRole, setChRole] = useState('supporting');
  const [chDesc, setChDesc] = useState('');

  // Step 3 - Locations
  const [locs, setLocs] = useState<LocData[]>([]);
  const [locName, setLocName] = useState('');
  const [locDesc, setLocDesc] = useState('');
  const [locImportance, setLocImportance] = useState('minor');

  // Step 4 - Worldbuilding
  const [settingNotes, setSettingNotes] = useState('');

  // Step 5 - Outline
  const [plotOutline, setPlotOutline] = useState('');
  const [styleGuide, setStyleGuide] = useState('');

  const [titleError, setTitleError] = useState(false);
  const creating = isSubmitting;

  const addCharacter = () => {
    if (!chName.trim()) return;
    setChars([...chars, { name: chName.trim(), role: chRole, description: chDesc.trim() }]);
    setChName(''); setChDesc(''); setChRole('supporting');
  };

  const removeChar = (i: number) => setChars(chars.filter((_, idx) => idx !== i));

  const addLocation = () => {
    if (!locName.trim()) return;
    setLocs([...locs, { name: locName.trim(), description: locDesc.trim(), importance: locImportance }]);
    setLocName(''); setLocDesc(''); setLocImportance('minor');
  };

  const removeLoc = (i: number) => setLocs(locs.filter((_, idx) => idx !== i));

  const canNext = () => {
    if (step === 0) return title.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !title.trim()) { setTitleError(true); return; }
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleCreate = async () => {
    if (!title.trim()) { setTitleError(true); return; }
    setIsSubmitting(true);
    try {
      // 1. Create project
      const res = await fetch('/api/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(), genre: genre || null, sourceLanguage, targetLanguage,
          plotOutline: plotOutline.trim() || null, styleGuide: styleGuide.trim() || null,
        }),
      });
      if (!res.ok) return;
      const newProject = await res.json();

      // 2. Create characters
      for (const ch of chars) {
        await fetch('/api/characters', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: newProject.id, ...ch }),
        });
      }

      // 3. Create locations
      for (const loc of locs) {
        await fetch('/api/locations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: newProject.id, ...loc }),
        });
      }

      // 4. Create worldbuilding story note
      if (settingNotes.trim()) {
        await fetch('/api/story-notes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: newProject.id, title: 'Worldbuilding',
            content: settingNotes.trim(), category: 'worldbuilding',
          }),
        });
      }

      // Refetch project to get the full object with relations
      const refetch = await fetch('/api/projects');
      if (refetch.ok) {
        const allProjects = await refetch.json();
        setProjects(allProjects);
        const fresh = allProjects.find((p: any) => p.id === newProject.id);
        if (fresh) {
          setSelectedProject(fresh);
          setCurrentView('writing');
          router.push(`/dashboard/writing/${fresh.id}`);
        }
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl" style={{ background: 'rgba(201,169,110,0.10)' }}>
                <BookOpen className="size-5" style={{ color: '#C9A96E' }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: '#F5F5F7' }}>Create New Novel</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#8E8E93' }}>
              <X className="size-4" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1.5 mb-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = step === i;
              const done = step > i;
              return (
                <div key={s.id} className="flex items-center gap-1.5 flex-1">
                  <button onClick={() => { if (i < step || (i === step)) setStep(i); }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      background: active ? 'rgba(201,169,110,0.12)' : done ? 'rgba(52,211,153,0.10)' : 'rgba(255,255,255,0.04)',
                      color: active ? '#C9A96E' : done ? '#34D399' : '#636366',
                      border: `1px solid ${active ? 'rgba(201,169,110,0.3)' : done ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      flex: 1, justifyContent: 'center',
                    }}
                  >
                    {done ? <Check className="size-2.5" /> : <Icon className="size-2.5" />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < steps.length - 1 && <div style={{ width: 8, height: 1, background: done || active ? '#C9A96E' : 'rgba(255,255,255,0.08)' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div style={{ minHeight: 320, padding: '0 24px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>

              {/* Step 1: Title & Basics */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm" style={{ color: '#F5F5F7' }}>Title <span style={{ color: '#F87171' }}>*</span></Label>
                    <Input value={title} onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
                      placeholder="Enter your novel title"
                      className={titleError ? 'border-red-500' : ''}
                      style={{ borderColor: titleError ? '#F87171' : 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7', marginTop: 6 }}
                    />
                    {titleError && <p className="text-xs mt-1" style={{ color: '#F87171' }}>Title is required</p>}
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: '#F5F5F7' }}>Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="w-full mt-1.5" style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genreOptions.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm" style={{ color: '#F5F5F7' }}>Source Language</Label>
                      <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                        <SelectTrigger className="w-full mt-1.5" style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm" style={{ color: '#F5F5F7' }}>Target Language</Label>
                      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger className="w-full mt-1.5" style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Characters */}
              {step === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>Characters <span style={{ color: '#8E8E93' }}>({chars.length})</span></p>
                  </div>
                  {chars.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {chars.map((ch, i) => (
                        <div key={i} style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium" style={{ color: '#F5F5F7' }}>{ch.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,169,110,0.1)', color: '#C9A96E' }}>{ch.role}</span>
                              <button onClick={() => removeChar(i)} className="p-0.5 rounded hover:bg-white/10" style={{ color: '#636366' }}><X className="size-3" /></button>
                            </div>
                          </div>
                          {ch.description && <p className="text-xs" style={{ color: '#8E8E93' }}>{ch.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input value={chName} onChange={(e) => setChName(e.target.value)}
                          placeholder="Character name" className="text-sm"
                          style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                        />
                      </div>
                      <Select value={chRole} onValueChange={setChRole}>
                        <SelectTrigger className="w-[120px]" style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input value={chDesc} onChange={(e) => setChDesc(e.target.value)}
                      placeholder="Brief description (optional)" className="text-sm"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                    />
                    <Button onClick={addCharacter} disabled={!chName.trim()} size="sm" variant="outline" className="w-full text-xs"
                      style={{ borderColor: 'rgba(201,169,110,0.3)', color: '#C9A96E' }}
                    ><Plus className="size-3" /> Add Character</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Locations */}
              {step === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>Locations <span style={{ color: '#8E8E93' }}>({locs.length})</span></p>
                  </div>
                  {locs.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {locs.map((loc, i) => (
                        <div key={i} style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium" style={{ color: '#F5F5F7' }}>{loc.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: loc.importance === 'critical' ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.06)', color: loc.importance === 'critical' ? '#C9A96E' : '#8E8E93' }}>{loc.importance}</span>
                              <button onClick={() => removeLoc(i)} className="p-0.5 rounded hover:bg-white/10" style={{ color: '#636366' }}><X className="size-3" /></button>
                            </div>
                          </div>
                          {loc.description && <p className="text-xs" style={{ color: '#8E8E93' }}>{loc.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input value={locName} onChange={(e) => setLocName(e.target.value)}
                          placeholder="Location name" className="text-sm"
                          style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                        />
                      </div>
                      <Select value={locImportance} onValueChange={setLocImportance}>
                        <SelectTrigger className="w-[120px]" style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {importanceOptions.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input value={locDesc} onChange={(e) => setLocDesc(e.target.value)}
                      placeholder="Description (optional)" className="text-sm"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                    />
                    <Button onClick={addLocation} disabled={!locName.trim()} size="sm" variant="outline" className="w-full text-xs"
                      style={{ borderColor: 'rgba(201,169,110,0.3)', color: '#C9A96E' }}
                    ><Plus className="size-3" /> Add Location</Button>
                  </div>
                </div>
              )}

              {/* Step 4: Setting / Worldbuilding */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm" style={{ color: '#F5F5F7' }}>Worldbuilding & Setting</Label>
                    <p className="text-xs mb-2" style={{ color: '#8E8E93' }}>Describe the world, era, culture, magic system, or any rules your story follows.</p>
                    <Textarea value={settingNotes} onChange={(e) => setSettingNotes(e.target.value)}
                      placeholder="e.g., The story takes place in 19th century London with a hidden magical society..."
                      rows={6} className="text-sm resize-none"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Plot Outline */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm" style={{ color: '#F5F5F7' }}>Plot Outline</Label>
                    <p className="text-xs mb-2" style={{ color: '#8E8E93' }}>Summarize the story arc — beginning, middle, and end.</p>
                    <Textarea value={plotOutline} onChange={(e) => setPlotOutline(e.target.value)}
                      placeholder="e.g., A young detective uncovers a conspiracy that reaches the highest levels of government..."
                      rows={5} className="text-sm resize-none"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: '#F5F5F7' }}>Writing Style Guide</Label>
                    <p className="text-xs mb-2" style={{ color: '#8E8E93' }}>Describe your preferred tone, POV, tense, or style notes.</p>
                    <Textarea value={styleGuide} onChange={(e) => setStyleGuide(e.target.value)}
                      placeholder="e.g., Third-person limited, past tense, atmospheric and lyrical prose with short, punchy dialogue..."
                      rows={3} className="text-sm resize-none"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16 }}>
          <div className="flex items-center justify-between">
            <Button onClick={step === 0 ? onClose : handlePrev} variant="ghost" size="sm" style={{ color: '#8E8E93' }}>
              {step === 0 ? 'Cancel' : <><ChevronLeft className="size-3.5" /> Back</>}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: '#636366' }}>Step {step + 1} of {steps.length}</span>
              {step < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={!canNext()} size="sm" className="bg-amber hover:bg-amber/90 text-ink font-semibold">
                  Next <ChevronRight className="size-3.5" />
                </Button>
              ) : (
                <Button onClick={handleCreate} disabled={creating} size="sm" className="bg-amber hover:bg-amber/90 text-ink font-semibold">
                  {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  {creating ? 'Creating...' : 'Create Novel'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
