'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
  FileDown,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useNovelifyStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const languageNames: Record<string, string> = {
  id: 'Indonesian', en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', pt: 'Portuguese', hi: 'Hindi',
};

const languageOptions = Object.entries(languageNames).map(([code, name]) => ({
  value: code,
  label: name,
}));

interface ExportRecord {
  id: string;
  date: string;
  format: string;
  status: string;
  downloadUrl: string | null;
}

export function EpubExport() {
  const { selectedProject, setCurrentView } = useNovelifyStore();

  // Export settings
  const [includeOriginal, setIncludeOriginal] = useState(true);
  const [includeTranslation, setIncludeTranslation] = useState(true);
  const [authorName, setAuthorName] = useState('Anonymous');
  const [bookLanguage, setBookLanguage] = useState(selectedProject?.sourceLanguage || 'en');

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);

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
            <Download className="size-8 text-amber" />
          </div>
          <h2 className="text-xl font-bold text-ink">Select a project first</h2>
          <p className="max-w-sm text-muted-foreground">
            Choose a novel project to export
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
  const hasTranslations = chapters.some((c) => c.contentTranslated);
  const needsTranslation = selectedProject.sourceLanguage !== selectedProject.targetLanguage;

  // Pre-export checklist
  const checklist = [
    {
      label: 'Has at least 1 chapter',
      passed: chapters.length > 0,
    },
    {
      label: 'All chapters have content',
      passed: chapters.length > 0 && chapters.every((c) => c.contentOriginal.trim().length > 0),
    },
    {
      label: 'Translations complete',
      passed: !needsTranslation || chapters.every((c) => c.contentTranslated),
      skipped: !needsTranslation,
    },
    {
      label: 'Has a cover image',
      passed: !!selectedProject.coverImage,
    },
    {
      label: 'Has a genre set',
      passed: !!selectedProject.genre,
    },
  ];

  const allPassed = checklist.filter((c) => !c.skipped).every((c) => c.passed);
  const failedItems = checklist.filter((c) => !c.skipped && !c.passed);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    setDownloadUrl(null);

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          options: {
            includeOriginal,
            includeTranslation: includeTranslation && hasTranslations,
            authorName,
            language: bookLanguage,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const url = data.downloadUrl || data.url || data.filePath;
        setDownloadUrl(url);

        // Add to export history
        setExportHistory((prev) => [
          {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            format: 'EPUB',
            status: 'completed',
            downloadUrl: url,
          },
          ...prev,
        ]);
      } else {
        console.error('Export failed:', await res.text());
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Export to EPUB
          </h1>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <BookOpen className="size-4" />
            <span className="font-medium text-ink">{selectedProject.title}</span>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Pre-export Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-ink">
                    Pre-Export Checklist
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      allPassed
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50'
                        : 'border-amber/30 text-amber bg-amber/5'
                    }`}
                  >
                    {allPassed ? 'Ready to Export' : 'Not Ready'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                      {item.skipped ? (
                        <div className="flex size-5 items-center justify-center">
                          <span className="text-xs text-muted-foreground">—</span>
                        </div>
                      ) : item.passed ? (
                        <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="size-5 shrink-0 text-destructive/70" />
                      )}
                      <span
                        className={`text-sm ${
                          item.skipped
                            ? 'text-muted-foreground/50 line-through'
                            : item.passed
                              ? 'text-ink'
                              : 'text-ink/70'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.skipped && (
                        <span className="text-xs text-muted-foreground">(not needed)</span>
                      )}
                    </li>
                  ))}
                </ul>

                {!allPassed && failedItems.length > 0 && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber/20 bg-amber/5 p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" />
                    <div>
                      <p className="text-sm font-medium text-ink">Missing items:</p>
                      <ul className="mt-1 space-y-0.5">
                        {failedItems.map((item) => (
                          <li key={item.label} className="text-xs text-muted-foreground">
                            • {item.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Export Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 bg-white px-6 py-4">
                <CardTitle className="text-base font-semibold text-ink">
                  Export Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-original"
                      checked={includeOriginal}
                      onCheckedChange={(checked) => setIncludeOriginal(checked === true)}
                    />
                    <Label htmlFor="include-original" className="text-sm text-ink cursor-pointer">
                      Include original language
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-translation"
                      checked={includeTranslation}
                      onCheckedChange={(checked) => setIncludeTranslation(checked === true)}
                      disabled={!hasTranslations}
                    />
                    <Label
                      htmlFor="include-translation"
                      className={`text-sm cursor-pointer ${
                        hasTranslations ? 'text-ink' : 'text-muted-foreground'
                      }`}
                    >
                      Include translation
                      {!hasTranslations && (
                        <span className="ml-1 text-xs text-muted-foreground">(none available)</span>
                      )}
                    </Label>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="author-name" className="text-sm font-medium text-ink">
                      Author Name
                    </Label>
                    <Input
                      id="author-name"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Anonymous"
                      className="border-border/50 bg-white focus:border-amber/50 focus:ring-amber/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="book-language" className="text-sm font-medium text-ink">
                      Book Language (EPUB metadata)
                    </Label>
                    <Select value={bookLanguage} onValueChange={setBookLanguage}>
                      <SelectTrigger className="bg-white border-border/50">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Export Button & Download */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">Generate EPUB</h3>
                    <p className="text-sm text-muted-foreground">
                      {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} will be included
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleExport}
                      disabled={isExporting || chapters.length === 0}
                      className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md transition-all hover:shadow-lg"
                      size="lg"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="size-5" />
                          Generate EPUB
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Download link */}
                <AnimatePresence>
                  {downloadUrl && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-50 p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="size-5 text-emerald-500" />
                          <div>
                            <p className="font-medium text-ink">Export complete!</p>
                            <p className="text-sm text-muted-foreground">
                              Your EPUB file is ready to download
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          <a href={downloadUrl} download>
                            <FileDown className="size-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Export History */}
          {exportHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Card className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="border-b border-border/50 bg-white px-6 py-4">
                  <CardTitle className="text-base font-semibold text-ink">
                    Export History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/30">
                    {exportHistory.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between px-6 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="size-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-ink">
                              {new Date(exp.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs border-border/50">
                            {exp.format}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              exp.status === 'completed'
                                ? 'border-emerald-500/30 text-emerald-600'
                                : 'border-amber/30 text-amber'
                            }`}
                          >
                            {exp.status}
                          </Badge>
                          {exp.downloadUrl && (
                            <Button asChild variant="ghost" size="sm" className="text-amber hover:text-amber/80">
                              <a href={exp.downloadUrl} download>
                                <Download className="size-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
