'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Plus,
  BookOpen,
  FileText,
  Sparkles,
  Check,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { useNovelifyStore, type Project, type Chapter } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';

// Status badge color mapping
const chapterStatusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  reviewed: { label: 'Reviewed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  locked: { label: 'Locked', className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export function WritingStudio() {
  const {
    selectedProject,
    setSelectedProject,
    setCurrentView,
    selectedChapter,
    setSelectedChapter,
    isAiWriting,
    setIsAiWriting,
  } = useNovelifyStore();

  const [editorContent, setEditorContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync editor content with selected chapter
  useEffect(() => {
    if (selectedChapter) {
      setEditorContent(selectedChapter.contentOriginal || '');
    } else {
      setEditorContent('');
    }
    setSaveStatus('idle');
    setAiSuggestion('');
  }, [selectedChapter]);

  // Focus title input when editing
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  // Debounced auto-save
  const debouncedSave = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (content: string, chapterId: string) => {
      clearTimeout(timeout);
      setSaveStatus('idle');
      timeout = setTimeout(async () => {
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        setSaveStatus('saving');
        try {
          const res = await fetch(`/api/chapters/${chapterId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentOriginal: content, wordCount }),
          });
          if (res.ok) {
            setSaveStatus('saved');
            // Update the chapter in selectedProject
            if (selectedProject) {
              const updatedChapters = selectedProject.chapters.map((c) =>
                c.id === chapterId
                  ? { ...c, contentOriginal: content, wordCount, updatedAt: new Date().toISOString() }
                  : c
              );
              setSelectedProject({ ...selectedProject, chapters: updatedChapters });
              // Update selectedChapter too
              if (selectedChapter && selectedChapter.id === chapterId) {
                setSelectedChapter({
                  ...selectedChapter,
                  contentOriginal: content,
                  wordCount,
                  updatedAt: new Date().toISOString(),
                });
              }
            }
            // Clear saved indicator after a moment
            setTimeout(() => setSaveStatus('idle'), 2000);
          }
        } catch (error) {
          console.error('Failed to save:', error);
          setSaveStatus('idle');
        }
      }, 2000);
    };
  }, [selectedProject, selectedChapter, setSelectedProject, setSelectedChapter]);

  // Handle editor change
  const handleEditorChange = (value: string) => {
    setEditorContent(value);
    if (selectedChapter) {
      debouncedSave(value, selectedChapter.id);
    }
  };

  // Count words
  const currentWordCount = editorContent.split(/\s+/).filter(Boolean).length;

  // Refresh project data
  const refreshProject = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data: Project[] = await res.json();
        const fresh = data.find((p) => p.id === selectedProject.id);
        if (fresh) {
          setSelectedProject(fresh);
        }
      }
    } catch (error) {
      console.error('Failed to refresh project:', error);
    }
  }, [selectedProject, setSelectedProject]);

  // Add chapter
  const handleAddChapter = async () => {
    if (!selectedProject) return;
    setIsAddingChapter(true);
    try {
      const maxNum = selectedProject.chapters.reduce(
        (max, c) => Math.max(max, c.chapterNumber),
        0
      );
      const nextNum = maxNum + 1;
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          chapterNumber: nextNum,
          title: `Chapter ${nextNum}`,
        }),
      });
      if (res.ok) {
        await refreshProject();
      }
    } catch (error) {
      console.error('Failed to add chapter:', error);
    } finally {
      setIsAddingChapter(false);
    }
  };

  // Save chapter title
  const handleSaveTitle = async () => {
    if (!selectedChapter || !titleValue.trim()) return;
    try {
      const res = await fetch(`/api/chapters/${selectedChapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleValue.trim() }),
      });
      if (res.ok) {
        // Update locally
        if (selectedProject) {
          const updatedChapters = selectedProject.chapters.map((c) =>
            c.id === selectedChapter.id ? { ...c, title: titleValue.trim() } : c
          );
          setSelectedProject({ ...selectedProject, chapters: updatedChapters });
          setSelectedChapter({ ...selectedChapter, title: titleValue.trim() });
        }
      }
    } catch (error) {
      console.error('Failed to save title:', error);
    }
    setEditingTitle(false);
  };

  // AI Writing
  const handleAiGenerate = async () => {
    if (!selectedProject || !selectedChapter || !aiPrompt.trim()) return;
    setIsAiWriting(true);
    setAiSuggestion('');
    try {
      const charactersDesc = selectedProject.characters
        .map((c) => `${c.name} (${c.role}): ${c.description}`)
        .join('\n');

      const res = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          chapterId: selectedChapter.id,
          prompt: aiPrompt.trim(),
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
        setAiSuggestion(data.content || data.text || '');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setAiSuggestion(`Error: ${errorData.error || 'Failed to generate content'}`);
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      setAiSuggestion('Error: Failed to generate content. Please try again.');
    } finally {
      setIsAiWriting(false);
      setAiPrompt('');
    }
  };

  // Accept AI suggestion
  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    const newContent = editorContent
      ? `${editorContent}\n\n${aiSuggestion}`
      : aiSuggestion;
    setEditorContent(newContent);
    if (selectedChapter) {
      debouncedSave(newContent, selectedChapter.id);
    }
    setAiSuggestion('');
  };

  // Discard AI suggestion
  const handleDiscardSuggestion = () => {
    setAiSuggestion('');
  };

  // Select chapter
  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  // No project selected
  if (!selectedProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="flex size-20 items-center justify-center rounded-full bg-amber/10">
            <PenTool className="size-10 text-amber" />
          </div>
          <h2 className="text-2xl font-bold text-ink">Select a project first</h2>
          <p className="max-w-sm text-muted-foreground">
            Choose a project from the dashboard to start writing
          </p>
          <Button
            onClick={() => setCurrentView('dashboard')}
            className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const project = selectedProject;
  const sortedChapters = [...project.chapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );

  return (
    <div className="min-h-screen bg-paper">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        {/* Left Panel - Chapter List */}
        <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
          <div className="flex h-full flex-col border-r border-border/50 bg-white">
            {/* Panel Header */}
            <div className="border-b border-border/50 p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="size-5 text-amber" />
                <h2 className="font-semibold text-ink truncate">{project.title}</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {sortedChapters.length} chapter{sortedChapters.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Chapter List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                <AnimatePresence>
                  {sortedChapters.map((chapter) => {
                    const isSelected = selectedChapter?.id === chapter.id;
                    const chapStatus = chapterStatusConfig[chapter.status] || chapterStatusConfig.draft;
                    return (
                      <motion.button
                        key={chapter.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => handleSelectChapter(chapter)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                          isSelected
                            ? 'bg-amber/10 text-amber border border-amber/20'
                            : 'text-ink hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div
                          className={`flex size-7 items-center justify-center rounded-md text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-amber text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {chapter.chapterNumber}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{chapter.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {chapter.wordCount} words
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 px-1 py-0 ${chapStatus.className}`}>
                          {chapStatus.label}
                        </Badge>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Add Chapter Button */}
            <div className="border-t border-border/50 p-3">
              <Button
                onClick={handleAddChapter}
                disabled={isAddingChapter}
                size="sm"
                className="w-full bg-amber hover:bg-amber/90 text-ink font-semibold"
              >
                <Plus className="size-4" />
                {isAddingChapter ? 'Adding...' : 'Add Chapter'}
              </Button>
            </div>
          </div>
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle withHandle />

        {/* Right Panel - Writing Area */}
        <ResizablePanel defaultSize={78} minSize={50}>
          <div className="flex h-full flex-col bg-paper">
            {!selectedChapter ? (
              /* No chapter selected */
              <div className="flex flex-1 items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-amber/10">
                    <FileText className="size-8 text-amber" />
                  </div>
                  <h3 className="text-xl font-semibold text-ink">Select a chapter to start writing</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Choose a chapter from the sidebar or create a new one
                  </p>
                </motion.div>
              </div>
            ) : (
              /* Chapter selected - Writing Area */
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Chapter Header */}
                <div className="border-b border-border/50 bg-white px-6 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {editingTitle ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            ref={titleInputRef}
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTitle();
                              if (e.key === 'Escape') setEditingTitle(false);
                            }}
                            className="h-8 text-lg font-semibold border-amber/30"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 text-emerald-600 hover:text-emerald-700 shrink-0"
                            onClick={handleSaveTitle}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 text-muted-foreground hover:text-ink shrink-0"
                            onClick={() => setEditingTitle(false)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setTitleValue(selectedChapter.title);
                            setEditingTitle(true);
                          }}
                          className="text-lg font-semibold text-ink hover:text-amber transition-colors truncate"
                          title="Click to edit title"
                        >
                          {selectedChapter.title}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-muted-foreground">
                        {currentWordCount} words
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          (chapterStatusConfig[selectedChapter.status] || chapterStatusConfig.draft).className
                        }`}
                      >
                        {(chapterStatusConfig[selectedChapter.status] || chapterStatusConfig.draft).label}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        {saveStatus === 'saving' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 text-xs text-amber"
                          >
                            <Loader2 className="size-3 animate-spin" />
                            Saving...
                          </motion.div>
                        )}
                        {saveStatus === 'saved' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-1 text-xs text-emerald-600"
                          >
                            <Save className="size-3" />
                            Saved
                          </motion.div>
                        )}
                        {saveStatus === 'idle' && (
                          <span className="text-xs text-muted-foreground/50">
                            Auto-save on
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="mx-auto max-w-3xl px-6 py-6">
                    <textarea
                      ref={textareaRef}
                      value={editorContent}
                      onChange={(e) => handleEditorChange(e.target.value)}
                      className="w-full font-mono text-sm leading-relaxed min-h-[500px] resize-none border-0 bg-transparent text-ink placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0"
                      placeholder="Start writing your chapter here..."
                    />

                    {/* AI Writing Panel */}
                    <Separator className="my-6 bg-border/50" />

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                        <Sparkles className="size-4 text-amber" />
                        AI Writing Assistant
                      </h3>

                      {/* AI Input */}
                      <div className="flex gap-2">
                        <Input
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && aiPrompt.trim() && !isAiWriting) {
                              e.preventDefault();
                              handleAiGenerate();
                            }
                          }}
                          placeholder="Ask AI to help write..."
                          disabled={isAiWriting}
                          className="border-border/50 focus:border-amber/50 focus:ring-amber/20"
                        />
                        <Button
                          onClick={handleAiGenerate}
                          disabled={!aiPrompt.trim() || isAiWriting}
                          className="bg-amber hover:bg-amber/90 text-ink font-semibold shrink-0"
                        >
                          {isAiWriting ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Writing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-4" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>

                      {/* AI Loading Indicator */}
                      {isAiWriting && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 rounded-lg border border-amber/20 bg-amber/5 p-4"
                        >
                          <div className="ai-writing-indicator flex size-8 items-center justify-center rounded-full bg-amber/10">
                            <Sparkles className="size-4 text-amber" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ink">AI is writing...</p>
                            <p className="text-xs text-muted-foreground">Generating content based on your prompt</p>
                          </div>
                        </motion.div>
                      )}

                      {/* AI Suggestion Box */}
                      {aiSuggestion && !isAiWriting && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="rounded-lg border-l-4 border-l-amber border border-border/50 bg-amber/5 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
                              <Sparkles className="size-3.5 text-amber" />
                              AI Suggestion
                            </h4>
                          </div>
                          <p className="text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">
                            {aiSuggestion}
                          </p>
                          <div className="mt-4 flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleAcceptSuggestion}
                              className="bg-amber hover:bg-amber/90 text-ink font-semibold"
                            >
                              <Check className="size-3.5" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleDiscardSuggestion}
                              className="border-border/50 text-muted-foreground hover:text-ink"
                            >
                              <X className="size-3.5" />
                              Discard
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
