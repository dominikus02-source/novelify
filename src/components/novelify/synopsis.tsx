'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  BookOpen,
  Copy,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Type,
} from 'lucide-react';
import { useNovelifyStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const AMAZON_DESCRIPTION_LIMIT = 4000;

export function Synopsis() {
  const { selectedProject, setCurrentView, setSelectedProject } = useNovelifyStore();

  const [blurb, setBlurb] = useState<string>('');
  const [amazonDescription, setAmazonDescription] = useState<string>('');
  const [isGeneratingBlurb, setIsGeneratingBlurb] = useState(false);
  const [isGeneratingAmazon, setIsGeneratingAmazon] = useState(false);
  const [copiedBlurb, setCopiedBlurb] = useState(false);
  const [copiedAmazon, setCopiedAmazon] = useState(false);

  // Refresh project data — must be before any conditional return
  const refreshProject = useCallback(async (projectId: string) => {
    try {
      const res = await fetch('/api/projects');
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
            <FileText className="size-8 text-amber" />
          </div>
          <h2 className="text-xl font-bold text-ink">Select a project first</h2>
          <p className="max-w-sm text-muted-foreground">
            Choose a novel project to generate a synopsis
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

  // Build chapter summaries
  const chapterSummaries = selectedProject.chapters
    .sort((a, b) => a.chapterNumber - b.chapterNumber)
    .map((c) => `Chapter ${c.chapterNumber}: ${c.title} — ${(c.contentOriginal || '').substring(0, 200)}...`)
    .join('\n');

  // Generate blurb
  const handleGenerateBlurb = async () => {
    setIsGeneratingBlurb(true);
    try {
      const res = await fetch('/api/synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          type: 'blurb',
          context: {
            title: selectedProject.title,
            genre: selectedProject.genre,
            plotOutline: selectedProject.plotOutline,
            chapterSummaries,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBlurb(data.synopsis || data.content || '');
      } else {
        console.error('Blurb generation failed:', await res.text());
      }
    } catch (error) {
      console.error('Blurb generation error:', error);
    } finally {
      setIsGeneratingBlurb(false);
    }
  };

  // Generate Amazon description
  const handleGenerateAmazon = async () => {
    setIsGeneratingAmazon(true);
    try {
      const res = await fetch('/api/synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          type: 'amazon',
          context: {
            title: selectedProject.title,
            genre: selectedProject.genre,
            plotOutline: selectedProject.plotOutline,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAmazonDescription(data.synopsis || data.content || '');
      } else {
        console.error('Amazon description generation failed:', await res.text());
      }
    } catch (error) {
      console.error('Amazon description generation error:', error);
    } finally {
      setIsGeneratingAmazon(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: 'blurb' | 'amazon') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'blurb') {
        setCopiedBlurb(true);
        setTimeout(() => setCopiedBlurb(false), 2000);
      } else {
        setCopiedAmazon(true);
        setTimeout(() => setCopiedAmazon(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const amazonCharCount = amazonDescription.length;
  const amazonCharPercent = Math.min(100, (amazonCharCount / AMAZON_DESCRIPTION_LIMIT) * 100);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Synopsis Generator
          </h1>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <BookOpen className="size-4" />
            <span className="font-medium text-ink">{selectedProject.title}</span>
            {selectedProject.genre && (
              <Badge variant="outline" className="border-amber/30 text-amber text-xs">
                {selectedProject.genre}
              </Badge>
            )}
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Back-Cover Blurb Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber/10">
                      <Sparkles className="size-5 text-amber" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-ink">
                        Back-Cover Blurb
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        A compelling description for your book&apos;s back cover
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {blurb && (
                      <>
                        <Button
                          onClick={() => copyToClipboard(blurb, 'blurb')}
                          variant="outline"
                          size="sm"
                          className="border-amber/30 text-amber hover:bg-amber/10"
                        >
                          {copiedBlurb ? (
                            <>
                              <CheckCircle2 className="size-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleGenerateBlurb}
                          variant="outline"
                          size="sm"
                          disabled={isGeneratingBlurb}
                          className="border-amber/30 text-amber hover:bg-amber/10"
                        >
                          <RefreshCw className="size-4" />
                          Regenerate
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={handleGenerateBlurb}
                      disabled={isGeneratingBlurb}
                      className="bg-amber hover:bg-amber/90 text-ink font-semibold"
                      size="sm"
                    >
                      {isGeneratingBlurb ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4" />
                          Generate Blurb
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isGeneratingBlurb && !blurb ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : blurb ? (
                  <div
                    className="rounded-xl border border-border/30 bg-[#FFFDF7] p-6"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: '1.8' }}
                  >
                    <p className="whitespace-pre-wrap text-ink/85 text-[15px]">
                      {blurb}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-white/40 py-12 text-center">
                    <Sparkles className="mb-3 size-10 text-amber/30" />
                    <p className="text-sm text-muted-foreground">
                      Click &quot;Generate Blurb&quot; to create a compelling back-cover description
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Amazon Product Description Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber/10">
                      <ShoppingBag className="size-5 text-amber" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-ink">
                        Amazon Product Description
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Optimized for your KDP listing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {amazonDescription && (
                      <>
                        <Button
                          onClick={() => copyToClipboard(amazonDescription, 'amazon')}
                          variant="outline"
                          size="sm"
                          className="border-amber/30 text-amber hover:bg-amber/10"
                        >
                          {copiedAmazon ? (
                            <>
                              <CheckCircle2 className="size-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleGenerateAmazon}
                          variant="outline"
                          size="sm"
                          disabled={isGeneratingAmazon}
                          className="border-amber/30 text-amber hover:bg-amber/10"
                        >
                          <RefreshCw className="size-4" />
                          Regenerate
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={handleGenerateAmazon}
                      disabled={isGeneratingAmazon}
                      className="bg-amber hover:bg-amber/90 text-ink font-semibold"
                      size="sm"
                    >
                      {isGeneratingAmazon ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="size-4" />
                          Generate Amazon Description
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Character count indicator */}
                {amazonDescription && (
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Type className="size-4 text-muted-foreground" />
                      <span className={`font-medium ${amazonCharCount > AMAZON_DESCRIPTION_LIMIT ? 'text-destructive' : 'text-ink'}`}>
                        {amazonCharCount.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        / {AMAZON_DESCRIPTION_LIMIT.toLocaleString()} characters
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        amazonCharCount > AMAZON_DESCRIPTION_LIMIT
                          ? 'border-destructive/30 text-destructive'
                          : amazonCharPercent > 80
                            ? 'border-amber/30 text-amber'
                            : 'border-emerald-500/30 text-emerald-600'
                      }`}
                    >
                      {amazonCharPercent > 100
                        ? 'Over limit'
                        : amazonCharPercent > 80
                          ? 'Getting long'
                          : 'Good length'}
                    </Badge>
                  </div>
                )}

                {isGeneratingAmazon && !amazonDescription ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : amazonDescription ? (
                  <div
                    className="rounded-xl border border-border/30 bg-[#FFFDF7] p-6"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: '1.8' }}
                  >
                    <p className="whitespace-pre-wrap text-ink/85 text-[15px]">
                      {amazonDescription}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-white/40 py-12 text-center">
                    <ShoppingBag className="mb-3 size-10 text-amber/30" />
                    <p className="text-sm text-muted-foreground">
                      Click &quot;Generate Amazon Description&quot; to create a KDP-ready listing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
