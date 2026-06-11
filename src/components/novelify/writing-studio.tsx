'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool, Plus, BookOpen, FileText, Sparkles, Check, X, Save, Loader2,
  GripVertical, ScrollText, Users, Undo2, Wand2, TextSelect, MessageSquarePlus,
  Layers, Globe, Download, FolderTree, BookMarked, Clock, Target,
  ChevronDown, ChevronRight, CircleDot, Search, Settings2, ArrowLeft,
  Maximize2, Minimize2, Trash2, Quote, Eye, EyeOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNovelifyStore, type Project, type Chapter, type Scene } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const chapterStatusCfg: Record<string, { label: string; cls: string }> = {
  idea: { label: 'Idea', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  drafting: { label: 'Drafting', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  revised: { label: 'Revised', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  edited: { label: 'Edited', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  locked: { label: 'Locked', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const sceneStatusCfg: Record<string, { label: string; cls: string }> = {
  idea: { label: 'Idea', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  drafting: { label: 'Drafting', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  revised: { label: 'Revised', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  edited: { label: 'Edited', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  locked: { label: 'Locked', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const aiPresets = [
  { label: 'Continue Scene', icon: MessageSquarePlus, prompt: 'Continue writing the current scene naturally, maintaining the same voice and pacing.' },
  { label: 'Suggest Next', icon: TextSelect, prompt: 'Suggest what could happen next in the story. Write 2-3 sentences.' },
  { label: 'Fix Prose', icon: Wand2, prompt: 'Fix the prose in this section. Improve flow, fix awkward phrasing, and polish the language while preserving the voice.' },
  { label: 'Improve Dialogue', icon: Quote, prompt: 'Improve the dialogue in this section. Make it more natural, distinct per character, and engaging.' },
];

const templates = [
  { id: 'blank', name: 'Blank Novel', genre: 'General', desc: 'Start from scratch' },
  { id: 'romance', name: 'Romance Novel', genre: 'Romance', desc: 'Meet-cute, conflict, resolution' },
  { id: 'fantasy', name: 'Fantasy Novel', genre: 'Fantasy', desc: 'World-building, quest, epic climax' },
  { id: 'mystery', name: 'Mystery/Thriller', genre: 'Mystery', desc: 'Crime, investigation, twist' },
  { id: 'ya', name: 'Young Adult', genre: 'YA', desc: 'Coming-of-age, voice-driven' },
  { id: 'heros-journey', name: 'Hero\'s Journey', genre: 'Adventure', desc: 'Campbell\'s monomyth structure' },
  { id: 'three-act', name: 'Three-Act Structure', genre: 'General', desc: 'Setup, confrontation, resolution' },
];

export function WritingStudio() {
  const router = useRouter();
  const {
    selectedProject, setSelectedProject,
    selectedChapter, setSelectedChapter, selectedScene, setSelectedScene,
    writingMode, setWritingMode, studioTab, setStudioTab,
    bibleTab, setBibleTab, isAiWriting, setIsAiWriting,
    scenes, setScenes, versions, setVersions,
    storyNotes, setStoryNotes, locations, setLocations,
    timelineEvents, setTimelineEvents, writingGoals, setWritingGoals,
  } = useNovelifyStore();

  const [editorContent, setEditorContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileStudioOpen, setMobileStudioOpen] = useState(false);
  const [chaptersExpanded, setChaptersExpanded] = useState<Record<string, boolean>>({});
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showBibleSearch, setShowBibleSearch] = useState(false);
  const [bibleSearch, setBibleSearch] = useState('');
  const [wordLimitMsg, setWordLimitMsg] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationDesc, setNewLocationDesc] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedTimeRef = useRef<Date | null>(null);
  const originalContentRef = useRef('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const goalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conflictTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const outcomeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update editor content when selection changes
  useEffect(() => {
    if (writingMode === 'scene' && selectedScene) {
      const content = selectedScene.content || '';
      setEditorContent(content);
      originalContentRef.current = content;
    } else if (selectedChapter) {
      const content = selectedChapter.contentOriginal || '';
      setEditorContent(content);
      originalContentRef.current = content;
    } else {
      setEditorContent('');
      originalContentRef.current = '';
    }
    setSaveStatus('idle');
    setAiSuggestion('');
  }, [selectedChapter, selectedScene, writingMode]);

  useEffect(() => {
    if (editingTitle && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingTitle]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (editorContent !== originalContentRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [editorContent]);

  // Expand current chapter
  useEffect(() => {
    if (selectedChapter) {
      setChaptersExpanded((prev) => ({ ...prev, [selectedChapter.id]: true }));
    }
  }, [selectedChapter?.id]);

  useEffect(() => {
    if (bibleTab === 'overview') {
      setBibleTab('characters');
    }
  }, [bibleTab, setBibleTab]);

  // Load scenes when project changes
  useEffect(() => {
    if (!selectedProject) return;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const chapterIds = selectedProject.chapters.map((c) => c.id);
    if (chapterIds.length === 0) { setScenes([]); return; }
    fetch(`/api/scenes?chapterIds=${chapterIds.join(',')}`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (!controller.signal.aborted) {
          setScenes(data);
        }
      }).catch(() => {});
  }, [selectedProject?.id]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wordCount = editorContent.split(/\s+/).filter(Boolean).length;

  const debouncedSave = useCallback((content: string, id: string, type: 'chapter' | 'scene') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const wc = content.split(/\s+/).filter(Boolean).length;
      setSaveStatus('saving');
      try {
        const endpoint = type === 'chapter' ? `/api/chapters/${id}` : `/api/scenes/${id}`;
        const body = type === 'chapter'
          ? JSON.stringify({ contentOriginal: content, wordCount: wc })
          : JSON.stringify({ content, wordCount: wc });
        const res = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
        if (res.ok) {
          savedTimeRef.current = new Date();
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch { setSaveStatus('idle'); }
    }, 2000);
  }, []);

  const handleEditorChange = (value: string) => {
    setEditorContent(value);
    if (writingMode === 'scene' && selectedScene) {
      debouncedSave(value, selectedScene.id, 'scene');
    } else if (selectedChapter) {
      debouncedSave(value, selectedChapter.id, 'chapter');
    }
  };

  const refreshProject = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects?id=${selectedProject.id}`);
      if (res.ok) {
        const data: Project[] = await res.json();
        const fresh = data.find((p) => p.id === selectedProject.id);
        if (fresh) setSelectedProject(fresh);
      }
    } catch { /* ignore */ }
  }, [selectedProject, setSelectedProject]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleAddChapter = async () => {
    if (!selectedProject) return;
    setIsAddingChapter(true);
    try {
      const maxNum = selectedProject.chapters.reduce((max, c) => Math.max(max, c.chapterNumber), 0);
      const res = await fetch('/api/chapters', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProject.id, chapterNumber: maxNum + 1, title: `Chapter ${maxNum + 1}` }),
      });
      if (res.ok) await refreshProject();
    } catch { /* ignore */ }
    finally { setIsAddingChapter(false); }
  };

  const handleAddScene = async (chapterId: string) => {
    if (!selectedProject) return;
    setIsAddingScene(true);
    try {
      const chapterScenes = scenes.filter((s) => s.chapterId === chapterId);
      const maxNum = chapterScenes.reduce((max, s) => Math.max(max, s.sceneNumber), 0);
      const res = await fetch('/api/scenes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, sceneNumber: maxNum + 1, title: `Scene ${maxNum + 1}` }),
      });
      if (res.ok) {
        const data = await res.json();
        setScenes([...scenes, data]);
      }
    } catch { /* ignore */ }
    finally { setIsAddingScene(false); }
  };

  const handleSaveTitle = async () => {
    if (!selectedChapter || !titleValue.trim()) return;
    try {
      await fetch(`/api/chapters/${selectedChapter.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleValue.trim() }),
      });
      if (selectedProject) {
        const updated = selectedProject.chapters.map((c) =>
          c.id === selectedChapter.id ? { ...c, title: titleValue.trim() } : c
        );
        setSelectedProject({ ...selectedProject, chapters: updated });
        setSelectedChapter({ ...selectedChapter, title: titleValue.trim() });
      }
    } catch { /* ignore */ }
    setEditingTitle(false);
  };

  const handleAiGenerate = async (preset?: string) => {
    if (!selectedProject || !selectedChapter) return;
    const promptText = preset || aiPrompt.trim();
    if (!promptText) return;
    setIsAiWriting(true);
    setAiSuggestion('');
    setWordLimitMsg('');
    try {
      const charactersDesc = selectedProject.characters.map((c) => `${c.name} (${c.role}): ${c.description}`).join('\n');
      const res = await fetch('/api/write', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id, chapterId: selectedChapter.id, prompt: promptText,
          context: {
            chapterContent: editorContent, plotOutline: selectedProject.plotOutline || '',
            characters: charactersDesc, styleGuide: selectedProject.styleGuide || '',
            projectTitle: selectedProject.title, genre: selectedProject.genre,
            sourceLanguage: selectedProject.sourceLanguage,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestion(data.content || '');
        if (data.remaining !== undefined) {
          setWordLimitMsg(`${data.remaining.toLocaleString()} words remaining today`);
        }
      } else if (res.status === 429) {
        const data = await res.json();
        setWordLimitMsg(`Daily limit reached (${(data.limit || 0).toLocaleString()} words). Upgrade to Pro for 10,000 words/day.`);
        setAiSuggestion('');
      } else setAiSuggestion('Error generating content.');
    } catch { setAiSuggestion('Error: Failed to connect.'); }
    finally { setIsAiWriting(false); }
  };

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    const newContent = editorContent ? `${editorContent}\n\n${aiSuggestion}` : aiSuggestion;
    setEditorContent(newContent);
    if (writingMode === 'scene' && selectedScene) {
      debouncedSave(newContent, selectedScene.id, 'scene');
    } else if (selectedChapter) {
      debouncedSave(newContent, selectedChapter.id, 'chapter');
    }
    setAiSuggestion('');
  };

  const handleApplyTemplate = async (templateId: string) => {
    setShowTemplatePicker(false);
    if (!selectedProject) return;
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;
    const chapterCount = templateId === 'blank' ? 5 :
      templateId === 'heros-journey' ? 12 :
      templateId === 'three-act' ? 9 : 10;
    try {
      const existing = selectedProject.chapters.length;
      for (let i = 0; i < chapterCount; i++) {
        const num = existing + i + 1;
        await fetch('/api/chapters', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: selectedProject.id, chapterNumber: num, title: `Chapter ${num}` }),
        });
      }
      await refreshProject();
    } catch { /* ignore */ }
  };

  if (!selectedProject) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080808' }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 text-center" style={{ maxWidth: 360 }}
        >
          <div className="flex size-16 items-center justify-center rounded-2xl" style={{ background: 'rgba(201,169,110,0.10)', border: '1px solid rgba(201,169,110,0.15)' }}>
            <PenTool className="size-8" style={{ color: '#C9A96E' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600, color: '#F5F5F7', margin: 0 }}>Select a Novel</h2>
          <p style={{ fontSize: 13, color: '#8E8E93', lineHeight: 1.5, margin: 0 }}>Choose a novel from your library to open the Writing Studio</p>
          <button onClick={() => router.push('/dashboard/novels')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A96E, #E8C98A)', color: '#1a0f00', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(201,169,110,0.25)' }}
          >Browse My Novels</button>
        </motion.div>
      </div>
    );
  }

  const project = selectedProject;
  const sortedChapters = [...project.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const totalProjectWords = project.chapters.reduce((sum, c) => sum + c.wordCount, 0);
  const projectProgress = project.wordTarget ? Math.min(100, Math.round((totalProjectWords / project.wordTarget) * 100)) : 0;

  const renderContent = () => {
    if (!selectedChapter) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full" style={{ background: 'rgba(200,135,58,0.1)' }}>
              <FileText className="size-8" style={{ color: '#C8873A' }} />
            </div>
            <h3 className="text-xl font-semibold" style={{ color: '#1a1a1a' }}>Select a chapter or scene</h3>
            <p className="max-w-sm text-sm" style={{ color: '#8E8E93' }}>Choose from the navigator on the left</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Editor header */}
        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fff', padding: '10px 24px' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {editingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input value={titleValue} onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                    className="h-8 text-base font-semibold" style={{ borderColor: 'rgba(200,135,58,0.3)' }}
                  />
                  <Button size="icon" variant="ghost" className="size-7" style={{ color: '#10B981' }} onClick={handleSaveTitle}><Check className="size-4" /></Button>
                  <Button size="icon" variant="ghost" className="size-7" style={{ color: '#8E8E93' }} onClick={() => setEditingTitle(false)}><X className="size-4" /></Button>
                </div>
              ) : (
                <button onClick={() => { setTitleValue(writingMode === 'scene' && selectedScene ? selectedScene.title : selectedChapter.title); setEditingTitle(true); }}
                  className="text-base font-semibold truncate hover:opacity-70 transition-opacity" style={{ color: '#1a1a1a' }}
                >{writingMode === 'scene' && selectedScene ? selectedScene.title : selectedChapter.title}</button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile nav/studio toggles */}
              <button onClick={() => setMobileNavOpen(true)} className="flex lg:hidden size-7 items-center justify-center rounded-md hover:bg-black/5" title="Chapters">
                <FolderTree className="size-3.5" />
              </button>
              <button onClick={() => setMobileStudioOpen(true)} className="flex lg:hidden size-7 items-center justify-center rounded-md hover:bg-black/5" title="Tools">
                <Sparkles className="size-3.5" />
              </button>
              {/* Mode selector */}
              <select value={writingMode} onChange={(e) => setWritingMode(e.target.value as 'chapter' | 'scene' | 'full' | 'focus')}
                className="h-7 rounded-md border text-xs px-2" style={{ borderColor: 'rgba(0,0,0,0.1)', background: '#f5f5f5', color: '#1a1a1a' }}
              >
                <option value="chapter">Chapter</option>
                <option value="scene">Scene</option>
                <option value="full">Full MS</option>
                <option value="focus">Focus</option>
              </select>

              <Badge variant="outline" className="text-xs font-mono" style={{ background: 'rgba(200,135,58,0.06)', borderColor: 'rgba(200,135,58,0.2)', color: '#C8873A' }}>
                {wordCount} words
              </Badge>

              <div className="flex items-center gap-1 text-xs" style={{ color: saveStatus === 'saved' ? '#10B981' : saveStatus === 'saving' ? '#C8873A' : '#8E8E93' }}>
                {saveStatus === 'saving' && <Loader2 className="size-3 animate-spin" />}
                {saveStatus === 'saved' && <Save className="size-3" />}
                {saveStatus === 'idle' && <span className="size-2 rounded-full" style={{ background: '#8E8E93' }} />}
              </div>

              {savedTimeRef.current && (
                <span className="text-[10px]" style={{ color: '#8E8E93' }}>{savedTimeRef.current.toLocaleTimeString()}</span>
              )}

              <Button size="sm" variant="ghost" className="size-7" onClick={() => setFullscreen(!fullscreen)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {fullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor textarea */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#faf8f5' }}>
          <div className="mx-auto max-w-full lg:max-w-3xl px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <textarea ref={textareaRef} value={editorContent}
              onChange={(e) => handleEditorChange(e.target.value)}
              className="w-full min-h-[60vh] resize-none border-0 bg-transparent leading-relaxed focus:outline-none text-base lg:text-[15px]"
              style={{ color: '#1a1a1a', lineHeight: 1.8, fontFamily: "'Georgia','Times New Roman',serif" }}
              placeholder="Start writing..."
            />
          </div>
        </div>

        {/* AI Suggestion */}
        <AnimatePresence>
          {aiSuggestion && !isAiWriting && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ borderLeft: '3px solid #C8873A', background: 'rgba(200,135,58,0.04)', borderTop: '1px solid rgba(0,0,0,0.06)' }}
              className="px-6 py-3"
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#1a1a1a' }}>{aiSuggestion}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={handleAcceptSuggestion} className="bg-amber hover:bg-amber/90 text-ink font-semibold"><Check className="size-3.5" /> Accept</Button>
                <Button size="sm" variant="outline" onClick={() => setAiSuggestion('')}><X className="size-3.5" /> Discard</Button>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(aiSuggestion); }} className="ml-auto"><CopyIcon className="size-3.5" /> Copy</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word limit message */}
        {wordLimitMsg && (
          <div className="flex items-center gap-2 px-6 py-1.5 text-[10px]" style={{ background: wordLimitMsg.includes('reached') ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.06)', color: wordLimitMsg.includes('reached') ? '#F87171' : '#34D399', borderTop: `1px solid ${wordLimitMsg.includes('reached') ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)'}` }}>
            <span className="size-1.5 rounded-full" style={{ background: wordLimitMsg.includes('reached') ? '#F87171' : '#34D399' }} />
            {wordLimitMsg}
          </div>
        )}

        {/* AI Input Bar */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fff', padding: '10px 24px' }}>
          <div className="flex gap-2 mb-2 flex-wrap">
            {aiPresets.slice(0, 4).map((preset) => {
              const Icon = preset.icon;
              return (
                <button key={preset.label} onClick={() => handleAiGenerate(preset.prompt)}
                  disabled={isAiWriting || !selectedChapter}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all disabled:opacity-40"
                  style={{ color: '#666', background: '#f5f5f5', border: '1px solid transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(200,135,58,0.3)'; e.currentTarget.style.color = '#C8873A'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#666'; }}
                ><Icon className="size-3" /> {preset.label}</button>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && aiPrompt.trim() && !isAiWriting) { e.preventDefault(); handleAiGenerate(); } }}
              placeholder="Ask AI to write, rewrite, or continue..."
              disabled={isAiWriting || !selectedChapter}
              className="border text-sm flex-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }}
            />
            <Button onClick={() => handleAiGenerate()} disabled={!aiPrompt.trim() || isAiWriting || !selectedChapter}
              className="bg-amber hover:bg-amber/90 text-ink font-semibold shrink-0 w-full sm:w-auto"
            >{isAiWriting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Generate</Button>
          </div>
        </div>
      </div>
    );
  };

  const renderNavigator = () => (
    <div className="flex h-full flex-col" style={{ background: '#1c1c1e', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Project header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
        <button onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 mb-3 text-[11px] font-medium transition-opacity hover:opacity-70"
          style={{ color: '#8E8E93' }}
        ><ArrowLeft className="size-3.5" /> Exit Writing Studio</button>
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 shrink-0" style={{ color: '#C8873A' }} />
          <span className="text-sm font-semibold truncate" style={{ color: '#F5F5F7' }}>{project.title}</span>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] mb-1" style={{ color: '#8E8E93' }}>
            <span>{totalProjectWords.toLocaleString()} / {project.wordTarget.toLocaleString()} words</span>
            <span>{projectProgress}%</span>
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${projectProgress}%`, background: 'linear-gradient(90deg, #C8873A, #E8C98A)', borderRadius: 2, transition: 'width .5s' }} />
          </div>
        </div>
      </div>

      {/* Chapter/scene list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {sortedChapters.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs" style={{ color: '#636366' }}>No chapters yet</p>
            </div>
          )}
          {sortedChapters.map((chapter, chIdx) => {
            const isSelected = selectedChapter?.id === chapter.id;
            const chScenes = scenes.filter((s) => s.chapterId === chapter.id).sort((a, b) => a.sceneNumber - b.sceneNumber);
            const expanded = chaptersExpanded[chapter.id] ?? true;
            const chStat = chapterStatusCfg[chapter.status] || chapterStatusCfg.idea;

            return (
              <div key={chapter.id}>
                <div className="flex items-center group">
                  <button onClick={() => setChaptersExpanded((prev) => ({ ...prev, [chapter.id]: !prev[chapter.id] }))}
                    className="p-1 shrink-0" style={{ color: '#636366' }}
                  >{expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}</button>
                  <button
                    onClick={() => { setSelectedChapter(chapter); setSelectedScene(null); setWritingMode('chapter'); setAiSuggestion(''); }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-all ${
                      isSelected && writingMode === 'chapter' ? 'bg-[#C8873A]/10' : 'hover:bg-white/5'
                    }`}
                    style={{ color: isSelected && writingMode === 'chapter' ? '#E8C98A' : '#aeaeb2' }}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md text-[10px] font-bold shrink-0"
                      style={{ background: isSelected && writingMode === 'chapter' ? '#C8873A' : 'rgba(255,255,255,0.08)', color: isSelected && writingMode === 'chapter' ? '#fff' : '#8E8E93' }}
                    >{chapter.chapterNumber}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium truncate">{chapter.title}</p>
                      <p className="text-[10px]" style={{ color: '#636366' }}>{chapter.wordCount}w</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border" style={{ background: chStat.cls.split(' ')[0], color: chStat.cls.split(' ')[1], borderColor: chStat.cls.split(' ')[2] || 'transparent', whiteSpace: 'nowrap' }}>{chStat.label}</span>
                  </button>
                </div>

                {/* Scenes */}
                <AnimatePresence>
                  {expanded && chScenes.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {chScenes.map((scene) => {
                        const isSceneSelected = selectedScene?.id === scene.id && writingMode === 'scene';
                        const scStat = sceneStatusCfg[scene.status] || sceneStatusCfg.idea;
                        return (
                          <button key={scene.id}
                            onClick={() => { setSelectedChapter(chapter); setSelectedScene(scene); setWritingMode('scene'); setAiSuggestion(''); }}
                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all ml-5 ${
                              isSceneSelected ? 'bg-white/10' : 'hover:bg-white/5'
                            }`}
                            style={{ color: isSceneSelected ? '#F5F5F7' : '#636366' }}
                          >
                            <CircleDot className="size-2.5 shrink-0" style={{ color: isSceneSelected ? '#C8873A' : '#48484a' }} />
                            <span className="text-[11px] truncate flex-1">{scene.title || `Scene ${scene.sceneNumber}`}</span>
                            <span className="text-[9px]" style={{ color: scStat.cls.split(' ')[1] || '#636366' }}>{scStat.label}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add scene button */}
                <button onClick={() => handleAddScene(chapter.id)} disabled={isAddingScene}
                  className="flex items-center gap-1.5 ml-8 px-2 py-2 lg:py-1 rounded text-[10px] transition-all w-full hover:bg-white/5 min-h-[36px] lg:min-h-0"
                  style={{ color: '#48484a' }}
                ><Plus className="size-2.5" /> Add scene</button>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Bottom actions */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px' }}>
        <div className="flex gap-2">
          <Button onClick={handleAddChapter} disabled={isAddingChapter} size="sm" className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold" style={{ fontSize: 11 }}>
            <Plus className="size-3.5" /> Chapter
          </Button>
          <Button onClick={() => setShowTemplatePicker(true)} size="sm" variant="outline" className="flex-1" style={{ fontSize: 11, borderColor: 'rgba(255,255,255,0.1)', color: '#aeaeb2' }}>
            <Layers className="size-3.5" /> Templates
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStudioPanel = () => {
    const tabs: { key: typeof studioTab; label: string; icon: React.ElementType }[] = [
      { key: 'ai', label: 'AI Assistant', icon: Sparkles },
      { key: 'bible', label: 'Story Bible', icon: BookMarked },
      { key: 'outline', label: 'Outline', icon: FolderTree },
      { key: 'characters', label: 'Characters', icon: Users },
      { key: 'notes', label: 'Notes', icon: ScrollText },
      { key: 'versions', label: 'Versions', icon: Undo2 },
      { key: 'export', label: 'Export', icon: Download },
    ];

    return (
      <div className="flex h-full flex-col" style={{ background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.06)' }}>
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-0.5 p-1.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = studioTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setStudioTab(tab.key)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all"
                style={{ background: active ? '#C8873A' : 'transparent', color: active ? '#fff' : '#666' }}
              ><Icon className="size-3" /> {tab.label}</button>
            );
          })}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            {/* AI Assistant Tab */}
            {studioTab === 'ai' && (
              <div>
                <p className="text-[11px] mb-2" style={{ color: '#8E8E93' }}>AI Writing Presets</p>
                <div className="space-y-1.5">
                  {aiPresets.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <button key={preset.label} onClick={() => handleAiGenerate(preset.prompt)}
                        disabled={isAiWriting || !selectedChapter}
                        className="flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-all disabled:opacity-40"
                        style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(200,135,58,0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; }}
                      >
                        <div className="flex size-8 items-center justify-center rounded-lg shrink-0" style={{ background: 'rgba(200,135,58,0.1)' }}>
                          <Icon className="size-4" style={{ color: '#C8873A' }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{preset.label}</p>
                          <p className="text-[10px]" style={{ color: '#8E8E93' }}>{preset.prompt.slice(0, 60)}...</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isAiWriting && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg p-3" style={{ background: 'rgba(200,135,58,0.06)', border: '1px solid rgba(200,135,58,0.15)' }}>
                    <Loader2 className="size-4 animate-spin" style={{ color: '#C8873A' }} />
                    <span className="text-xs" style={{ color: '#1a1a1a' }}>AI is writing...</span>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase mb-2" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>Project Context</p>
                  <div className="space-y-1.5 text-[11px]" style={{ color: '#666' }}>
                    <div className="flex justify-between"><span>Title</span><span className="font-medium" style={{ color: '#1a1a1a' }}>{project.title}</span></div>
                    <div className="flex justify-between"><span>Genre</span><span className="font-medium" style={{ color: '#1a1a1a' }}>{project.genre || 'Not set'}</span></div>
                    <div className="flex justify-between"><span>Language</span><span className="font-medium" style={{ color: '#1a1a1a' }}>{project.sourceLanguage} → {project.targetLanguage}</span></div>
                    <div className="flex justify-between"><span>Words</span><span className="font-medium" style={{ color: '#1a1a1a' }}>{totalProjectWords.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Story Bible Tab */}
            {studioTab === 'bible' && (
              <div>
                <div className="flex gap-1 mb-3">
                  {(['characters', 'locations', 'timeline', 'lore'] as const).map((tab) => (
                    <button key={tab} onClick={() => setBibleTab(tab)}
                      className="px-2.5 py-1 rounded-md text-[10px] font-medium capitalize transition-all"
                      style={{ background: bibleTab === tab ? '#C8873A' : '#f5f5f5', color: bibleTab === tab ? '#fff' : '#666' }}
                    >{tab}</button>
                  ))}
                  <button onClick={() => setShowBibleSearch(!showBibleSearch)} className="ml-auto p-1 rounded" style={{ color: '#8E8E93' }}>
                    <Search className="size-3.5" />
                  </button>
                </div>

                {showBibleSearch && (
                  <Input value={bibleSearch} onChange={(e) => setBibleSearch(e.target.value)}
                    placeholder="Search bible..." className="mb-2 text-xs" style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                  />
                )}

                {/* Characters */}
                {bibleTab === 'characters' && (
                  <div>
                    {project.characters.length === 0 ? (
                      <p className="text-xs" style={{ color: '#8E8E93' }}>No characters yet</p>
                    ) : (
                      <div className="space-y-2">
                        {project.characters.map((ch) => (
                          <div key={ch.id} className="rounded-lg p-3" style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{ch.name}</span>
                              <Badge variant="outline" className="text-[9px] capitalize">{ch.role}</Badge>
                            </div>
                            {ch.description && <p className="text-[11px]" style={{ color: '#666' }}>{ch.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Locations */}
                {bibleTab === 'locations' && (
                  <div>
                    <div className="space-y-2">
                      {locations.length === 0 && (
                        <p className="text-xs" style={{ color: '#8E8E93' }}>No locations yet</p>
                      )}
                      {locations.map((loc) => (
                        <div key={loc.id} className="rounded-lg p-3" style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{loc.name}</span>
                            <Badge variant="outline" className="text-[9px]" style={{ color: loc.importance === 'critical' ? '#C8873A' : '#666' }}>{loc.importance}</Badge>
                          </div>
                          {loc.description && <p className="text-[11px]" style={{ color: '#666' }}>{loc.description}</p>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-2">
                      <Input value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} placeholder="Location name" className="text-xs" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
                      <Input value={newLocationDesc} onChange={(e) => setNewLocationDesc(e.target.value)} placeholder="Description" className="text-xs" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
                      <Button size="sm" className="w-full text-xs bg-amber hover:bg-amber/90 text-ink" onClick={async () => {
                        if (!selectedProject || !newLocationName.trim()) return;
                        try {
                          await fetch('/api/locations', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projectId: selectedProject.id, name: newLocationName, description: newLocationDesc }),
                          });
                          setNewLocationName('');
                          setNewLocationDesc('');
                          const res = await fetch(`/api/locations?projectId=${selectedProject.id}`);
                          if (res.ok) setLocations(await res.json());
                        } catch { /* ignore */ }
                      }}>Add Location</Button>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {bibleTab === 'timeline' && (
                  <div>
                    <div className="space-y-2">
                      {timelineEvents.length === 0 && (
                        <p className="text-xs" style={{ color: '#8E8E93' }}>No timeline events yet</p>
                      )}
                      {timelineEvents.map((ev) => (
                        <div key={ev.id} className="rounded-lg p-3" style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{ev.title}</span>
                          {ev.description && <p className="text-[11px] mt-0.5" style={{ color: '#666' }}>{ev.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Worldbuilding / Lore */}
                {bibleTab === 'lore' && (
                  <div>
                    <div className="space-y-2">
                      {storyNotes.filter((n) => n.category === 'worldbuilding').length === 0 && (
                        <p className="text-xs" style={{ color: '#8E8E93' }}>No worldbuilding notes yet</p>
                      )}
                      {storyNotes.filter((n) => n.category === 'worldbuilding').map((note) => (
                        <div key={note.id} className="rounded-lg p-3" style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{note.title}</span>
                          <p className="text-[11px] mt-0.5" style={{ color: '#666' }}>{note.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-2">
                      <Input value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="Note title" className="text-xs" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
                      <Input value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Note content" className="text-xs" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
                      <Button size="sm" className="w-full text-xs bg-amber hover:bg-amber/90 text-ink" onClick={async () => {
                        if (!selectedProject || !newNoteTitle.trim()) return;
                        try {
                          await fetch('/api/story-notes', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projectId: selectedProject.id, title: newNoteTitle, content: newNoteContent, category: 'worldbuilding' }),
                          });
                          setNewNoteTitle('');
                          setNewNoteContent('');
                          const res = await fetch(`/api/story-notes?projectId=${selectedProject.id}`);
                          if (res.ok) setStoryNotes(await res.json());
                        } catch { /* ignore */ }
                      }}>Add Note</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Outline Tab */}
            {studioTab === 'outline' && (
              <div>
                {/* Scene Metadata (when scene selected) */}
                {writingMode === 'scene' && selectedScene && (
                  <div className="mb-4 p-3 rounded-lg" style={{ background: '#faf6f0', border: '1px solid rgba(200,135,58,0.15)' }}>
                    <p className="text-[10px] font-semibold uppercase mb-2" style={{ color: '#C8873A', letterSpacing: '0.05em' }}>Scene Info</p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider" style={{ color: '#8E8E93' }}>Goal</label>
                        <input value={selectedScene.goal || ''} onChange={(e) => {
                          const value = e.target.value;
                          const updated = { ...selectedScene, goal: value };
                          setSelectedScene(updated);
                          if (goalTimeoutRef.current) clearTimeout(goalTimeoutRef.current);
                          const sceneId = selectedScene.id;
                          goalTimeoutRef.current = setTimeout(async () => {
                            await fetch(`/api/scenes/${sceneId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goal: value }) });
                          }, 500);
                        }} placeholder="What does this scene achieve?" className="w-full text-xs mt-0.5 p-1.5 rounded border" style={{ borderColor: 'rgba(0,0,0,0.1)', background: '#fff', color: '#1a1a1a', outline: 'none' }} />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider" style={{ color: '#8E8E93' }}>Conflict</label>
                        <input value={selectedScene.conflict || ''} onChange={(e) => {
                          const value = e.target.value;
                          const updated = { ...selectedScene, conflict: value };
                          setSelectedScene(updated);
                          if (conflictTimeoutRef.current) clearTimeout(conflictTimeoutRef.current);
                          const sceneId = selectedScene.id;
                          conflictTimeoutRef.current = setTimeout(async () => {
                            await fetch(`/api/scenes/${sceneId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conflict: value }) });
                          }, 500);
                        }} placeholder="What opposes the goal?" className="w-full text-xs mt-0.5 p-1.5 rounded border" style={{ borderColor: 'rgba(0,0,0,0.1)', background: '#fff', color: '#1a1a1a', outline: 'none' }} />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider" style={{ color: '#8E8E93' }}>Outcome</label>
                        <input value={selectedScene.outcome || ''} onChange={(e) => {
                          const value = e.target.value;
                          const updated = { ...selectedScene, outcome: value };
                          setSelectedScene(updated);
                          if (outcomeTimeoutRef.current) clearTimeout(outcomeTimeoutRef.current);
                          const sceneId = selectedScene.id;
                          outcomeTimeoutRef.current = setTimeout(async () => {
                            await fetch(`/api/scenes/${sceneId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outcome: value }) });
                          }, 500);
                        }} placeholder="How does it end?" className="w-full text-xs mt-0.5 p-1.5 rounded border" style={{ borderColor: 'rgba(0,0,0,0.1)', background: '#fff', color: '#1a1a1a', outline: 'none' }} />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider" style={{ color: '#8E8E93' }}>POV Character</label>
                        <select value={selectedScene.povCharacterId || ''} onChange={async (e) => {
                          const updated = { ...selectedScene, povCharacterId: e.target.value || null };
                          setSelectedScene(updated);
                          await fetch(`/api/scenes/${selectedScene.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ povCharacterId: e.target.value || null }) });
                        }} className="w-full text-xs mt-0.5 p-1.5 rounded border" style={{ borderColor: 'rgba(0,0,0,0.1)', background: '#fff', color: '#1a1a1a', outline: 'none' }}>
                          <option value="">No POV</option>
                          {project.characters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        {['idea', 'drafting', 'revised', 'edited', 'locked'].map(s => (
                          <button key={s} onClick={async () => {
                            const updated = { ...selectedScene, status: s };
                            setSelectedScene(updated);
                            await fetch(`/api/scenes/${selectedScene.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }) });
                          }}
                            style={{ flex: 1, padding: '3px 0', borderRadius: 4, fontSize: 8, fontWeight: 500, border: 'none', background: selectedScene.status === s ? '#C8873A' : 'rgba(0,0,0,0.05)', color: selectedScene.status === s ? '#fff' : '#666', cursor: 'pointer' }}
                          >{s.slice(0, 3)}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[11px] font-medium mb-2" style={{ color: '#1a1a1a' }}>Plot Outline</p>
                {project.plotOutline ? (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: '#666' }}>{project.plotOutline}</p>
                ) : (
                  <p className="text-xs" style={{ color: '#8E8E93' }}>No outline set. Add one in project settings.</p>
                )}
                {project.styleGuide && (
                  <div className="mt-4">
                    <p className="text-[11px] font-medium mb-2" style={{ color: '#1a1a1a' }}>Style Guide</p>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: '#666' }}>{project.styleGuide}</p>
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-[11px] font-medium mb-2" style={{ color: '#1a1a1a' }}>Chapter Progress</p>
                  <div className="space-y-1.5">
                    {sortedChapters.map((ch) => (
                      <div key={ch.id} className="flex items-center gap-2 text-[11px]" style={{ color: '#666' }}>
                        <span className="font-medium" style={{ color: '#1a1a1a', minWidth: 20 }}>{ch.chapterNumber}.</span>
                        <span className="truncate flex-1">{ch.title}</span>
                        <span style={{ color: '#8E8E93' }}>{ch.wordCount}w</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Characters Tab */}
            {studioTab === 'characters' && (
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: '#1a1a1a' }}>Character Bible</p>
                {project.characters.length === 0 ? (
                  <p className="text-xs" style={{ color: '#8E8E93' }}>No characters yet</p>
                ) : (
                  <div className="space-y-2">
                    {project.characters.map((ch) => (
                      <div key={ch.id} className="rounded-lg p-3" style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{ch.name}</span>
                          <Badge variant="outline" className="text-[9px] capitalize">{ch.role}</Badge>
                        </div>
                        {ch.description && <p className="text-[11px]" style={{ color: '#666' }}>{ch.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {studioTab === 'notes' && (
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: '#1a1a1a' }}>Story Notes</p>
                {storyNotes.length === 0 ? (
                  <p className="text-xs" style={{ color: '#8E8E93' }}>No notes yet</p>
                ) : (
                  <div className="space-y-2">
                    {storyNotes.map((note) => (
                      <div key={note.id} className="rounded-lg p-3" style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{note.title}</span>
                          <Badge variant="outline" className="text-[9px]">{note.category}</Badge>
                        </div>
                        <p className="text-[11px]" style={{ color: '#666' }}>{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Versions Tab */}
            {studioTab === 'versions' && (
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: '#1a1a1a' }}>Version History</p>
                {versions.length === 0 ? (
                  <p className="text-xs" style={{ color: '#8E8E93' }}>No snapshots saved yet</p>
                ) : (
                  <div className="space-y-2">
                    {versions.map((v) => (
                      <div key={v.id} className="rounded-lg p-3" style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <p className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{v.label || 'Snapshot'}</p>
                        <p className="text-[10px]" style={{ color: '#8E8E93' }}>{new Date(v.createdAt).toLocaleString()} · {v.wordCount} words</p>
                      </div>
                    ))}
                  </div>
                )}
                <Button size="sm" className="w-full mt-2 text-xs bg-amber hover:bg-amber/90 text-ink"
                  onClick={async () => {
                    if (!selectedProject || !selectedChapter) return;
                    await fetch('/api/versions', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        projectId: selectedProject.id, chapterId: selectedChapter.id,
                        content: editorContent, wordCount, label: `v${versions.length + 1}`,
                      }),
                    });
                  }}
                ><Save className="size-3" /> Save Snapshot</Button>
              </div>
            )}

            {/* Export Tab */}
            {studioTab === 'export' && (
              <div>
                <p className="text-[11px] font-medium mb-3" style={{ color: '#1a1a1a' }}>Export Options</p>
                <div className="space-y-2">
                  {[
                    { icon: BookOpen, label: 'EPUB', desc: 'Standard ebook format', path: 'publishing' },
                    { icon: FileText, label: 'PDF', desc: 'Print-ready document', path: 'publishing' },
                    { icon: Download, label: 'DOCX', desc: 'Microsoft Word format', path: 'publishing' },
                    { icon: Globe, label: 'Google Docs', desc: 'Send to Google Drive', path: undefined },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const goPath = 'path' in opt ? (opt as any).path : null;
                    return (
                      <button key={opt.label}
                        onClick={() => { if (goPath && selectedProject) { router.push(`/dashboard/${goPath}/${selectedProject.id}`); } }}
                        className="flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-all"
                        style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }}
                      >
                        <div className="flex size-8 items-center justify-center rounded-lg shrink-0" style={{ background: 'rgba(200,135,58,0.1)' }}>
                          <Icon className="size-4" style={{ color: '#C8873A' }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{opt.label}</p>
                          <p className="text-[10px]" style={{ color: '#8E8E93' }}>{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(200,135,58,0.04)', border: '1px solid rgba(200,135,58,0.1)' }}>
                  <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#C8873A', letterSpacing: '0.05em' }}>KDP Ready</p>
                  <p className="text-[11px]" style={{ color: '#666' }}>Your manuscript is formatted for Amazon KDP requirements. Use the Export page for more options.</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50' : ''} flex h-screen`} style={{ background: '#f5f0eb' }}>
      {/* Navigator - Desktop */}
      <div className="hidden lg:flex" style={{ width: 260, flexShrink: 0 }}>{renderNavigator()}</div>

      {/* Navigator - Mobile Sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-[300px]" style={{ background: '#1c1c1e', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {renderNavigator()}
        </SheetContent>
      </Sheet>

      {/* Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">{renderContent()}</div>

      {/* Studio Panel - Desktop */}
      <div className="hidden lg:flex" style={{ width: 320, flexShrink: 0 }}>{renderStudioPanel()}</div>

      {/* Studio Panel - Mobile Sheet */}
      <Sheet open={mobileStudioOpen} onOpenChange={setMobileStudioOpen}>
        <SheetContent side="right" className="p-0 w-[320px]" style={{ background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.06)' }}>
          {renderStudioPanel()}
        </SheetContent>
      </Sheet>

      {/* Template Picker Modal */}
      <AnimatePresence>
        {showTemplatePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="rounded-xl p-6 w-full max-w-lg" style={{ background: '#fff' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>Novel Templates</h2>
                <button onClick={() => setShowTemplatePicker(false)} className="p-1 rounded hover:bg-gray-100"><X className="size-4" /></button>
              </div>
              <p className="text-sm mb-4" style={{ color: '#666' }}>Choose a template to generate your novel structure</p>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => (
                  <button key={t.id} onClick={() => handleApplyTemplate(t.id)}
                    className="p-3 rounded-lg text-left transition-all border"
                    style={{ borderColor: 'rgba(0,0,0,0.08)', background: '#fafafa' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(200,135,58,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}
                  >
                    <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{t.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#C8873A' }}>{t.genre}</p>
                    <p className="text-[10px]" style={{ color: '#8E8E93' }}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3.5" y="3.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5V3.5A1.5 1.5 0 009 2H4.5A1.5 1.5 0 003 3.5V8a1.5 1.5 0 001.5 1.5H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
