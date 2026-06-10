'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Languages,
  ArrowRight,
  BookOpen,
  Info,
  Loader2,
  CheckCircle2,
  Circle,
  RefreshCw,
} from 'lucide-react';
import { useNovelifyStore, type Chapter } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

const languageNames: Record<string, string> = {
  id: 'Indonesian', en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', pt: 'Portuguese', hi: 'Hindi',
};

export function Translation() {
  const {
    selectedProject,
    setCurrentView,
    isAiTranslating,
    setIsAiTranslating,
    setSelectedProject,
  } = useNovelifyStore();

  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [translateAllProgress, setTranslateAllProgress] = useState<number>(0);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  // Refresh project data — must be before any conditional return
  const refreshProject = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects`);
      if (res.ok) {
        const data = await res.json();
        const updated = data.find((p: { id: string }) => p.id === projectId);
        if (updated) {
          setSelectedProject(updated);
        }
      }
    } catch (error) {
      console.error('Failed to refresh project:', error);
    }
  }, [setSelectedProject]);

  // No project selected
  if (!selectedProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-amber/10">
            <Languages className="size-8 text-amber" />
          </div>
          <h2 className="text-xl font-bold text-ink">Select a project first</h2>
          <p className="max-w-sm text-muted-foreground">
            Choose a novel project to start translating
          </p>
          <Button
            onClick={() => setCurrentView('dashboard')}
            className="bg-amber hover:bg-amber/90 text-ink font-semibold"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const chapters = selectedProject.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0] || null;
  const srcLang = languageNames[selectedProject.sourceLanguage] || selectedProject.sourceLanguage;
  const tgtLang = languageNames[selectedProject.targetLanguage] || selectedProject.targetLanguage;

  // Compute translation progress
  const totalChapters = chapters.length;
  const translatedChapters = chapters.filter((c) => c.contentTranslated).length;
  const progressPercent = totalChapters > 0 ? Math.round((translatedChapters / totalChapters) * 100) : 0;

  // Translate a single chapter
  const handleTranslateChapter = async (chapter: Chapter) => {
    if (!chapter.contentOriginal || isAiTranslating) return;

    setIsAiTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          chapterId: chapter.id,
          sourceLanguage: selectedProject.sourceLanguage,
          targetLanguage: selectedProject.targetLanguage,
          content: chapter.contentOriginal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update the chapter's contentTranslated
        await fetch(`/api/chapters/${chapter.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentTranslated: data.content || data.translation }),
        });
        await refreshProject(selectedProject.id);
      } else {
        console.error('Translation failed:', await res.text());
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsAiTranslating(false);
    }
  };

  // Translate all chapters sequentially
  const handleTranslateAll = async () => {
    if (isTranslatingAll || isAiTranslating) return;

    const untranslated = chapters.filter((c) => !c.contentTranslated && c.contentOriginal);
    if (untranslated.length === 0) return;

    setIsTranslatingAll(true);
    setTranslateAllProgress(0);

    for (let i = 0; i < untranslated.length; i++) {
      const chapter = untranslated[i];
      setIsAiTranslating(true);

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: selectedProject.id,
            chapterId: chapter.id,
            sourceLanguage: selectedProject.sourceLanguage,
            targetLanguage: selectedProject.targetLanguage,
            content: chapter.contentOriginal,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          await fetch(`/api/chapters/${chapter.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentTranslated: data.content || data.translation }),
          });
        }
      } catch (error) {
        console.error(`Failed to translate chapter ${chapter.chapterNumber}:`, error);
      } finally {
        setIsAiTranslating(false);
      }

      setTranslateAllProgress(Math.round(((i + 1) / untranslated.length) * 100));
    }

    await refreshProject(selectedProject.id);
    setIsTranslatingAll(false);
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink">
                Literary Translation
              </h1>
              <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                <BookOpen className="size-4" />
                <span className="font-medium text-ink">{selectedProject.title}</span>
                <ArrowRight className="size-3.5" />
                <span>{srcLang}</span>
                <ArrowRight className="size-3.5" />
                <span>{tgtLang}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber/30 text-amber">
                {translatedChapters}/{totalChapters} translated
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Translation Quality Note */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card className="mb-6 border-amber/20 bg-amber/5">
            <CardContent className="flex items-start gap-3 p-4">
              <Info className="mt-0.5 size-5 shrink-0 text-amber" />
              <p className="text-sm text-ink/80">
                Our AI preserves your voice, tone, and emotion — not word-for-word, but meaning-for-meaning.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress bar when translating all */}
        <AnimatePresence>
          {isTranslatingAll && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="border-amber/20">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">Translating all chapters...</span>
                    <span className="text-amber">{translateAllProgress}%</span>
                  </div>
                  <Progress value={translateAllProgress} className="h-2" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chapter Selector & Actions */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-ink">Chapter:</label>
            <Select
              value={selectedChapter?.id || ''}
              onValueChange={setSelectedChapterId}
            >
              <SelectTrigger className="w-[260px] bg-white">
                <SelectValue placeholder="Select a chapter" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    <span className="flex items-center gap-2">
                      Ch. {chapter.chapterNumber}: {chapter.title}
                      {chapter.contentTranslated && (
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => selectedChapter && handleTranslateChapter(selectedChapter)}
              disabled={isAiTranslating || !selectedChapter?.contentOriginal}
              className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md transition-all hover:shadow-lg"
            >
              {isAiTranslating && !isTranslatingAll ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="size-4" />
                  Translate Chapter
                </>
              )}
            </Button>
            <Button
              onClick={handleTranslateAll}
              disabled={isAiTranslating || isTranslatingAll || chapters.filter(c => !c.contentTranslated && c.contentOriginal).length === 0}
              variant="outline"
              className="border-amber/30 text-amber hover:bg-amber/10"
            >
              {isTranslatingAll ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Translating All...
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" />
                  Translate All
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Translation Progress Indicator */}
        {totalChapters > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center gap-1"
                  title={`Ch. ${chapter.chapterNumber}: ${chapter.contentTranslated ? 'Translated' : 'Not translated'}`}
                >
                  {chapter.contentTranslated ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/40" />
                  )}
                </div>
              ))}
              <span className="ml-2 text-xs text-muted-foreground">
                {progressPercent}% complete
              </span>
            </div>
          </motion.div>
        )}

        {/* Two-Panel Layout */}
        {!selectedChapter ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-20 text-center"
          >
            <BookOpen className="mb-4 size-12 text-amber/40" />
            <h3 className="text-lg font-semibold text-ink">No chapters yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add chapters to your project to start translating
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {/* Left Panel - Original */}
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-ink">
                    Original
                  </CardTitle>
                  <Badge variant="outline" className="border-amber/30 text-amber text-xs">
                    {srcLang}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className="min-h-[400px] max-h-[600px] overflow-y-auto bg-[#FFFDF7] p-6 custom-scrollbar"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: '1.8' }}
                >
                  {selectedChapter.contentOriginal ? (
                    <div className="whitespace-pre-wrap text-ink/85 text-[15px]">
                      {selectedChapter.contentOriginal}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <BookOpen className="mb-3 size-10 text-amber/30" />
                      <p className="text-muted-foreground">No original content yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Panel - Translation */}
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-ink">
                    Translation
                  </CardTitle>
                  <Badge variant="outline" className="border-amber/30 text-amber text-xs">
                    {tgtLang}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className="min-h-[400px] max-h-[600px] overflow-y-auto bg-[#FFFDF7] p-6 custom-scrollbar"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: '1.8' }}
                >
                  {isAiTranslating && !isTranslatingAll ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Loader2 className="mb-3 size-8 animate-spin text-amber" />
                      <p className="font-medium text-ink">Translating...</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Preserving tone and meaning
                      </p>
                    </div>
                  ) : selectedChapter.contentTranslated ? (
                    <div className="whitespace-pre-wrap text-ink/85 text-[15px]">
                      {selectedChapter.contentTranslated}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Languages className="mb-3 size-10 text-amber/30" />
                      <p className="text-muted-foreground">
                        No translation yet. Click &apos;Translate&apos; to begin.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
