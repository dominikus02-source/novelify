'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Languages, CheckCircle2, Clock, Loader2, Save, Sparkles,
  BookOpen, FileText, ChevronRight, Globe, X, AlertCircle,
} from 'lucide-react';
import { useNovelifyStore, type Chapter } from '@/lib/store';
import { colors, Card, StatusBadge, ProgressBar } from './dashboard-components';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const languageNames: Record<string, string> = {
  id: 'Indonesian', en: 'English', es: 'Spanish', fr: 'French',
  de: 'German', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
  ar: 'Arabic', pt: 'Portuguese', hi: 'Hindi',
};

export function TranslationStudio() {
  const { selectedProject } = useNovelifyStore();
  const { toast } = useToast();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [translatedText, setTranslatedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!selectedProject) return;
    setFetching(true);
    setFetchError('');
    fetch(`/api/chapters?projectId=${selectedProject.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setChapters(data); setFetching(false); })
      .catch(() => { setFetching(false); setFetchError('Failed to load chapters. Please refresh and try again.'); });
  }, [selectedProject?.id]);

  useEffect(() => {
    if (selectedChapter) {
      setOriginalText(selectedChapter.contentOriginal || '');
      setTranslatedText(selectedChapter.contentTranslated || '');
      setSaveStatus('idle');
    }
  }, [selectedChapter?.id]);

  const handleSave = useCallback(async () => {
    if (!selectedChapter) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/chapters/${selectedChapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentTranslated: translatedText,
          wordCount: translatedText.split(/\s+/).filter(Boolean).length,
        }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setChapters((prev) => prev.map((c) =>
          c.id === selectedChapter.id ? { ...c, contentTranslated: translatedText } : c
        ));
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        toast({ title: 'Failed to save translation', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Could not save. Check your connection and try again.', variant: 'destructive' });
    }
    finally { setIsSaving(false); }
  }, [selectedChapter, translatedText, toast]);

  const handleAiTranslate = async () => {
    if (!selectedChapter || !selectedProject || !originalText.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLanguage: languageNames[selectedProject.sourceLanguage] || selectedProject.sourceLanguage,
          targetLanguage: languageNames[selectedProject.targetLanguage] || selectedProject.targetLanguage,
          content: originalText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTranslatedText(data.content || '');
      } else {
        toast({ title: 'AI translation failed. Please try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Could not connect. Check your connection and try again.', variant: 'destructive' });
    }
    finally { setIsTranslating(false); }
  };

  const getTranslationStatus = (ch: Chapter) => {
    if (!ch.contentTranslated) return { label: 'Untranslated', color: '#636366' };
    if (ch.contentTranslated.length < (ch.contentOriginal?.length || 0) * 0.5) return { label: 'Partial', color: '#C8873A' };
    return { label: 'Translated', color: '#34D399' };
  };

  if (!selectedProject) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: colors.darkBg }}>
        <div className="flex flex-col items-center gap-4 text-center" style={{ maxWidth: 360 }}>
          <div className="flex size-16 items-center justify-center rounded-2xl" style={{ background: 'rgba(201,169,110,0.10)', border: '1px solid rgba(201,169,110,0.15)' }}>
            <Languages className="size-8" style={{ color: '#C9A96E' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600, color: '#F5F5F7', margin: 0 }}>Select a Project</h2>
          <p style={{ fontSize: 13, color: '#8E8E93', lineHeight: 1.5, margin: 0 }}>Choose a project from your library to translate</p>
        </div>
      </div>
    );
  }

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const translatedCount = chapters.filter((c) => c.contentTranslated).length;
  const totalWords = chapters.reduce((s, c) => s + (c.contentOriginal?.split(/\s+/).filter(Boolean).length || 0), 0);
  const translatedWords = chapters.reduce((s, c) => s + (c.contentTranslated?.split(/\s+/).filter(Boolean).length || 0), 0);

  return (
    <div className="flex flex-col md:flex-row h-screen" style={{ background: colors.darkBg }}>
      {/* Left Panel — Chapter List */}
      <div className="w-full md:w-[280px]" style={{ flexShrink: 0, background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="size-4 shrink-0" style={{ color: '#C9A96E' }} />
            <span className="text-sm font-semibold truncate" style={{ color: '#F5F5F7' }}>{selectedProject.title}</span>
          </div>
          <div style={{ fontSize: 10, color: '#8E8E93' }}>
            {languageNames[selectedProject.sourceLanguage] || selectedProject.sourceLanguage} → {languageNames[selectedProject.targetLanguage] || selectedProject.targetLanguage}
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="flex items-center justify-between text-[10px] mb-1" style={{ color: '#8E8E93' }}>
              <span>{translatedCount}/{chapters.length} chapters</span>
              <span>{Math.round((translatedCount / Math.max(1, chapters.length)) * 100)}%</span>
            </div>
            <ProgressBar pct={Math.round((translatedCount / Math.max(1, chapters.length)) * 100)} />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {fetchError ? (
            <div className="py-12 text-center px-4">
              <AlertCircle className="size-5 mx-auto mb-2" style={{ color: '#F87171' }} />
              <p className="text-xs" style={{ color: '#F87171' }}>{fetchError}</p>
            </div>
          ) : fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin" style={{ color: '#636366' }} />
            </div>
          ) : sortedChapters.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs" style={{ color: '#636366' }}>No chapters yet</p>
              <p className="text-[10px] mt-1" style={{ color: '#48484a' }}>Write chapters in Writing Studio first</p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {sortedChapters.map((chapter) => {
                const isSelected = selectedChapter?.id === chapter.id;
                const status = getTranslationStatus(chapter);
                return (
                  <button key={chapter.id}
                    onClick={() => setSelectedChapter(chapter)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all ${
                      isSelected ? 'bg-[#C9A96E]/10' : 'hover:bg-white/5'
                    }`}
                    style={{ color: isSelected ? '#E8C98A' : '#aeaeb2' }}
                  >
                    <div className="flex size-7 items-center justify-center rounded-md text-[10px] font-bold shrink-0"
                      style={{ background: isSelected ? '#C9A96E' : 'rgba(255,255,255,0.08)', color: isSelected ? '#fff' : '#8E8E93' }}
                    >{chapter.chapterNumber}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium truncate">{chapter.title}</p>
                      <p className="text-[10px]" style={{ color: '#636366' }}>
                        {(chapter.contentOriginal?.split(/\s+/).filter(Boolean).length || 0).toLocaleString()}w
                      </p>
                    </div>
                    <span style={{
                      fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 6,
                      background: `${status.color}15`, color: status.color,
                      border: `1px solid ${status.color}30`, whiteSpace: 'nowrap',
                    }}>{status.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel — Translation Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!selectedChapter ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center" style={{ maxWidth: 360 }}>
              <div className="flex size-16 items-center justify-center rounded-full" style={{ background: 'rgba(201,169,110,0.08)' }}>
                <Globe className="size-8" style={{ color: '#C9A96E' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#F5F5F7' }}>Select a chapter to translate</h3>
              <p className="text-sm" style={{ color: '#8E8E93' }}>Choose a chapter from the list to view its original text and add a translation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Editor Header */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0a', padding: '12px 24px' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-sm font-semibold truncate" style={{ color: '#F5F5F7' }}>
                    Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                  </span>
                  <StatusBadge status={getTranslationStatus(selectedChapter).label.toLowerCase()} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline"
                    onClick={handleAiTranslate}
                    disabled={isTranslating || !originalText.trim()}
                    style={{ borderColor: 'rgba(201,169,110,0.3)', color: '#C9A96E', fontSize: 11, gap: 4 }}
                  >
                    {isTranslating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                    {isTranslating ? 'Translating...' : 'AI Translate'}
                  </Button>
                  <Button size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-amber hover:bg-amber/90 text-ink font-semibold"
                    style={{ fontSize: 11, gap: 4 }}
                  >
                    {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    Save
                  </Button>
                  {saveStatus === 'saved' && (
                    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] flex items-center gap-1" style={{ color: '#34D399' }}
                    ><CheckCircle2 className="size-3" /> Saved</motion.span>
                  )}
                </div>
              </div>
            </div>

            {/* Source + Translation Panels */}
            <div className="flex flex-1 overflow-hidden">
              {/* Source Text */}
              <div className="flex flex-1 flex-col overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="py-2 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#636366', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-2">
                    <FileText className="size-3" />
                    Original — {languageNames[selectedProject.sourceLanguage] || selectedProject.sourceLanguage}
                    <span className="font-normal" style={{ color: '#48484a' }}>
                      ({originalText.split(/\s+/).filter(Boolean).length.toLocaleString()} words)
                    </span>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 mx-auto max-w-2xl">
                    {originalText.trim() ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#aeaeb2', lineHeight: 1.8 }}>
                        {originalText}
                      </p>
                    ) : (
                      <p className="text-xs" style={{ color: '#636366' }}>No content in this chapter yet.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Translation Text */}
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="py-2 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#C9A96E', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-2">
                    <Globe className="size-3" />
                    Translation — {languageNames[selectedProject.targetLanguage] || selectedProject.targetLanguage}
                    <span className="font-normal" style={{ color: '#48484a' }}>
                      ({translatedText.split(/\s+/).filter(Boolean).length.toLocaleString()} words)
                    </span>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 mx-auto max-w-2xl">
                    <textarea ref={textareaRef} value={translatedText}
                      onChange={(e) => { setTranslatedText(e.target.value); setSaveStatus('idle'); }}
                      className="w-full min-h-[50vh] resize-none border-0 bg-transparent leading-relaxed focus:outline-none"
                      style={{ color: '#F5F5F7', fontSize: 14, lineHeight: 1.8, fontFamily: "'Georgia','Times New Roman',serif" }}
                      placeholder="Translation will appear here. Click AI Translate or type manually..."
                    />
                  </div>
                </ScrollArea>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
