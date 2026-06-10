'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Plus, FileText, AlignLeft, Clock, Sparkles,
  Search, Bell, PenTool, Languages, Image, Download,
  CheckCircle2, Target, BookMarked,
  FileEdit, Megaphone, Layers, Lightbulb, Upload,
  Quote, Wand2, TextSelect,
} from 'lucide-react';
import { useNovelifyStore, type Project } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CreateNovelWizard } from '@/components/novelify/create-novel-wizard';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MetricCard, SectionHeader, ProgressBar, StatusBadge, EmptyState,
  Card, FadeIn, QuickActionBtn, GlassButton, colors, iconColors, fmtWords, timeAgo, progressPct,
} from './dashboard-components';

const languageNames: Record<string, string> = {
  id: 'Indonesian', en: 'English', es: 'Spanish', fr: 'French',
  de: 'German', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
  ar: 'Arabic', pt: 'Portuguese', hi: 'Hindi',
};

const aiTools = [
  { icon: Lightbulb, label: 'Generate Idea', view: 'ai-cowriter', color: 'gold' },
  { icon: PenTool, label: 'Continue Chapter', view: 'ai-cowriter', color: 'amber' },
  { icon: Wand2, label: 'Rewrite Scene', view: 'ai-cowriter', color: 'purple' },
  { icon: Quote, label: 'Improve Dialogue', view: 'ai-cowriter', color: 'blue' },
  { icon: TextSelect, label: 'Fix Pacing', view: 'ai-cowriter', color: 'teal' },
  { icon: FileText, label: 'Generate Synopsis', view: 'ai-cowriter', color: 'pink' },
  { icon: Languages, label: 'Translate Chapter', view: 'translation', color: 'emerald' },
  { icon: BookMarked, label: 'Create Blurb', view: 'ai-cowriter', color: 'red' },
  { icon: Megaphone, label: 'Marketing Caption', view: 'marketing', color: 'gold' },
];

const templates = [
  { name: 'Romance', genre: 'Romance', desc: 'Meet-cute, conflict, resolution' },
  { name: 'Fantasy', genre: 'Fantasy', desc: 'World-building, quest, climax' },
  { name: 'Mystery', genre: 'Mystery', desc: 'Crime, investigation, twist' },
  { name: 'Young Adult', genre: 'YA', desc: 'Coming-of-age, voice-driven' },
  { name: 'Webnovel', genre: 'Webnovel', desc: 'Serialized, fast-paced' },
  { name: 'Light Novel', genre: 'Light Novel', desc: 'Japanese-style, illustrated' },
  { name: 'Hero\'s Journey', genre: 'Adventure', desc: 'Campbell\'s monomyth' },
  { name: 'Save the Cat', genre: 'General', desc: 'Beat sheet structure' },
  { name: 'Three-Act', genre: 'General', desc: 'Setup, confrontation, resolution' },
  { name: 'Blank Novel', genre: 'General', desc: 'Start from scratch' },
];

const publishChecklist = [
  { key: 'draft', label: 'Draft completed', icon: PenTool },
  { key: 'revised', label: 'Revision completed', icon: FileEdit },
  { key: 'cover', label: 'Cover ready', icon: Image },
  { key: 'synopsis', label: 'Synopsis ready', icon: FileText },
  { key: 'blurb', label: 'Blurb ready', icon: BookMarked },
  { key: 'epub', label: 'EPUB export ready', icon: Download },
  { key: 'translation', label: 'Translation ready', icon: Languages },
];

