'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, FileText, AlignLeft, Clock, Sparkles,
  ArrowRight, MoreVertical, Trash2, Search, Bell,
  LayoutDashboard, PenTool, Languages, Image, Download,
  Settings, BookMarked, CheckCircle2, History, Globe,
  Star, TrendingUp, Target,
} from 'lucide-react';
import { useNovelifyStore, type Project, type AppView } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { CreateProjectDialog } from '@/components/novelify/create-project-dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const languageNames: Record<string, string> = {
  id: 'Indonesian', en: 'English', es: 'Spanish', fr: 'French',
  de: 'German', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
  ar: 'Arabic', pt: 'Portuguese', hi: 'Hindi',
};

const statusStyle: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'ns-draft' },
  translating: { label: 'Translating', cls: 'ns-active' },
  ready: { label: 'Ready', cls: 'ns-review' },
  exported: { label: 'Exported', cls: 'ns-active' },
};

const coverGradients = ['nc-gold', 'nc-purple', 'nc-teal'];
const iconColors: Record<string, string> = {
  gold: '#C9A96E', purple: '#A78BFA', teal: '#34D399', red: '#F87171',
};

function TimeAgo({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return <>just now</>;
  if (mins < 60) return <>{mins}m ago</>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <>{hrs}h ago</>;
  const days = Math.floor(hrs / 24);
  if (days < 7) return <>{days}d ago</>;
  return <>{new Date(date).toLocaleDateString()}</>;
}

export function Dashboard() {
  const { data: session } = useSession();
  const { projects, setProjects, setSelectedProject, setCurrentView } = useNovelifyStore();
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
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [setProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const totalChapters = projects.reduce((sum, p) => sum + p.chapters.length, 0);
  const totalWords = projects.reduce((sum, p) => sum + p.chapters.reduce((cSum, c) => cSum + c.wordCount, 0), 0);
  const completedChapters = projects.reduce((sum, p) => sum + p.chapters.filter((c) => c.status !== 'draft').length, 0);
  const streak = 9;

  const sortedProjects = useMemo(() =>
    [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projects]
  );
  const lastEdited = sortedProjects[0];

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project');
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectToDelete.id}`, { method: 'DELETE' });
      if (res.ok) await fetchProjects();
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const fmtWords = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div style={{ background: '#080808', color: '#F5F5F7', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", fontSize: 14, lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .nc-gold   { background: linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05)); }
        .nc-purple { background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.05)); }
        .nc-teal   { background: linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.04)); }
        .ns-active  { background: rgba(52,211,153,0.12); color: #34D399; border: 1px solid rgba(52,211,153,0.2); }
        .ns-draft   { background: rgba(142,142,147,0.1); color: #8E8E93; border: 1px solid rgba(255,255,255,0.11); }
        .ns-review  { background: rgba(167,139,250,0.10); color: #A78BFA; border: 1px solid rgba(167,139,250,0.2); }
      `}</style>

      {/* Topbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 60, background: 'rgba(8,8,8,0.80)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.01em' }}>My Novels</h1>
          <p style={{ fontSize: 11, color: '#8E8E93', marginTop: 1 }}>Your literary universe in one place</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ width: 34, height: 34, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8E8E93', flexShrink: 0 }} title="Search">
            <Search style={{ width: 16, height: 16 }} />
          </button>
          <button style={{ width: 34, height: 34, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8E8E93', flexShrink: 0 }} title="Notifications">
            <Bell style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={() => setCreateDialogOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#C9A96E', color: '#1a0f00', fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E8C98A'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#C9A96E'}
          >
            <Plus style={{ width: 14, height: 14 }} /> New Project
          </button>
        </div>
      </header>

        {/* Page Body */}
        <div style={{ padding: '28px 28px 48px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { icon: BookMarked, color: 'gold', label: 'Total Projects', value: projects.length, delta: `+${Math.min(projects.length, 1)} this month` },
              { icon: FileText, color: 'purple', label: 'Total Chapters', value: totalChapters, delta: `+${Math.min(totalChapters, 6)} this week` },
              { icon: AlignLeft, color: 'teal', label: 'Total Words', value: fmtWords(totalWords), delta: '+1,240 today' },
              { icon: Clock, color: 'red', label: 'Day Streak', value: streak, delta: 'Personal best!' },
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              const c = iconColors[stat.color];
              return (
                <div key={i} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'border-color .2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${c}1A`, border: `1px solid ${c}33`, color: c }}>
                    <StatIcon style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      {isLoading ? '—' : stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 3 }}>{stat.label}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, marginTop: 6, padding: '2px 7px', borderRadius: 8, background: 'rgba(52,211,153,0.08)', color: '#34D399', border: '1px solid rgba(52,211,153,0.15)' }}>
                      <TrendingUp style={{ width: 10, height: 10 }} /> {stat.delta}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Novels Grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7', display: 'flex', alignItems: 'center', gap: 8 }}>
                Active Projects
                <span style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 8, fontSize: 10, fontWeight: 600, color: '#8E8E93', padding: '1px 7px' }}>{projects.length}</span>
              </span>
              <a href="#" style={{ fontSize: 12, color: '#C9A96E', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>View all →</a>
            </div>

            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ height: 96, background: 'rgba(255,255,255,0.03)' }} />
                    <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ height: 14, width: '70%', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
                      <div style={{ height: 11, width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 12 }}>
                <div style={{ width: 52, height: 52, background: 'rgba(201,169,110,0.10)', border: '1px solid rgba(201,169,110,0.20)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A96E' }}>
                  <BookOpen style={{ width: 24, height: 24 }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#F5F5F7' }}>No novels yet</div>
                <div style={{ fontSize: 12, color: '#8E8E93', maxWidth: 260, lineHeight: 1.6 }}>Create your first novel project to get started</div>
                <button onClick={() => setCreateDialogOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#C9A96E', color: '#1a0f00', fontSize: 12, fontWeight: 700, padding: '10px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', marginTop: 4 }}
                >
                  <Plus style={{ width: 13, height: 13 }} /> Create Novel
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {sortedProjects.map((project, i) => {
                  const st = statusStyle[project.status] || statusStyle.draft;
                  const cc = project.chapters.length;
                  const wc = project.chapters.reduce((s, c) => s + c.wordCount, 0);
                  const rc = project.chapters.filter((c) => c.status !== 'draft').length;
                  const pct = cc ? Math.round((rc / cc) * 100) : 0;
                  const grad = coverGradients[i % coverGradients.length];

                  return (
                    <div key={project.id}
                      style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s, transform .2s, box-shadow .2s', display: 'flex', flexDirection: 'column' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ height: 96, position: 'relative', overflow: 'hidden', background: project.coverImage ? '#000' : undefined }} className={project.coverImage ? '' : grad}>
                        {project.coverImage ? (
                          <img src={project.coverImage} alt={project.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.7 }}>
                            <BookOpen style={{ width: 36, height: 36, color: iconColors.gold }} />
                          </div>
                        )}
                        <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 8, letterSpacing: '0.04em', textTransform: 'uppercase', ...(() => { const s = st.cls; if (s === 'ns-active') return { background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }; if (s === 'ns-review') return { background: 'rgba(167,139,250,0.10)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.2)' }; return { background: 'rgba(142,142,147,0.1)', color: '#8E8E93', border: '1px solid rgba(255,255,255,0.11)' }; })() }}>
                          {st.label}
                        </span>
                      </div>

                      <div onClick={() => handleOpenProject(project)} style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>{project.title}</div>
                        <div style={{ fontSize: 11, color: '#8E8E93', marginBottom: 12 }}>{languageNames[project.sourceLanguage] || project.sourceLanguage}{project.sourceLanguage !== project.targetLanguage ? ` → ${languageNames[project.targetLanguage] || project.targetLanguage}` : ''}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#636366' }}>
                            <FileText style={{ width: 11, height: 11 }} /> Ch. {cc}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#636366' }}>
                            <Clock style={{ width: 11, height: 11 }} /> <TimeAgo date={project.updatedAt} />
                          </span>
                        </div>
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                          <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #C9A96E, #E8C98A)', transition: 'width .6s ease', width: `${pct}%` }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <span style={{ fontSize: 10, color: '#636366' }}>{fmtWords(wc)} words</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#C9A96E' }}>{pct}%</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <button onClick={() => { setSelectedProject(project); setCurrentView('writing'); }}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#8E8E93', fontSize: 10, fontWeight: 500, cursor: 'pointer' }}
                        ><CheckCircle2 style={{ width: 11, height: 11 }} /> Write</button>
                        <button onClick={() => { setSelectedProject(project); setCurrentView('translation' as AppView); }}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#8E8E93', fontSize: 10, fontWeight: 500, cursor: 'pointer' }}
                        ><Globe style={{ width: 11, height: 11 }} /> Translate</button>
                        <button onClick={() => { setSelectedProject(project); setCurrentView('publishing' as AppView); }}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#8E8E93', fontSize: 10, fontWeight: 500, cursor: 'pointer' }}
                        ><Download style={{ width: 11, height: 11 }} /> Export</button>
                        <button onClick={() => { setProjectToDelete(project); setDeleteDialogOpen(true); }}
                          style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#F87171', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        ><Trash2 style={{ width: 11, height: 11 }} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Grid: Activity + Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>
            {/* Activity Feed */}
            <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>Recent Activity</span>
                <a href="#" style={{ fontSize: 12, color: '#C9A96E', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>All →</a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { icon: PenTool, color: 'gold', title: 'Chapter 14 saved', sub: 'Shadows of Batavia · 1,240 words added', time: '2m ago' },
                  { icon: Languages, color: 'purple', title: 'Translation exported', sub: 'Last Cartographer · German (DE)', time: '1h ago' },
                  { icon: Sparkles, color: 'teal', title: 'AI synopsis generated', sub: 'Shadows of Batavia · 3 variants', time: '3h ago' },
                  { icon: Image, color: 'red', title: 'Cover art generated', sub: 'The Last Cartographer · 4 variants', time: 'Yesterday' },
                  { icon: Download, color: 'gold', title: 'EPUB exported', sub: 'Shadows of Batavia · KDP ready', time: '2d ago' },
                ].map((act, i) => {
                  const c = iconColors[act.color];
                  const ActIcon = act.icon;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${c}1A`, border: `1px solid ${c}33`, color: c }}>
                        <ActIcon style={{ width: 14, height: 14 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#F5F5F7', fontWeight: 500 }}>{act.title}</div>
                        <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.sub}</div>
                      </div>
                      <div style={{ fontSize: 10, color: '#636366', whiteSpace: 'nowrap', flexShrink: 0 }}>{act.time}</div>
                    </div>
                  );
                })}
              </div>

              {/* Streak */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: '#8E8E93' }}>Writing streak</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#C9A96E' }}>🔥 {streak} days</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 4 }}>
                  {Array.from({ length: 14 }).map((_, i) => {
                    const level = i < 8 ? Math.floor(Math.random() * 3) + 1 : 0;
                    return (
                      <div key={i} style={{
                        aspectRatio: 1, borderRadius: 4,
                        background: level === 3 ? '#C9A96E' : level === 2 ? 'rgba(201,169,110,0.50)' : level === 1 ? 'rgba(201,169,110,0.25)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${level === 3 ? '#E8C98A' : level > 0 ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      }} />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Quick Actions + Goal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Quick Actions */}
              <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>Quick Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                  {[
                    { icon: PenTool, color: 'gold', label: 'Continue writing', sub: lastEdited ? `${lastEdited.title} · Ch.${lastEdited.chapters.length}` : 'No projects yet' },
                    { icon: Languages, color: 'purple', label: 'Translate a chapter', sub: '48+ languages available' },
                    { icon: Image, color: 'teal', label: 'Generate cover art', sub: 'AI-powered, KDP ready' },
                    { icon: Download, color: 'red', label: 'Export EPUB', sub: 'Direct to Amazon KDP' },
                  ].map((qa, i) => {
                    const c = iconColors[qa.color];
                    const QaIcon = qa.icon;
                    return (
                      <button key={i}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 12, background: '#161616', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', transition: 'background .15s, border-color .15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#1c1c1e'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#161616'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${c}1A`, border: `1px solid ${c}33`, color: c }}>
                          <QaIcon style={{ width: 15, height: 15 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#F5F5F7' }}>{qa.label}</div>
                          <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 1 }}>{qa.sub}</div>
                        </div>
                        <div style={{ color: '#636366' }}>
                          <ArrowRight style={{ width: 13, height: 13 }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Goal */}
              <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>Today&apos;s Goal</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
                  <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                    <svg width="64" height="64" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#C9A96E" strokeWidth="5" strokeLinecap="round" strokeDasharray="163" strokeDashoffset="49" style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#C9A96E' }}>70%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7' }}>700 / 1,000 words</div>
                    <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 3 }}>300 words to hit your daily target</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                  {[{ num: streak, sub: 'Day streak' }, { num: fmtWords(totalWords), sub: 'Total words' }, { num: '42', sub: 'Days active' }].map((g, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>{g.num}</div>
                      <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 1 }}>{g.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Novel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span style={{ fontWeight: 600, color: '#F5F5F7' }}>{projectToDelete?.title}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}
              style={{ background: '#F87171', color: '#fff' }}
            >{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
