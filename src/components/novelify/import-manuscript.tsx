'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Upload, FileText, BookOpen, CheckCircle2, Loader2, AlertCircle,
  ChevronRight, Sparkles,
} from 'lucide-react';
import { useNovelifyStore } from '@/lib/store';
import { colors, Card, PageHeader, EmptyState } from './dashboard-components';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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

export function ImportManuscript() {
  const router = useRouter();
  const { setProjects, setSelectedProject, setCurrentView } = useNovelifyStore();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('id');
  const [pasteText, setPasteText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<{ num: number; title: string; words: number }[]>([]);
  const [error, setError] = useState('');

  const splitIntoChapters = (text: string) => {
    // Split by common chapter markers
    const patterns = [
      /^Chapter\s+\d+/gmi,
      /^Bab\s+\d+/gmi,
      /^CHAPTER\s+\d+/gmi,
      /^\d+\.\s+/gm,
      /^Part\s+\d+/gmi,
      /\n\n\n+/g,
    ];

    let sections: string[] = [];

    for (const pattern of patterns) {
      const parts = text.split(pattern).filter(s => s.trim().length > 20);
      if (parts.length > 1) {
        sections = parts;
        break;
      }
    }

    if (sections.length <= 1) {
      // Try splitting by double newlines as fallback
      sections = text.split(/\n\n+/).filter(s => s.trim().length > 50);
    }

    if (sections.length <= 1) {
      // Last resort: single chapter
      sections = [text];
    }

    return sections.slice(0, 50); // Max 50 chapters
  };

  const handlePreview = () => {
    if (!pasteText.trim()) return;
    setError('');
    const sections = splitIntoChapters(pasteText);
    const parsed = sections.map((s, i) => {
      const lines = s.trim().split('\n');
      const chTitle = lines[0]?.replace(/^[*#]+/, '').trim().slice(0, 60) || `Chapter ${i + 1}`;
      return { num: i + 1, title: chTitle, words: s.split(/\s+/).filter(Boolean).length };
    });
    setPreview(parsed);
  };

  const handleImport = async () => {
    if (!title.trim() || !pasteText.trim()) { setError('Title and manuscript text are required'); return; }
    setIsImporting(true);
    setError('');

    try {
      // Create project
      const res = await fetch('/api/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), genre: genre || null, sourceLanguage }),
      });
      if (!res.ok) { setError('Failed to create project'); setIsImporting(false); return; }
      const project = await res.json();

      // Create chapters
      const sections = splitIntoChapters(pasteText);
      for (let i = 0; i < sections.length; i++) {
        const content = sections[i].trim();
        await fetch('/api/chapters', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            chapterNumber: i + 1,
            title: `Chapter ${i + 1}`,
            contentOriginal: content,
            wordCount: content.split(/\s+/).filter(Boolean).length,
          }),
        });
      }

      // Refetch and navigate
      const refetch = await fetch('/api/projects');
      if (refetch.ok) {
        const allProjects = await refetch.json();
        setProjects(allProjects);
        const fresh = allProjects.find((p: any) => p.id === project.id);
        if (fresh) {
          setSelectedProject(fresh);
          setCurrentView('writing');
          router.push(`/dashboard/writing/${fresh.id}`);
        }
      }
    } catch {
      setError('Import failed. Please try again.');
    }
    finally { setIsImporting(false); }
  };

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
      <PageHeader title="Import Manuscript" subtitle="Import an existing novel draft into Novelify"
        action={
          <Button onClick={() => router.push('/dashboard')} size="sm" variant="outline"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#8E8E93', fontSize: 11 }}
          >Back to Dashboard</Button>
        }
      />

      {/* Step 1: Basic Info */}
      <Card>
        <div style={{ padding: 20 }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#F5F5F7' }}>
            <BookOpen className="size-4 inline mr-2" style={{ color: '#C9A96E' }} />
            Novel Details
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs" style={{ color: '#8E8E93' }}>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Novel title"
                style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7', marginTop: 4 }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#8E8E93' }}>Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7', marginTop: 4 }}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {genreOptions.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#8E8E93' }}>Language</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7', marginTop: 4 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Step 2: Paste manuscript */}
      <div className="mt-4">
        <Card>
          <div style={{ padding: 20 }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#F5F5F7' }}>
              <FileText className="size-4 inline mr-2" style={{ color: '#C9A96E' }} />
              Paste Your Manuscript
            </h3>
            <p className="text-xs mb-3" style={{ color: '#636366' }}>
              Paste your manuscript text below. Novelify will automatically detect chapter breaks (by "Chapter 1", "Bab 1", etc.).
              Each chapter will be created as a separate entry in the Writing Studio.
            </p>
            <Textarea value={pasteText} onChange={(e) => { setPasteText(e.target.value); setPreview([]); }}
              placeholder={`Paste your manuscript here...

Chapter 1

It was a dark and stormy night...

Chapter 2

The morning sun filtered through the curtains...`}
              rows={12} className="text-sm resize-none w-full"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#1c1c1e', color: '#F5F5F7' }}
            />
            <div className="flex gap-2 mt-3">
              <Button onClick={handlePreview} disabled={!pasteText.trim()} size="sm" variant="outline"
                style={{ borderColor: 'rgba(201,169,110,0.3)', color: '#C9A96E', fontSize: 11 }}
              ><Upload className="size-3.5" /> Preview Chapters</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <Card>
            <div style={{ padding: 20 }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
                  <CheckCircle2 className="size-4 inline mr-2" style={{ color: '#34D399' }} />
                  {preview.length} chapters detected
                </h3>
                <span className="text-[10px]" style={{ color: '#636366' }}>
                  {preview.reduce((s, c) => s + c.words, 0).toLocaleString()} total words
                </span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {preview.map((ch) => (
                  <div key={ch.num} className="flex items-center gap-2 text-xs py-1" style={{ color: '#aeaeb2' }}>
                    <span className="font-medium" style={{ color: '#C9A96E', minWidth: 24 }}>{ch.num}.</span>
                    <span className="truncate flex-1">{ch.title}</span>
                    <span style={{ color: '#636366' }}>{ch.words.toLocaleString()}w</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-center gap-2 text-xs p-3 rounded-lg"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}
        ><AlertCircle className="size-3.5" /> {error}</motion.div>
      )}

      {/* Import button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleImport} disabled={!title.trim() || !pasteText.trim() || isImporting}
          className="bg-amber hover:bg-amber/90 text-ink font-semibold"
          style={{ fontSize: 13, padding: '10px 24px' }}
        >
          {isImporting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {isImporting ? `Importing ${preview.length} chapters...` : 'Import to Novelify'}
        </Button>
      </div>
    </div>
  );
}