export function CommandCenter() {
  const router = useRouter();
  const { data: session } = useSession();
  const { projects, setProjects, setSelectedProject, setCurrentView } = useNovelifyStore();
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(1000);
  const [wordsToday, setWordsToday] = useState(0);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) setProjects(await res.json());
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, [setProjects]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ─── Derived metrics ───
  const totalProjects = projects.length;
  const totalChapters = projects.reduce((s, p) => s + p.chapters.length, 0);
  const totalWords = projects.reduce((s, p) => s + p.chapters.reduce((cs, c) => cs + c.wordCount, 0), 0);
  const completedChs = projects.reduce((s, p) => s + p.chapters.filter((c) => c.status !== 'draft').length, 0);
  const activeProjects = projects.filter((p) => p.status === 'draft' || p.status === 'translating').length;
  const readyProjects = projects.filter((p) => p.status === 'ready' || p.status === 'exported').length;

  const sortedProjects = useMemo(() =>
    [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projects]
  );
  const lastEdited = sortedProjects[0];
  const lastChapter = lastEdited?.chapters?.length ? lastEdited.chapters[lastEdited.chapters.length - 1] : null;
  const avgChapterLength = totalChapters > 0 ? Math.round(totalWords / totalChapters) : 0;
  const readingTime = Math.ceil(totalWords / 250);
  const longestProject = [...projects].sort((a, b) => {
    const wa = a.chapters.reduce((s, c) => s + c.wordCount, 0);
    const wb = b.chapters.reduce((s, c) => s + c.wordCount, 0);
    return wb - wa;
  })[0];

  // Publish readiness
  const checklistStatus = publishChecklist.map((item) => {
    const project = lastEdited;
    if (!project) return { ...item, done: false };
    switch (item.key) {
      case 'draft': return { ...item, done: project.chapters.length > 0 && project.chapters.some((c) => c.contentOriginal.length > 0) };
      case 'revised': return { ...item, done: project.chapters.some((c) => c.status !== 'draft') };
      case 'cover': return { ...item, done: !!project.coverImage };
      case 'synopsis': return { ...item, done: !!project.plotOutline };
      case 'blurb': return { ...item, done: false };
      case 'epub': return { ...item, done: project.chapters.length > 0 };
      case 'translation': return { ...item, done: project.chapters.some((c) => c.contentTranslated) };
      default: return { ...item, done: false };
    }
  });
  const publishPct = Math.round((checklistStatus.filter((c) => c.done).length / checklistStatus.length) * 100);

  const navigate = (view: string, project?: Project | null) => {
    if (project) setSelectedProject(project);
    setCurrentView(view as any);
    const base = '/dashboard';
    const routes: Record<string, string> = {
      'writing': `${base}/writing/${project?.id}`,
      'story-bible': `${base}/bible/${project?.id}`,
      'plot-board': `${base}/plot/${project?.id}`,
      'revision': `${base}/revision/${project?.id}`,
      'translation': `${base}/translation/${project?.id}`,
      'translation-studio': `${base}/translation/${project?.id}`,
      'publishing': `${base}/publishing/${project?.id}`,
      'my-novels': `${base}/novels`,
      'ai-cowriter': `${base}/ai`,
      'templates': `${base}/templates`,
      'marketing': `${base}/marketing`,
      'synopsis': `${base}/ai`,
      'writing-goals': `${base}`,
      'analytics': `${base}`,
      'cover-studio': `${base}/publishing`,
      'research': `${base}/bible`,
      'settings': `${base}/settings`,
    };
    router.push(routes[view] || base);
  };

  const handleOpenProject = (p: Project) => { navigate('project', p); };
  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectToDelete.id}`, { method: 'DELETE' });
      if (res.ok) await fetchProjects();
    } catch { /* ignore */ }
    finally { setIsDeleting(false); setDeleteOpen(false); setProjectToDelete(null); }
  };

  return (
    <div style={{ background: colors.darkBg, color: '#F5F5F7', fontSize: 14, lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {/* ─── Topbar ─── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 60, background: 'rgba(8,8,8,0.80)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.border}` }}>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.01em' }}>Dashboard</h1>
          <p style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {session?.user?.name || 'Writer'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ width: 34, height: 34, borderRadius: '50%', background: '#161616', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.muted }} title="Search"><Search style={{ width: 16, height: 16 }} /></button>
          <button style={{ width: 34, height: 34, borderRadius: '50%', background: '#161616', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.muted }} title="Notifications"><Bell style={{ width: 16, height: 16 }} /></button>
          <GlassButton onClick={() => setCreateOpen(true)}><Plus style={{ width: 14, height: 14 }} /> New Novel</GlassButton>
        </div>
      </header>

      <div style={{ padding: '24px 28px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ─── A. Welcome + Quick Actions ─── */}
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', background: 'linear-gradient(135deg, rgba(201,169,110,0.08), rgba(201,169,110,0.02))', border: `1px solid ${colors.goldBorder}`, borderRadius: 20, padding: '24px 28px' }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
                {lastEdited ? `Continue "${lastEdited.title}"` : 'Welcome to Novelify'}
              </h2>
              <p style={{ fontSize: 12, color: colors.muted, lineHeight: 1.6 }}>
                {lastChapter
                  ? `Chapter ${lastChapter.chapterNumber}: ${lastChapter.title} · ${avgChapterLength > 0 ? `${fmtWords(lastChapter.wordCount)} words · Last saved ${timeAgo(lastChapter.updatedAt)}` : 'Start writing your next chapter'}`
                  : lastEdited
                    ? `${lastEdited.chapters.length} chapters · ${fmtWords(totalWords)} total words · Ready to add more?`
                    : 'Create your first novel and start writing today'}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                {lastEdited && (
                  <GlassButton onClick={() => navigate('writing', lastEdited)}>
                    <PenTool style={{ width: 13, height: 13 }} /> Continue Writing
                  </GlassButton>
                )}
                <GlassButton onClick={() => setCreateOpen(true)}>
                  <Plus style={{ width: 13, height: 13 }} /> Create New Novel
                </GlassButton>
                <button onClick={() => router.push('/dashboard/import')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 20, border: `1px solid ${colors.border}`, background: '#161616', color: '#aeaeb2', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'background .15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1c1c1e'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#161616'}
                ><Upload style={{ width: 13, height: 13 }} /> Import Novel</button>
                <button onClick={() => navigate('ai-cowriter')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 20, border: `1px solid ${colors.goldBorder}`, background: 'rgba(201,169,110,0.06)', color: colors.gold, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,169,110,0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201,169,110,0.06)'}
                ><Sparkles style={{ width: 13, height: 13 }} /> AI Co-Writer</button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ─── B. Writing Progress Overview ─── */}
        <FadeIn delay={0.05}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            <MetricCard icon={BookOpen} label="Active Novels" value={totalProjects} sub={`${activeProjects} in progress`} color="gold" loading={isLoading} />
            <MetricCard icon={AlignLeft} label="Total Words" value={fmtWords(totalWords)} sub={`${fmtWords(wordsToday)} today`} color="teal" loading={isLoading} />
            <MetricCard icon={Clock} label="Today Written" value={fmtWords(wordsToday)} sub={`of ${fmtWords(dailyGoal)} goal`} color="amber" loading={isLoading} />
            <MetricCard icon={Target} label="Writing Streak" value="0" sub="Start today!" color="purple" />
            <MetricCard icon={FileText} label="In Progress" value={activeProjects} sub="active drafts" color="blue" />
            <MetricCard icon={CheckCircle2} label="Ready to Publish" value={readyProjects} sub="manuscripts done" color="emerald" />
          </div>
        </FadeIn>

        {/* ─── C. Continue Writing Card ─── */}
        {lastEdited && (
          <FadeIn delay={0.08}>
            <Card hover onClick={() => navigate('writing', lastEdited)}>
              <div style={{ display: 'flex', gap: 20, padding: 20, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: lastEdited.coverImage ? `url(${lastEdited.coverImage}) center/cover` : 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${colors.goldBorder}` }}>
                  {!lastEdited.coverImage && <BookOpen style={{ width: 24, height: 24, color: colors.gold }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Continue Writing</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F5F5F7' }}>{lastEdited.title}</div>
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                    {lastChapter ? `Chapter ${lastChapter.chapterNumber}: ${lastChapter.title}` : `${lastEdited.chapters.length} chapters`}
                    {' · '}Last saved {lastEdited.updatedAt ? timeAgo(lastEdited.updatedAt) : 'never'}
                  </div>
                  <div style={{ marginTop: 8, maxWidth: 400 }}>
                    <ProgressBar pct={progressPct(lastEdited.chapters.reduce((s, c) => s + c.wordCount, 0), lastEdited.wordTarget)} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.muted, marginTop: 4 }}>
                      <span>{fmtWords(lastEdited.chapters.reduce((s, c) => s + c.wordCount, 0))} words</span>
                      <span style={{ color: colors.gold }}>{progressPct(lastEdited.chapters.reduce((s, c) => s + c.wordCount, 0), lastEdited.wordTarget)}%</span>
                    </div>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <PenTool style={{ width: 20, height: 20, color: colors.gold }} />
                </div>
              </div>
            </Card>
          </FadeIn>
        )}

        {/* ─── D. Active Projects ─── */}
        <FadeIn delay={0.1}>
          <div>
            <SectionHeader title="Active Projects" count={totalProjects} action={<a href="#" onClick={() => navigate('my-novels')} style={{ fontSize: 12, color: colors.gold, cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>View all →</a>} />
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ height: 96, background: 'rgba(255,255,255,0.03)' }} />
                    <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ height: 14, width: '70%', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
                      <div style={{ height: 11, width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : totalProjects === 0 ? (
              <EmptyState icon={BookOpen} title="No novels yet" desc="Create your first novel project to get started" action={<GlassButton onClick={() => setCreateOpen(true)}><Plus style={{ width: 13, height: 13 }} /> Create Novel</GlassButton>} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {sortedProjects.slice(0, 6).map((project, i) => {
                  const wc = project.chapters.reduce((s, c) => s + c.wordCount, 0);
                  const cc = project.chapters.length;
                  const rc = project.chapters.filter((c) => c.status !== 'draft').length;
                  const pct = cc ? Math.round((rc / cc) * 100) : 0;
                  const hasCover = !!project.coverImage;

                  return (
                    <div key={project.id} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color .2s, transform .2s, box-shadow .2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.borderLight; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ height: 80, position: 'relative', overflow: 'hidden', background: hasCover ? '#000' : i % 3 === 0 ? 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))' : i % 3 === 1 ? 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.05))' : 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.04))' }}>
                        {hasCover ? <img src={project.coverImage || ''} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}><BookOpen style={{ width: 32, height: 32, color: colors.gold }} /></div>}
                        <span style={{ position: 'absolute', top: 8, right: 8 }}><StatusBadge status={project.status} /></span>
                      </div>
                      <div onClick={() => handleOpenProject(project)} style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{project.title}</div>
                        <div style={{ fontSize: 10, color: colors.muted, marginBottom: 8 }}>{project.genre || 'General'} · {languageNames[project.sourceLanguage] || project.sourceLanguage}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#636366' }}><FileText style={{ width: 10, height: 10 }} /> {cc} ch</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#636366' }}><Clock style={{ width: 10, height: 10 }} /> {timeAgo(project.updatedAt)}</span>
                        </div>
                        <ProgressBar pct={pct} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.muted, marginTop: 4 }}>
                          <span>{fmtWords(wc)} words</span>
                          <span style={{ color: colors.gold }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderTop: `1px solid ${colors.border}` }}>
                        {[
                          { icon: PenTool, label: 'Write', view: 'writing' },
                          { icon: BookMarked, label: 'Bible', view: 'story-bible' },
                          { icon: Languages, label: 'Translate', view: 'translation' },
                          { icon: Download, label: 'Export', view: 'publishing' },
                          { icon: Sparkles, label: 'AI', view: 'ai-cowriter' },
                        ].map((act: { icon: any; label: string; view: string }) => (
                          <button key={act.label} onClick={(e) => { e.stopPropagation(); navigate(act.view, project); }}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '5px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border}`, color: colors.muted, fontSize: 9, fontWeight: 500, cursor: 'pointer' }}
                          ><act.icon style={{ width: 10, height: 10 }} /> {act.label}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FadeIn>

        {/* ─── Bottom Grid ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* E. Daily Goal */}
            <FadeIn delay={0.12}>
              <div style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.06), rgba(201,169,110,0.01))', border: `1px solid ${colors.goldBorder}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>Today's Goal</span>
                  <button onClick={() => navigate('writing-goals')} style={{ fontSize: 11, color: colors.gold, cursor: 'pointer', fontWeight: 500, background: 'none', border: 'none' }}>Edit goal →</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                      <circle cx="36" cy="36" r="30" fill="none" stroke={colors.gold} strokeWidth="5" strokeLinecap="round" strokeDasharray="188" strokeDashoffset={188 * (1 - Math.min(1, wordsToday / dailyGoal))} style={{ transform: 'rotate(-90deg)', transformOrigin: '36px 36px', transition: 'stroke-dashoffset .6s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: colors.gold }}>{Math.min(100, Math.round((wordsToday / dailyGoal) * 100))}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#F5F5F7' }}>{fmtWords(wordsToday)} / {fmtWords(dailyGoal)} words</div>
                    <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      {wordsToday >= dailyGoal ? '🎉 Goal completed! Amazing work!' : `${fmtWords(dailyGoal - wordsToday)} words to hit your target`}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* F. Quick AI Tools */}
            <FadeIn delay={0.14}>
              <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20 }}>
                <SectionHeader title="AI Tools" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {aiTools.map((tool) => {
                    const Icon = tool.icon;
                    const c = iconColors[tool.color] || colors.gold;
                    return (
                      <button key={tool.label} onClick={() => navigate(tool.view, lastEdited)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 12, background: '#161616', border: `1px solid ${colors.border}`, cursor: 'pointer', textAlign: 'center', transition: 'background .15s, border-color .15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#1c1c1e'; e.currentTarget.style.borderColor = `${c}33`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#161616'; e.currentTarget.style.borderColor = colors.border; }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${c}1A`, color: c }}>
                          <Icon style={{ width: 14, height: 14 }} />
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 500, color: '#aeaeb2', lineHeight: 1.2 }}>{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* G. Publishing Readiness */}
            <FadeIn delay={0.16}>
              <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20 }}>
                <SectionHeader title="Publishing Readiness" action={<span style={{ fontSize: 14, fontWeight: 700, color: colors.gold }}>{publishPct}%</span>} />
                <div style={{ marginBottom: 12 }}><ProgressBar pct={publishPct} height={4} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {checklistStatus.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: item.done ? '#34D399' : '#636366' }}>
                        <div style={{ width: 18, height: 18, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.done ? 'rgba(52,211,153,0.12)' : 'rgba(142,142,147,0.1)', border: `1px solid ${item.done ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                          {item.done ? <CheckCircle2 style={{ width: 11, height: 11 }} /> : <Icon style={{ width: 11, height: 11 }} />}
                        </div>
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* H. Recent Activity */}
            <FadeIn delay={0.13}>
              <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20 }}>
                <SectionHeader title="Recent Activity" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { icon: PenTool, color: 'gold', title: lastEdited ? `"${lastEdited.title}" updated` : 'No recent activity', sub: lastChapter ? `Chapter ${lastChapter.chapterNumber} · ${fmtWords(lastChapter.wordCount)} words` : 'Create your first chapter', time: lastEdited ? timeAgo(lastEdited.updatedAt) : '' },
                    { icon: Download, color: 'red', title: 'EPUB exports', sub: `${projects.length} project${projects.length !== 1 ? 's' : ''} available for export`, time: '' },
                    { icon: Languages, color: 'purple', title: 'Translation ready', sub: projects.some((p) => p.chapters.some((c) => c.contentTranslated)) ? 'Some chapters translated' : 'No translations yet', time: '' },
                    { icon: Image, color: 'teal', title: 'Cover art', sub: projects.filter((p) => p.coverImage).length > 0 ? `${projects.filter((p) => p.coverImage).length} covers uploaded` : 'Upload your first cover', time: '' },
                  ].map((act, i) => {
                    const c = iconColors[act.color] || colors.gold;
                    const ActIcon = act.icon;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? `1px solid ${colors.border}` : 'none' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${c}1A`, border: `1px solid ${c}33`, color: c }}>
                          <ActIcon style={{ width: 13, height: 13 }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: '#F5F5F7', fontWeight: 500 }}>{act.title}</div>
                          <div style={{ fontSize: 10, color: colors.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.sub}</div>
                        </div>
                        {act.time && <div style={{ fontSize: 9, color: '#636366', whiteSpace: 'nowrap' }}>{act.time}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* I. Templates */}
            <FadeIn delay={0.15}>
              <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20 }}>
                <SectionHeader title="Templates" action={<button onClick={() => navigate('templates')} style={{ fontSize: 11, color: colors.gold, cursor: 'pointer', fontWeight: 500, background: 'none', border: 'none' }}>All →</button>} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {templates.map((t) => (
                    <button key={t.name} onClick={() => navigate('templates')}
                      style={{ display: 'flex', flexDirection: 'column', padding: '10px 12px', borderRadius: 10, background: '#161616', border: `1px solid ${colors.border}`, cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.border}
                    >
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#F5F5F7' }}>{t.name}</span>
                      <span style={{ fontSize: 9, color: colors.gold, marginTop: 1 }}>{t.genre}</span>
                      <span style={{ fontSize: 9, color: colors.muted, marginTop: 1, lineHeight: 1.3 }}>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* J. Writer Insights */}
            <FadeIn delay={0.17}>
              <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20 }}>
                <SectionHeader title="Writer Insights" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Avg Chapter Length', value: `${fmtWords(avgChapterLength)} words` },
                    { label: 'Estimated Reading', value: `${readingTime} min` },
                    { label: 'Most Active', value: longestProject?.title || 'N/A' },
                    { label: 'Longest MS', value: longestProject ? fmtWords(longestProject.chapters.reduce((s, c) => s + c.wordCount, 0)) : '0' },
                  ].map((ins) => (
                    <div key={ins.label} style={{ padding: '10px 12px', borderRadius: 10, background: '#161616', border: `1px solid ${colors.border}` }}>
                      <div style={{ fontSize: 9, color: colors.muted, marginBottom: 2 }}>{ins.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{ins.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  {[
                    { label: 'Drafts', value: projects.reduce((s, p) => s + p.chapters.filter((c) => c.status === 'draft').length, 0), color: '#636366' },
                    { label: 'Revised', value: projects.reduce((s, p) => s + p.chapters.filter((c) => c.status !== 'draft').length, 0), color: '#A78BFA' },
                    { label: 'Ready', value: readyProjects, color: '#34D399' },
                  ].map((seg) => (
                    <div key={seg.label} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: seg.color }}>{seg.value}</div>
                      <div style={{ fontSize: 9, color: colors.muted }}>{seg.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </div>

      {createOpen && <CreateNovelWizard onClose={() => setCreateOpen(false)} />}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Novel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span style={{ fontWeight: 600, color: '#F5F5F7' }}>{projectToDelete?.title}</span>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} style={{ background: '#F87171', color: '#fff' }}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
