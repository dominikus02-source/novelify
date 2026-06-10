'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  MoreVertical,
  Trash2,
  BookMarked,
  FileText,
  AlignLeft,
  Languages,
} from 'lucide-react';
import { useNovelifyStore, type Project } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { CreateProjectDialog } from '@/components/novelify/create-project-dialog';

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
  ready: { label: 'Ready', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  exported: { label: 'Exported', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export function Dashboard() {
  const {
    projects,
    setProjects,
    setSelectedProject,
    setCurrentView,
  } = useNovelifyStore();

  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch projects on mount
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setProjects]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  // Compute stats
  const totalProjects = projects.length;
  const totalChapters = projects.reduce((sum, p) => sum + p.chapters.length, 0);
  const totalWords = projects.reduce(
    (sum, p) => sum + p.chapters.reduce((cSum, c) => cSum + c.wordCount, 0),
    0
  );

  // Open project
  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project');
  };

  // Delete project
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  // Format word count
  const formatWordCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              My Novels
            </h1>
            <p className="mt-1 text-muted-foreground">
              Your literary universe in one place
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md transition-all hover:shadow-lg"
            size="lg"
          >
            <Plus className="size-5" />
            New Project
          </Button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber/10">
                <BookMarked className="size-6 text-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-ink">
                  {isLoading ? (
                    <Skeleton className="inline-block h-8 w-10" />
                  ) : (
                    totalProjects
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber/10">
                <FileText className="size-6 text-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Chapters</p>
                <p className="text-2xl font-bold text-ink">
                  {isLoading ? (
                    <Skeleton className="inline-block h-8 w-10" />
                  ) : (
                    totalChapters
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber/10">
                <AlignLeft className="size-6 text-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Words</p>
                <p className="text-2xl font-bold text-ink">
                  {isLoading ? (
                    <Skeleton className="inline-block h-8 w-16" />
                  ) : (
                    formatWordCount(totalWords)
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-border/50 bg-white">
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-20 text-center"
          >
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-amber/10">
              <BookOpen className="size-10 text-amber" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-ink">No novels yet</h2>
            <p className="mb-8 max-w-sm text-muted-foreground">
              Create your first novel project to get started
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md transition-all hover:shadow-lg"
              size="lg"
            >
              <Plus className="size-5" />
              Create Novel
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => {
                const status = statusConfig[project.status] || statusConfig.draft;
                const chapterCount = project.chapters.length;
                const wordCount = project.chapters.reduce(
                  (sum, c) => sum + c.wordCount,
                  0
                );
                const srcLang =
                  languageNames[project.sourceLanguage] || project.sourceLanguage;
                const tgtLang =
                  languageNames[project.targetLanguage] || project.targetLanguage;

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="group cursor-pointer overflow-hidden border-border/50 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-amber/30">
                      {/* Cover Image Area */}
                      <div
                        className="relative h-40 w-full overflow-hidden"
                        onClick={() => handleOpenProject(project)}
                      >
                        {project.coverImage ? (
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber/20 via-amber/10 to-paper">
                            <BookOpen className="size-12 text-amber/40" />
                          </div>
                        )}
                        {/* Genre badge overlay */}
                        {project.genre && (
                          <div className="absolute left-3 top-3">
                            <Badge
                              variant="secondary"
                              className="bg-white/90 text-ink backdrop-blur-sm shadow-sm"
                            >
                              {project.genre}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <div
                          className="mb-3"
                          onClick={() => handleOpenProject(project)}
                        >
                          <h3 className="mb-1.5 text-lg font-bold text-ink line-clamp-1 group-hover:text-amber transition-colors">
                            {project.title}
                          </h3>

                          {/* Language direction */}
                          <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Languages className="size-3.5" />
                            <span>
                              {srcLang} → {tgtLang}
                            </span>
                          </div>

                          {/* Status badge */}
                          <Badge
                            variant="outline"
                            className={`text-xs ${status.className}`}
                          >
                            {status.label}
                          </Badge>
                        </div>

                        {/* Stats row */}
                        <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="size-3.5" />
                            {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
                          </span>
                          <span className="flex items-center gap-1">
                            <AlignLeft className="size-3.5" />
                            {formatWordCount(wordCount)} words
                          </span>
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center justify-between">
                          <Button
                            onClick={() => handleOpenProject(project)}
                            variant="outline"
                            size="sm"
                            className="border-amber/30 text-amber hover:bg-amber/10 hover:text-amber"
                          >
                            Open
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-ink"
                              >
                                <MoreVertical className="size-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  setProjectToDelete(project);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Novel</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-ink">
                  {projectToDelete?.title}
                </span>
                ? This action cannot be undone. All chapters and characters will be
                permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
