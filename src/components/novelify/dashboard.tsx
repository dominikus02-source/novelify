'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  History,
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

const languageNames: Record<string, string> = {
  id: 'Indonesian', en: 'English', es: 'Spanish', fr: 'French',
  de: 'German', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
  ar: 'Arabic', pt: 'Portuguese', hi: 'Hindi',
};

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  translating: { label: 'Translating', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  ready: { label: 'Ready', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  exported: { label: 'Exported', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const h = 32; const w = 80;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      <polygon fill={`${color}15`} points={`0,${h} ${pts} ${w},${h}`} />
    </svg>
  );
}

function TimeAgo({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return <span>just now</span>;
  if (mins < 60) return <span>{mins}m ago</span>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <span>{hrs}h ago</span>;
  const days = Math.floor(hrs / 24);
  if (days < 7) return <span>{days}d ago</span>;
  return <span>{new Date(date).toLocaleDateString()}</span>;
}

function ActivityHeatmap() {
  const weeks = 12;
  const days = weeks * 7;
  const mockData = useMemo(() =>
    Array.from({ length: days }, () => Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0)
  , []);

  const intensity = (v: number) => {
    if (v === 0) return 'bg-zinc-800';
    if (v <= 1) return 'bg-amber-900/40';
    if (v <= 2) return 'bg-amber-700/50';
    if (v <= 3) return 'bg-amber-600/60';
    return 'bg-amber-500/70';
  };

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: weeks }, (_, w) => (
        <div key={w} className="flex flex-col gap-0.5">
          {Array.from({ length: 7 }, (_, d) => {
            const idx = d * weeks + w;
            return (
              <div
                key={d}
                className={`h-2.5 w-2.5 rounded-sm ${intensity(mockData[idx] || 0)}`}
                title={`${mockData[idx] || 0} activities`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const {
    projects, setProjects, setSelectedProject, setCurrentView,
  } = useNovelifyStore();

  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const totalChapters = projects.reduce((sum, p) => sum + p.chapters.length, 0);
  const totalWords = projects.reduce((sum, p) => sum + p.chapters.reduce((cSum, c) => cSum + c.wordCount, 0), 0);
  const completedChapters = projects.reduce((sum, p) => sum + p.chapters.filter((c) => c.status !== 'draft').length, 0);

  const mockChartData = useMemo(() =>
    [3, 7, 4, 9, 12, 8, 15, 11, 14, 18, 13, 16, 20, 17], []
  );
  const mockWordData = useMemo(() =>
    [120, 450, 300, 890, 1200, 750, 1600, 1100, 1400, 2000, 1500, 1800, 2200, 1900], []
  );

  const sortedProjects = useMemo(() =>
    [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projects]
  );

  const lastEditedProject = sortedProjects[0];

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project');
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectToDelete.id}`, { method: 'DELETE' });
      if (res.ok) await fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const formatWordCount = (count: number): string =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">My Novels</h1>
            <p className="mt-1 text-muted-foreground">Your literary universe in one place</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}
            className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md transition-all hover:shadow-lg" size="lg"
          >
            <Plus className="size-5" /> New Project
          </Button>
        </motion.div>

        {/* ─── Stats Bar with Sparklines ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4"
        >
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber/10">
                    <BookMarked className="size-5 text-amber" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Projects</p>
                    <p className="text-xl font-bold text-ink">{isLoading ? <Skeleton className="inline-block h-6 w-10" /> : projects.length}</p>
                  </div>
                </div>
                <Sparkline data={[2, 3, 1, 4, 5, 3, 6, 4, 5, 7, 6, 8, 9, 7]} color="#C8873A" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber/10">
                    <FileText className="size-5 text-amber" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Chapters</p>
                    <p className="text-xl font-bold text-ink">{isLoading ? <Skeleton className="inline-block h-6 w-10" /> : totalChapters}</p>
                  </div>
                </div>
                <Sparkline data={mockChartData} color="#60A5FA" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber/10">
                    <AlignLeft className="size-5 text-amber" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Words</p>
                    <p className="text-xl font-bold text-ink">{isLoading ? <Skeleton className="inline-block h-6 w-16" /> : formatWordCount(totalWords)}</p>
                  </div>
                </div>
                <Sparkline data={mockWordData} color="#34D399" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber/10">
                    <CheckCircle2 className="size-5 text-amber" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold text-ink">
                      {isLoading ? <Skeleton className="inline-block h-6 w-10" /> : completedChapters}
                      <span className="text-sm text-muted-foreground font-normal"> / {totalChapters}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="h-2 w-16 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber" style={{ width: totalChapters ? `${(completedChapters / totalChapters) * 100}%` : '0%' }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{totalChapters ? Math.round((completedChapters / totalChapters) * 100) : 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Quick Actions ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="mb-3 text-sm font-semibold text-ink uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button onClick={() => setCreateDialogOpen(true)}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber/30"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber/10">
                <Plus className="size-5 text-amber" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink group-hover:text-amber transition-colors">New Project</p>
                <p className="text-xs text-muted-foreground">Start a new novel</p>
              </div>
              <ArrowRight className="ml-auto size-4 text-muted-foreground group-hover:text-amber transition-colors" />
            </button>

            <button
              onClick={() => {
                if (lastEditedProject) {
                  setSelectedProject(lastEditedProject);
                  setCurrentView('writing');
                }
              }}
              disabled={!lastEditedProject}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber/30 disabled:opacity-40 disabled:pointer-events-none"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber/10">
                <Sparkles className="size-5 text-amber" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink group-hover:text-amber transition-colors">Continue Writing</p>
                <p className="text-xs text-muted-foreground">{lastEditedProject ? lastEditedProject.title : 'No projects yet'}</p>
              </div>
              <ArrowRight className="ml-auto size-4 text-muted-foreground group-hover:text-amber transition-colors" />
            </button>

            <button
              onClick={() => {
                if (lastEditedProject) {
                  setSelectedProject(lastEditedProject);
                  setCurrentView('project');
                }
              }}
              disabled={!lastEditedProject}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber/30 disabled:opacity-40 disabled:pointer-events-none"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber/10">
                <History className="size-5 text-amber" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink group-hover:text-amber transition-colors">Recent Activity</p>
                <p className="text-xs text-muted-foreground">{lastEditedProject ? <TimeAgo date={lastEditedProject.updatedAt} /> : 'No activity'}</p>
              </div>
              <ArrowRight className="ml-auto size-4 text-muted-foreground group-hover:text-amber transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* ─── Activity Heatmap ─── */}
        {!isLoading && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-border/50 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-amber" />
                    <span className="text-sm font-semibold text-ink">Writing Streak</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">Less <span className="h-2.5 w-2.5 rounded-sm bg-zinc-800 inline-block" /></span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-900/40 inline-block" /></span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-700/50 inline-block" /></span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-600/60 inline-block" /></span>
                    <span className="flex items-center gap-1">More <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/70 inline-block" /></span>
                  </div>
                </div>
                <ActivityHeatmap />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>12 weeks</span>
                  <span className="flex items-center gap-1"><TrendingUp className="size-3 text-emerald-500" /> 3-day streak</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Project Grid ─── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-border/50 bg-white">
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-20" /></div>
                </div>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-20 text-center"
          >
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-amber/10">
              <BookOpen className="size-10 text-amber" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-ink">No novels yet</h2>
            <p className="mb-8 max-w-sm text-muted-foreground">Create your first novel project to get started</p>
            <Button onClick={() => setCreateDialogOpen(true)}
              className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md transition-all hover:shadow-lg" size="lg"
            >
              <Plus className="size-5" /> Create Novel
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">All Novels</h2>
              <span className="text-xs text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {projects.map((project, index) => {
                  const status = statusConfig[project.status] || statusConfig.draft;
                  const chapterCount = project.chapters.length;
                  const wordCount = project.chapters.reduce((sum, c) => sum + c.wordCount, 0);
                  const reviewedChapters = project.chapters.filter((c) => c.status !== 'draft').length;
                  const progressPct = chapterCount ? Math.round((reviewedChapters / chapterCount) * 100) : 0;
                  const srcLang = languageNames[project.sourceLanguage] || project.sourceLanguage;
                  const tgtLang = languageNames[project.targetLanguage] || project.targetLanguage;

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
                        <div className="relative h-40 w-full overflow-hidden" onClick={() => handleOpenProject(project)}>
                          {project.coverImage ? (
                            <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber/20 via-amber/10 to-paper">
                              <BookOpen className="size-12 text-amber/40" />
                            </div>
                          )}
                          {project.genre && (
                            <div className="absolute left-3 top-3">
                              <Badge variant="secondary" className="bg-white/90 text-ink backdrop-blur-sm shadow-sm">{project.genre}</Badge>
                            </div>
                          )}
                          {/* Progress bar overlay */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                            <div className="h-full bg-amber transition-all" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="mb-3" onClick={() => handleOpenProject(project)}>
                            <h3 className="mb-1.5 text-lg font-bold text-ink line-clamp-1 group-hover:text-amber transition-colors">{project.title}</h3>
                            <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Languages className="size-3.5" />
                              <span>{srcLang} → {tgtLang}</span>
                            </div>
                            <Badge variant="outline" className={`text-xs ${status.className}`}>{status.label}</Badge>
                          </div>

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

                          {/* Progress + Last edited */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{progressPct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full bg-amber transition-all" style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Button onClick={() => handleOpenProject(project)} variant="outline" size="sm"
                              className="border-amber/30 text-amber hover:bg-amber/10 hover:text-amber"
                            >Open</Button>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="size-3" />
                                <TimeAgo date={project.updatedAt} />
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-ink"><MoreVertical className="size-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem variant="destructive" onClick={() => { setProjectToDelete(project); setDeleteDialogOpen(true); }}>
                                    <Trash2 className="size-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Novel</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <span className="font-semibold text-ink">{projectToDelete?.title}</span>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProject} disabled={isDeleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
