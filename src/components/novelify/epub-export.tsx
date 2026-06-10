'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Download, BookOpen, FileText, FileDown, Loader2, CheckCircle2,
  Settings2, BookMarked, Globe, Hash, User,
} from 'lucide-react';
import { useNovelifyStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const languageNames: Record<string, string> = {
  id: 'Indonesian', en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', pt: 'Portuguese', hi: 'Hindi',
};

const formatOptions = [
  { value: 'epub', label: 'EPUB', icon: BookOpen, desc: 'Ebook format for Apple Books, Google Play, Kobo, etc.' },
  { value: 'pdf', label: 'PDF / HTML', icon: FileDown, desc: 'Print-ready manuscript with page breaks.' },
];

export function EpubExport() {
  const { selectedProject, setCurrentView } = useNovelifyStore();
  const [format, setFormat] = useState<'epub' | 'pdf'>('epub');
  const [includeOriginal, setIncludeOriginal] = useState(true);
  const [includeTranslation, setIncludeTranslation] = useState(false);
  const [authorName, setAuthorName] = useState('Author');
  const [language, setLanguage] = useState('en');
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportError, setExportError] = useState('');

  const chapterCount = selectedProject?.chapters.length || 0;
  const wordCount = selectedProject?.chapters.reduce((sum, c) => sum + c.wordCount, 0) || 0;
  const reviewCount = selectedProject?.chapters.filter((c) => c.status !== 'draft').length || 0;

  const handleExport = async () => {
    if (!selectedProject) return;
    setIsExporting(true);
    setExportError('');
    setExportDone(false);

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          format,
          options: { includeOriginal, includeTranslation, authorName, language },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Export failed' }));
        setExportError(err.error || 'Export failed');
        setIsExporting(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject.title.replace(/[^a-zA-Z0-9-]/g, '_')}-manuscript.${format === 'epub' ? 'epub' : 'html'}`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
    } catch {
      setExportError('Failed to connect. Please try again.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportDone(false), 3000);
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="flex size-20 items-center justify-center rounded-full bg-amber/10">
            <Download className="size-10 text-amber" />
          </div>
          <h2 className="text-2xl font-bold text-ink">Select a project first</h2>
          <p className="max-w-sm text-muted-foreground">Choose a project to export</p>
          <Button onClick={() => setCurrentView('dashboard')}
            className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md"
          >Go to Dashboard</Button>
        </motion.div>
      </div>
    );
  }

  const project = selectedProject;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Export</h1>
          <p className="mt-1 text-muted-foreground">Format and download your manuscript</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main export panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format selection */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
              <Card className="border-border/50 bg-white shadow-sm">
                <CardContent className="p-5">
                  <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">Format</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {formatOptions.map((fmt) => {
                      const Icon = fmt.icon;
                      const isActive = format === fmt.value;
                      return (
                        <button key={fmt.value}               onClick={() => setFormat(fmt.value as 'epub' | 'pdf')}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                            isActive ? 'border-amber bg-amber/5 shadow-sm' : 'border-border/50 hover:border-amber/30 bg-white'
                          }`}
                        >
                          <div className={`flex size-10 items-center justify-center rounded-lg ${isActive ? 'bg-amber/10' : 'bg-muted'}`}>
                            <Icon className={`size-5 ${isActive ? 'text-amber' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${isActive ? 'text-amber' : 'text-ink'}`}>{fmt.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{fmt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Content options */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
              <Card className="border-border/50 bg-white shadow-sm">
                <CardContent className="p-5">
                  <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">Content</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={includeOriginal}
                        onChange={(e) => setIncludeOriginal(e.target.checked)}
                        className="size-4 rounded border-border text-amber focus:ring-amber"
                      />
                      <div>
                        <p className="text-sm font-medium text-ink">Original Language</p>
                        <p className="text-xs text-muted-foreground">Include the source text</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={includeTranslation}
                        onChange={(e) => setIncludeTranslation(e.target.checked)}
                        className="size-4 rounded border-border text-amber focus:ring-amber"
                      />
                      <div>
                        <p className="text-sm font-medium text-ink">Translation</p>
                        <p className="text-xs text-muted-foreground">Include translated text (if available)</p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Metadata editor */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
              <Card className="border-border/50 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="size-4 text-amber" />
                    <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Metadata</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <BookMarked className="size-3" /> Title
                      </Label>
                      <Input value={project.title} disabled className="border-border/50 bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <User className="size-3" /> Author
                      </Label>
                      <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Author name" className="border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Globe className="size-3" /> Language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(languageNames).map(([code, name]) => (
                            <SelectItem key={code} value={code}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Hash className="size-3" /> Genre
                      </Label>
                      <Input value={project.genre || 'Not set'} disabled className="border-border/50 bg-muted/30" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Export button */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
              <Button onClick={handleExport} disabled={isExporting || chapterCount === 0}
                className="w-full bg-amber hover:bg-amber/90 text-ink font-semibold py-6 text-base shadow-md hover:shadow-lg transition-all"
              >
                {isExporting ? (
                  <><Loader2 className="size-5 animate-spin" /> Generating {format === 'epub' ? 'EPUB' : 'PDF'}...</>
                ) : exportDone ? (
                  <><CheckCircle2 className="size-5 text-emerald-700" /> Downloaded!</>
                ) : (
                  <><Download className="size-5" /> Export & Download {format === 'epub' ? 'EPUB' : 'PDF'}</>
                )}
              </Button>
              {exportError && (
                <p className="mt-2 text-sm text-red-500 text-center">{exportError}</p>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Project Summary */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Card className="border-border/50 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="size-4 text-amber" />
                    <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">{project.title}</h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Chapters</span><span className="text-ink font-medium">{chapterCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Words</span><span className="text-ink font-medium">{wordCount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Reviewed</span><span className="text-ink font-medium">{reviewCount} / {chapterCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Language</span><span className="text-ink font-medium">{languageNames[project.sourceLanguage] || project.sourceLanguage}</span></div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-amber" style={{ width: chapterCount ? `${(reviewCount / chapterCount) * 100}%` : '0%' }} />
                    </div>
                    <span>{chapterCount ? Math.round((reviewCount / chapterCount) * 100) : 0}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
              <Card className="border-border/50 bg-white shadow-sm">
                <CardContent className="p-5">
                  <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-3">KDP Tips</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Use 12+ pt serif font for print</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Include a Table of Contents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Add your author bio at the end</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Set correct language metadata</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
