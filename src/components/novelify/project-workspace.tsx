'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Languages,
  FileText,
  Image,
  Download,
  Users,
  Plus,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useNovelifyStore, type Project } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Language code to display name mapping
const languageNames: Record<string, string> = {
  id: 'Indonesian',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
  pt: 'Portuguese',
  hi: 'Hindi',
};

// Status badge color mapping
const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  translating: { label: 'Translating', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  reviewed: { label: 'Reviewed', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  locked: { label: 'Locked', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  ready: { label: 'Ready', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  exported: { label: 'Exported', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

// Chapter status config
const chapterStatusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  reviewed: { label: 'Reviewed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  locked: { label: 'Locked', className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

// Character role config
const roleConfig: Record<string, { label: string; className: string }> = {
  protagonist: { label: 'Protagonist', className: 'bg-amber/10 text-amber border-amber/20' },
  antagonist: { label: 'Antagonist', className: 'bg-red-100 text-red-700 border-red-200' },
  supporting: { label: 'Supporting', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

// Action card definitions
const actionCards = [
  {
    key: 'writing',
    title: 'Writing Studio',
    description: 'Write and edit chapters with AI assistance',
    icon: PenTool,
    view: 'writing' as const,
    bgClass: 'bg-amber/10',
    iconClass: 'text-amber',
  },
  {
    key: 'translate',
    title: 'Translate',
    description: 'Translate chapters to your target language',
    icon: Languages,
    view: 'translate' as const,
    bgClass: 'bg-emerald-50',
    iconClass: 'text-emerald-600',
  },
  {
    key: 'synopsis',
    title: 'Synopsis',
    description: 'Generate and edit your book synopsis',
    icon: FileText,
    view: 'synopsis' as const,
    bgClass: 'bg-sky-50',
    iconClass: 'text-sky-600',
  },
  {
    key: 'cover',
    title: 'Cover Art',
    description: 'Design an AI-generated book cover',
    icon: Image,
    view: 'cover' as const,
    bgClass: 'bg-violet-50',
    iconClass: 'text-violet-600',
  },
  {
    key: 'export',
    title: 'Export EPUB',
    description: 'Export your novel as an EPUB file',
    icon: Download,
    view: 'export' as const,
    bgClass: 'bg-orange-50',
    iconClass: 'text-orange-600',
  },
  {
    key: 'characters',
    title: 'Characters',
    description: 'Manage your story characters',
    icon: Users,
    view: null,
    bgClass: 'bg-rose-50',
    iconClass: 'text-rose-600',
  },
];

export function ProjectWorkspace() {
  const {
    selectedProject,
    setSelectedProject,
    setCurrentView,
  } = useNovelifyStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [charsOpen, setCharsOpen] = useState(false);
  const [addCharFormOpen, setAddCharFormOpen] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');
  const [newCharRole, setNewCharRole] = useState('supporting');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isAddingChar, setIsAddingChar] = useState(false);
  const [deleteCharId, setDeleteCharId] = useState<string | null>(null);
  const [isDeletingChar, setIsDeletingChar] = useState(false);

  // Fetch fresh project data
  const refreshProject = useCallback(async () => {
    if (!selectedProject) return;
    setIsRefreshing(true);
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
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedProject, setSelectedProject]);

  // Re-fetch on mount
  useEffect(() => {
    refreshProject();
  }, [refreshProject]);

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
            <BookOpen className="size-10 text-amber" />
          </div>
          <h2 className="text-2xl font-bold text-ink">No project selected</h2>
          <p className="max-w-sm text-muted-foreground">
            Select a project from the dashboard to get started
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
  const status = statusConfig[project.status] || statusConfig.draft;
  const srcLang = languageNames[project.sourceLanguage] || project.sourceLanguage;
  const tgtLang = languageNames[project.targetLanguage] || project.targetLanguage;
  const totalWords = project.chapters.reduce((sum, c) => sum + c.wordCount, 0);
  const totalChapters = project.chapters.length;
  const totalCharacters = project.characters.length;

  // Add chapter
  const handleAddChapter = async () => {
    setIsAddingChapter(true);
    try {
      const maxNum = project.chapters.reduce(
        (max, c) => Math.max(max, c.chapterNumber),
        0
      );
      const nextNum = maxNum + 1;
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
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

  // Add character
  const handleAddCharacter = async () => {
    if (!newCharName.trim()) return;
    setIsAddingChar(true);
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          name: newCharName.trim(),
          description: newCharDesc.trim(),
          role: newCharRole,
        }),
      });
      if (res.ok) {
        setNewCharName('');
        setNewCharDesc('');
        setNewCharRole('supporting');
        setAddCharFormOpen(false);
        await refreshProject();
      }
    } catch (error) {
      console.error('Failed to add character:', error);
    } finally {
      setIsAddingChar(false);
    }
  };

  // Delete character
  const handleDeleteCharacter = async () => {
    if (!deleteCharId) return;
    setIsDeletingChar(true);
    try {
      const res = await fetch(`/api/characters/${deleteCharId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshProject();
      }
    } catch (error) {
      console.error('Failed to delete character:', error);
    } finally {
      setIsDeletingChar(false);
      setDeleteCharId(null);
    }
  };

  // Navigate to action
  const handleAction = (view: string | null) => {
    if (view) {
      setCurrentView(view as 'writing' | 'translate' | 'synopsis' | 'cover' | 'export');
    } else {
      // Characters: toggle expandable section
      setCharsOpen(!charsOpen);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {project.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {project.genre && (
                  <Badge variant="secondary" className="bg-amber/10 text-amber border-amber/20">
                    {project.genre}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Languages className="size-3" />
                  {srcLang} → {tgtLang}
                </Badge>
                <Badge variant="outline" className={`text-xs ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => setCurrentView('writing')}
              className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md transition-all hover:shadow-lg"
            >
              <Sparkles className="size-4" />
              Start Writing
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber/10">
                <FileText className="size-6 text-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chapters</p>
                <p className="text-2xl font-bold text-ink">{totalChapters}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber/10">
                <BookOpen className="size-6 text-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Words</p>
                <p className="text-2xl font-bold text-ink">
                  {totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber/10">
                <Users className="size-6 text-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Characters</p>
                <p className="text-2xl font-bold text-ink">{totalCharacters}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-lg font-semibold text-ink">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actionCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                >
                  <Card
                    className="group cursor-pointer border-border/50 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-amber/30"
                    onClick={() => handleAction(card.view)}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={`flex size-11 items-center justify-center rounded-xl shrink-0 ${card.bgClass}`}>
                        <Icon className={`size-5 ${card.iconClass}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-ink group-hover:text-amber transition-colors">
                          {card.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                          {card.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Chapters List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">Chapters</h2>
            <Button
              onClick={handleAddChapter}
              disabled={isAddingChapter}
              size="sm"
              className="bg-amber hover:bg-amber/90 text-ink font-semibold"
            >
              <Plus className="size-4" />
              {isAddingChapter ? 'Adding...' : 'Add Chapter'}
            </Button>
          </div>
          {project.chapters.length === 0 ? (
            <Card className="border-border/50 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground mb-2">No chapters yet</p>
                <p className="text-sm text-muted-foreground/70">Add your first chapter to start writing</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {project.chapters
                  .sort((a, b) => a.chapterNumber - b.chapterNumber)
                  .map((chapter, index) => {
                    const chapStatus = chapterStatusConfig[chapter.status] || chapterStatusConfig.draft;
                    return (
                      <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <Card className="border-border/50 bg-white shadow-sm transition-all hover:shadow-md hover:border-amber/20">
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-amber/10 text-amber font-bold text-sm shrink-0">
                              {chapter.chapterNumber}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-ink truncate">{chapter.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {chapter.wordCount} words
                              </p>
                            </div>
                            <Badge variant="outline" className={`text-xs shrink-0 ${chapStatus.className}`}>
                              {chapStatus.label}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Character Manager Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Collapsible open={charsOpen} onOpenChange={setCharsOpen}>
            <div className="flex items-center justify-between mb-4">
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 text-lg font-semibold text-ink hover:text-amber transition-colors">
                  <Users className="size-5" />
                  Characters
                  {charsOpen ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
              <Button
                onClick={() => setAddCharFormOpen(!addCharFormOpen)}
                size="sm"
                variant="outline"
                className="border-amber/30 text-amber hover:bg-amber/10"
              >
                <Plus className="size-4" />
                Add Character
              </Button>
            </div>

            {/* Add Character Form */}
            <AnimatePresence>
              {addCharFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-4"
                >
                  <Card className="border-amber/20 bg-white shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          placeholder="Character name"
                          value={newCharName}
                          onChange={(e) => setNewCharName(e.target.value)}
                          className="border-border/50"
                        />
                        <select
                          value={newCharRole}
                          onChange={(e) => setNewCharRole(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-border/50 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="protagonist">Protagonist</option>
                          <option value="antagonist">Antagonist</option>
                          <option value="supporting">Supporting</option>
                        </select>
                      </div>
                      <Input
                        placeholder="Character description"
                        value={newCharDesc}
                        onChange={(e) => setNewCharDesc(e.target.value)}
                        className="border-border/50"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddCharFormOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddCharacter}
                          disabled={!newCharName.trim() || isAddingChar}
                          className="bg-amber hover:bg-amber/90 text-ink font-semibold"
                        >
                          {isAddingChar ? 'Adding...' : 'Add Character'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <CollapsibleContent>
              {project.characters.length === 0 ? (
                <Card className="border-border/50 bg-white shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="size-10 text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground mb-2">No characters yet</p>
                    <p className="text-sm text-muted-foreground/70">Add characters to bring your story to life</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {project.characters.map((character) => {
                    const role = roleConfig[character.role] || roleConfig.supporting;
                    return (
                      <Card key={character.id} className="border-border/50 bg-white shadow-sm transition-all hover:shadow-md hover:border-amber/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-ink">{character.name}</h4>
                              <Badge variant="outline" className={`text-xs mt-1 ${role.className}`}>
                                {role.label}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => setDeleteCharId(character.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                          {character.description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {character.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CollapsibleContent>

            {/* Show characters count when collapsed */}
            {!charsOpen && project.characters.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {project.characters.length} character{project.characters.length !== 1 ? 's' : ''} — Click to expand
              </p>
            )}
          </Collapsible>
        </motion.div>

        {/* Delete Character Confirmation */}
        <AlertDialog open={!!deleteCharId} onOpenChange={(open) => !open && setDeleteCharId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Character</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this character? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingChar}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCharacter}
                disabled={isDeletingChar}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeletingChar ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
