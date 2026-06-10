'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool, Plus, BookOpen, FileText, Sparkles, Check, X, Save, Loader2,
  GripVertical, PanelRightOpen, PanelRightClose, Maximize2, Minimize2,
  ScrollText, Users, Undo2, Wand2, TextSelect, MessageSquarePlus,
} from 'lucide-react';
import { useNovelifyStore, type Project, type Chapter } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';

const chapterStatusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  reviewed: { label: 'Reviewed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  locked: { label: 'Locked', className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const aiPresets = [
  { label: 'Continue Scene', icon: MessageSquarePlus, prompt: 'Continue writing the current scene naturally, maintaining the same voice and pacing.' },
  { label: 'Suggest Next', icon: TextSelect, prompt: 'Suggest what could happen next in the story. Write 2-3 sentences.' },
  { label: 'Fix Prose', icon: Wand2, prompt: 'Fix the prose in this section. Improve flow, fix awkward phrasing, and polish the language while preserving the voice.' },
];

export function WritingStudio() {
  const {
    selectedProject, setSelectedProject, setCurrentView,
    selectedChapter, setSelectedChapter, isAiWriting, setIsAiWriting,
  } = useNovelifyStore();

  const [editorContent, setEditorContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiMode, setAiMode] = useState<'continue' | 'suggest' | 'fix' | 'custom'>('custom');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<{ time: Date; wordCount: number }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const savedTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (selectedChapter) {
      setEditorContent(selectedChapter.contentOriginal || '');
    } else {
      setEditorContent('');
    }
    setSaveStatus('idle');
    setAiSuggestion('');
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [selectedChapter]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback((content: string, chapterId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSaveStatus('idle');
    timeoutRef.current = setTimeout(async () => {
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/chapters/${chapterId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentOriginal: content, wordCount }),
        });
        if (res.ok) {
          const now = new Date();
          savedTimeRef.current = now;
          setSaveStatus('saved');
          setVersionHistory((prev) => [...prev.slice(-9), { time: now, wordCount }]);
          if (selectedProject) {
            const updatedChapters = selectedProject.chapters.map((c) =>
              c.id === chapterId
                ? { ...c, contentOriginal: content, wordCount, updatedAt: now.toISOString() }
                : c
            );
            setSelectedProject({ ...selectedProject, chapters: updatedChapters });
            if (selectedChapter && selectedChapter.id === chapterId) {
              setSelectedChapter({ ...selectedChapter, contentOriginal: content, wordCount, updatedAt: now.toISOString() });
            }
          }
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        console.error('Failed to save:', error);
        setSaveStatus('idle');
      }
    }, 2000);
  }, [selectedProject, selectedChapter, setSelectedProject, setSelectedChapter]);

  const handleEditorChange = (value: string) => {
    setEditorContent(value);
    if (selectedChapter) debouncedSave(value, selectedChapter.id);
  };

  const currentWordCount = editorContent.split(/\s+/).filter(Boolean).length;

  const refreshProject = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data: Project[] = await res.json();
        const fresh = data.find((p) => p.id === selectedProject.id);
        if (fresh) setSelectedProject(fresh);
      }
    } catch (error) {
      console.error('Failed to refresh project:', error);
    }
  }, [selectedProject, setSelectedProject]);

  const handleAddChapter = async () => {
    if (!selectedProject) return;
    setIsAddingChapter(true);
    try {
      const maxNum = selectedProject.chapters.reduce((max, c) => Math.max(max, c.chapterNumber), 0);
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProject.id, chapterNumber: maxNum + 1, title: `Chapter ${maxNum + 1}` }),
      });
      if (res.ok) await refreshProject();
    } catch (error) {
      console.error('Failed to add chapter:', error);
    } finally {
      setIsAddingChapter(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!selectedChapter || !titleValue.trim()) return;
    try {
      await fetch(`/api/chapters/${selectedChapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleValue.trim() }),
      });
      if (selectedProject) {
        const updatedChapters = selectedProject.chapters.map((c) =>
          c.id === selectedChapter.id ? { ...c, title: titleValue.trim() } : c
        );
        setSelectedProject({ ...selectedProject, chapters: updatedChapters });
        setSelectedChapter({ ...selectedChapter, title: titleValue.trim() });
      }
    } catch (error) {
      console.error('Failed to save title:', error);
    }
    setEditingTitle(false);
  };

  const handleAiGenerate = async (preset?: string) => {
    if (!selectedProject || !selectedChapter) return;
    const promptText = preset || aiPrompt.trim();
    if (!promptText) return;

    setIsAiWriting(true);
    setAiSuggestion('');
    setAiPrompt('');

    try {
      const charactersDesc = selectedProject.characters
        .map((c) => `${c.name} (${c.role}): ${c.description}`).join('\n');

      const res = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          chapterId: selectedChapter.id,
          prompt: promptText,
          context: {
            chapterContent: editorContent,
            plotOutline: selectedProject.plotOutline || '',
            characters: charactersDesc,
            styleGuide: selectedProject.styleGuide || '',
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestion(data.content || '');
      } else {
        setAiSuggestion('Error generating content. Please try again.');
      }
    } catch {
      setAiSuggestion('Error: Failed to connect. Please try again.');
    } finally {
      setIsAiWriting(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    const newContent = editorContent ? `${editorContent}\n\n${aiSuggestion}` : aiSuggestion;
    setEditorContent(newContent);
    if (selectedChapter) debouncedSave(newContent, selectedChapter.id);
    setAiSuggestion('');
  };

  const handleDragStart = (index: number) => {
    const chapter = sortedChapters[index];
    if (chapter) setSelectedChapter(chapter);
  };

  const handleDrop = (fromIndex: number, toIndex: number) => {
    if (!selectedProject) return;
    const reordered = [...sortedChapters];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const updated = reordered.map((ch, i) => ({ ...ch, chapterNumber: i + 1 }));
    setSelectedProject({ ...selectedProject, chapters: updated });
    if (selectedChapter) {
      const stillSelected = updated.find((c) => c.id === selectedChapter.id);
      if (stillSelected) setSelectedChapter(stillSelected);
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="flex size-20 items-center justify-center rounded-full bg-amber/10">
            <PenTool className="size-10 text-amber" />
          </div>
          <h2 className="text-2xl font-bold text-ink">Select a project first</h2>
          <p className="max-w-sm text-muted-foreground">Choose a project from the dashboard to start writing</p>
          <Button onClick={() => setCurrentView('dashboard')}
            className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md"
          >Go to Dashboard</Button>
        </motion.div>
      </div>
    );
  }

  const project = selectedProject;
  const sortedChapters = [...project.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50' : ''} min-h-screen bg-paper`}>
      <ResizablePanelGroup direction="horizontal" className={fullscreen ? 'h-screen' : 'min-h-screen'}>
        {/* Chapter List */}
        <ResizablePanel defaultSize={20} minSize={12} maxSize={30}>
          <div className="flex h-full flex-col border-r border-border/50 bg-white">
            <div className="border-b border-border/50 p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="size-5 text-amber" />
                <h2 className="font-semibold text-ink truncate">{project.title}</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{sortedChapters.length} chapter{sortedChapters.length !== 1 ? 's' : ''}</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                <AnimatePresence>
                  {sortedChapters.map((chapter, idx) => {
                    const isSelected = selectedChapter?.id === chapter.id;
                    const chapStatus = chapterStatusConfig[chapter.status] || chapterStatusConfig.draft;
                    return (
                      <div key={chapter.id} className="flex items-center group">
                        <button
                          onMouseDown={() => handleDragStart(idx)}
                          className="p-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-ink transition-all shrink-0"
                          title="Drag to reorder"
                        >
                          <GripVertical className="size-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedChapter(chapter); setAiSuggestion(''); }}
                          className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-all ${
                            isSelected ? 'bg-amber/10 text-amber border border-amber/20' : 'text-ink hover:bg-muted/50 border border-transparent'
                          }`}
                        >
                          <div className={`flex size-7 items-center justify-center rounded-md text-xs font-bold shrink-0 ${
                            isSelected ? 'bg-amber text-white' : 'bg-muted text-muted-foreground'
                          }`}>{chapter.chapterNumber}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{chapter.title}</p>
                            <p className="text-xs text-muted-foreground">{chapter.wordCount} words</p>
                          </div>
                          <Badge variant="outline" className={`text-[10px] shrink-0 px-1 py-0 ${chapStatus.className}`}>
                            {chapStatus.label}
                          </Badge>
                        </button>
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <div className="border-t border-border/50 p-3 space-y-2">
              <div className="flex gap-2">
                <Button onClick={handleAddChapter} disabled={isAddingChapter} size="sm" className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold">
                  <Plus className="size-4" /> {isAddingChapter ? 'Adding...' : 'Add Chapter'}
                </Button>
                <Button onClick={() => setNotesOpen(!notesOpen)} size="sm" variant="outline"
                  className="border-amber/30 text-amber hover:bg-amber/10"
                  title={notesOpen ? 'Close notes' : 'Open notes'}
                >
                  {notesOpen ? <PanelRightClose className="size-4" /> : <Users className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Editor */}
        <ResizablePanel defaultSize={notesOpen ? 55 : 80} minSize={40}>
          <div className="flex h-full flex-col bg-paper">
            {!selectedChapter ? (
              <div className="flex flex-1 items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-amber/10">
                    <FileText className="size-8 text-amber" />
                  </div>
                  <h3 className="text-xl font-semibold text-ink">Select a chapter to start writing</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">Choose a chapter from the sidebar or create a new one</p>
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-border/50 bg-white px-6 py-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {editingTitle ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input ref={titleInputRef} value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                            className="h-8 text-lg font-semibold border-amber/30"
                          />
                          <Button size="icon" variant="ghost" className="size-7 text-emerald-600" onClick={handleSaveTitle}><Check className="size-4" /></Button>
                          <Button size="icon" variant="ghost" className="size-7 text-muted-foreground" onClick={() => setEditingTitle(false)}><X className="size-4" /></Button>
                        </div>
                      ) : (
                        <button onClick={() => { setTitleValue(selectedChapter.title); setEditingTitle(true); }}
                          className="text-lg font-semibold text-ink hover:text-amber transition-colors truncate"
                        >{selectedChapter.title}</button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="ghost" className="size-8" onClick={() => setFullscreen(!fullscreen)}
                        title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                      >
                        {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                      </Button>

                      <Badge variant="outline" className={`text-xs ${(chapterStatusConfig[selectedChapter.status] || chapterStatusConfig.draft).className}`}>
                        {(chapterStatusConfig[selectedChapter.status] || chapterStatusConfig.draft).label}
                      </Badge>

                      <span className="text-xs text-muted-foreground font-mono tabular-nums">{currentWordCount} words</span>

                      <div className="flex items-center">
                        {saveStatus === 'saving' && <Loader2 className="size-3 animate-spin text-amber" />}
                        {saveStatus === 'saved' && <Save className="size-3 text-emerald-500" />}
                        {saveStatus === 'idle' && <span className="size-3 rounded-full bg-muted-foreground/30" />}
                      </div>

                      {versionHistory.length > 0 && (
                        <span className="text-[10px] text-muted-foreground" title={`Last saved: ${versionHistory[versionHistory.length - 1].time.toLocaleTimeString()}`}>
                          <Undo2 className="size-3 inline mr-0.5" />{versionHistory.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Editor + AI Panel */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1">
                    <div className="mx-auto max-w-3xl px-6 py-6">
                      <textarea ref={textareaRef} value={editorContent}
                        onChange={(e) => handleEditorChange(e.target.value)}
                        className="w-full font-mono text-sm leading-relaxed min-h-[500px] resize-none border-0 bg-transparent text-ink placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0"
                        placeholder="Start writing your chapter here..."
                      />
                    </div>
                  </ScrollArea>

                  {/* AI Co-Pilot Panel */}
                  <div className="border-t border-border/50 bg-white">
                    <div className="mx-auto max-w-3xl px-6 py-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="size-4 text-amber" />
                        <span className="text-sm font-semibold text-ink">AI Co-Pilot</span>
                        <div className="flex gap-1 ml-2">
                          {aiPresets.map((preset) => {
                            const Icon = preset.icon;
                            return (
                              <button key={preset.label}
                                onClick={() => handleAiGenerate(preset.prompt)}
                                disabled={isAiWriting || !selectedChapter}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-ink hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all disabled:opacity-40"
                              >
                                <Icon className="size-3" />
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && aiPrompt.trim() && !isAiWriting) {
                              e.preventDefault(); handleAiGenerate();
                            }
                          }}
                          placeholder="Ask AI to write, rewrite, or continue..."
                          disabled={isAiWriting || !selectedChapter}
                          className="border-border/50 focus:border-amber/50 focus:ring-amber/20"
                        />
                        <Button onClick={() => handleAiGenerate()} disabled={!aiPrompt.trim() || isAiWriting || !selectedChapter}
                          className="bg-amber hover:bg-amber/90 text-ink font-semibold shrink-0"
                        >
                          {isAiWriting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                          {isAiWriting ? 'Writing...' : 'Generate'}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {isAiWriting && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-3 flex items-center gap-3 rounded-lg border border-amber/20 bg-amber/5 p-3"
                          >
                            <div className="ai-writing-indicator flex size-8 items-center justify-center rounded-full bg-amber/10">
                              <Sparkles className="size-4 text-amber" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-ink">AI is writing...</p>
                              <p className="text-xs text-muted-foreground">Generating based on your request</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {aiSuggestion && !isAiWriting && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-3 rounded-lg border-l-4 border-l-amber border border-border/50 bg-amber/5 p-4"
                          >
                            <h4 className="text-sm font-semibold text-ink flex items-center gap-2 mb-2">
                              <Sparkles className="size-3.5 text-amber" /> AI Suggestion
                            </h4>
                            <p className="text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">{aiSuggestion}</p>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" onClick={handleAcceptSuggestion}
                                className="bg-amber hover:bg-amber/90 text-ink font-semibold"
                              ><Check className="size-3.5" /> Accept</Button>
                              <Button size="sm" variant="outline" onClick={() => setAiSuggestion('')}
                                className="border-border/50 text-muted-foreground hover:text-ink"
                              ><X className="size-3.5" /> Discard</Button>
                              <Button size="sm" variant="outline" onClick={() => handleAiGenerate(aiPresets[2].prompt)}
                                className="border-border/50 text-muted-foreground hover:text-ink ml-auto"
                              ><Wand2 className="size-3.5" /> Polish</Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>

        {/* Notes Sidebar */}
        {notesOpen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={18} maxSize={35}>
              <div className="flex h-full flex-col bg-white border-l border-border/50">
                <div className="border-b border-border/50 p-4">
                  <div className="flex items-center gap-2">
                    <ScrollText className="size-5 text-amber" />
                    <h2 className="font-semibold text-ink">Notes & Characters</h2>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-6">
                    {/* Plot Outline */}
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Plot Outline</h3>
                      {project.plotOutline ? (
                        <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{project.plotOutline}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No outline set</p>
                      )}
                    </div>

                    <Separator />

                    {/* Style Guide */}
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Style Guide</h3>
                      {project.styleGuide ? (
                        <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{project.styleGuide}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No style guide</p>
                      )}
                    </div>

                    <Separator />

                    {/* Characters */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="size-4 text-amber" />
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Characters</h3>
                        <span className="text-xs text-muted-foreground">({project.characters.length})</span>
                      </div>
                      {project.characters.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No characters yet</p>
                      ) : (
                        <div className="space-y-3">
                          {project.characters.map((ch) => (
                            <div key={ch.id} className="rounded-lg border border-border/50 p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-ink">{ch.name}</span>
                                <Badge variant="outline" className="text-[10px] capitalize">{ch.role}</Badge>
                              </div>
                              {ch.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{ch.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Chapter Stats */}
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Chapter Info</h3>
                      {selectedChapter && (
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex justify-between"><span>Words</span><span className="text-ink font-medium">{currentWordCount}</span></div>
                          <div className="flex justify-between"><span>Status</span><Badge variant="outline" className="text-[10px]">{(chapterStatusConfig[selectedChapter.status] || chapterStatusConfig.draft).label}</Badge></div>
                          {savedTimeRef.current && (
                            <div className="flex justify-between"><span>Last saved</span><span className="text-ink">{savedTimeRef.current.toLocaleTimeString()}</span></div>
                          )}
                          {versionHistory.length > 0 && (
                            <div className="flex justify-between"><span>Versions</span><span className="text-ink">{versionHistory.length}</span></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
