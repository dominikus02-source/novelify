'use client';

import {
  BookOpen, FileText, Layout, Sparkles, Target, FileEdit, Languages,
  Download, Image as ImageIcon, Layers, BookMarked, Megaphone,
  Plus, Search, Clock, PenTool, Globe,
  Lightbulb, Quote, Wand2, Award, Star, Users, Map,
  CheckCircle2, AlignLeft,
} from 'lucide-react';
import { useNovelifyStore, type Project } from '@/lib/store';
import { ContextualFeatureReveal } from './contextual-feature-reveal';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  colors, iconColors, MetricCard, SectionHeader, ProgressBar, StatusBadge,
  EmptyState, Card, FadeIn, QuickActionBtn, GlassButton, FeaturePlaceholder,
  PageHeader, fmtWords, timeAgo,
} from './dashboard-components';

function useNav() {
  const router = useRouter();
  const { setSelectedProject, setCurrentView, projects, selectedProject } = useNovelifyStore();

  const go = (view: string, project?: Project | null) => {
    if (project) setSelectedProject(project);
    setCurrentView(view as any);
    const base = '/dashboard';
    const routes: Record<string, string> = {
      'writing': `${base}/writing/${project?.id || selectedProject?.id}`,
      'story-bible': `${base}/bible/${project?.id || selectedProject?.id}`,
      'plot-board': `${base}/plot/${project?.id || selectedProject?.id}`,
      'revision': `${base}/revision/${project?.id || selectedProject?.id}`,
      'translation': `${base}/translation/${project?.id || selectedProject?.id}`,
      'translation-studio': `${base}/translation/${project?.id || selectedProject?.id}`,
      'publishing': `${base}/publishing/${project?.id || selectedProject?.id}`,
      'my-novels': `${base}/novels`,
      'ai-cowriter': `${base}/ai`,
      'templates': `${base}/templates`,
      'marketing': `${base}/marketing`,
      'synopsis': `${base}/ai`,
      'export': `${base}/publishing/${project?.id || selectedProject?.id}`,
      'cover': `${base}/publishing/${project?.id || selectedProject?.id}`,
      'translate': `${base}/translation/${project?.id || selectedProject?.id}`,
      'project': `${base}/novels`,
      'settings': `${base}/settings`,
    };
    router.push(routes[view] || base);
  };

  return { go, projects, selectedProject, setSelectedProject };
}

// ═══════════════════════════════════════════
// My Novels
// ═══════════════════════════════════════════
export function MyNovelsPage() {
  const { go, projects, setSelectedProject } = useNav();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (filter !== 'all') list = list.filter((p) => p.status === filter);
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [projects, search, filter]);

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="My Novels" subtitle={`${projects.length} novel${projects.length !== 1 ? 's' : ''}`}
        action={<GlassButton onClick={() => go('templates')}><Plus style={{ width: 13, height: 13 }} /> Create New Novel</GlassButton>}
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'draft', 'translating', 'ready', 'exported'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: `1px solid ${filter === s ? colors.goldBorder : colors.border}`, background: filter === s ? 'rgba(201,169,110,0.10)' : '#161616', color: filter === s ? colors.gold : '#8E8E93' }}
          >{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#636366' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search novels..." style={{ padding: '7px 12px 7px 30px', borderRadius: 20, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', fontSize: 12, outline: 'none', width: 200 }} />
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No novels found" desc={search ? 'Try a different search term' : 'Create your first novel to get started'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 14 }}>
          {filtered.map((project) => {
            const wc = project.chapters.reduce((s, c) => s + c.wordCount, 0);
            return (
              <Card key={project.id} hover onClick={() => go('writing', project)}>
                <div style={{ height: 120, background: project.coverImage ? `url(${project.coverImage}) center/cover` : 'linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.03))', position: 'relative' }}>
                  {!project.coverImage && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><BookOpen style={{ width: 32, height: 32, color: colors.gold, opacity: 0.5 }} /></div>}
                  <div style={{ position: 'absolute', top: 8, right: 8 }}><StatusBadge status={project.status} /></div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7', marginBottom: 2 }}>{project.title}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginBottom: 8 }}>{project.genre || 'General'} · {wc.toLocaleString()} words</div>
                  <ProgressBar pct={project.wordTarget > 0 ? Math.min(100, Math.round((wc / project.wordTarget) * 100)) : 0} />
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 6 }}>{project.chapters.length} chapters · Updated {timeAgo(project.updatedAt)}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Story Bible (full implementation)
// ═══════════════════════════════════════════
export { StoryBiblePage } from './story-bible';

// ═══════════════════════════════════════════
// Plot Board (full implementation)
// ═══════════════════════════════════════════
export { PlotBoardPage } from './plot-board';

// ═══════════════════════════════════════════
// AI Co-Writer
// ═══════════════════════════════════════════
export function AICoWriterPage() {
  const { go, projects, selectedProject, setSelectedProject } = useNav();

  const aiTools = [
    { icon: Lightbulb, label: 'Generate Novel Idea', desc: 'Get a fresh story concept with characters and plot', view: 'writing' },
    { icon: PenTool, label: 'Continue Chapter', desc: 'AI continues your current chapter naturally', view: 'writing' },
    { icon: Wand2, label: 'Rewrite Scene', desc: 'Rewrite a scene with new tone or perspective', view: 'writing' },
    { icon: Quote, label: 'Improve Dialogue', desc: 'Make dialogue more natural and distinctive', view: 'writing' },
    { icon: Globe, label: 'Review Pacing', desc: 'Adjust scene pacing for better flow', view: 'writing' },
    { icon: BookMarked, label: 'Check Continuity', desc: 'Find plot holes and consistency issues', view: 'writing' },
    { icon: FileText, label: 'Generate Synopsis', desc: 'Create a compelling story synopsis', view: 'writing' },
    { icon: Award, label: 'Generate Title', desc: 'AI suggests titles based on your story', view: 'writing' },
    { icon: Languages, label: 'Translate Text', desc: 'Translate selected text to another language', view: 'translation' },
  ];

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="AI Co-Writer" subtitle="Open any tool below — each opens in the Writing Studio where you can use AI prompts"
        action={selectedProject ? <GlassButton onClick={() => go('writing', selectedProject)}><Sparkles style={{ width: 13, height: 13 }} /> Open Writing Studio</GlassButton> : undefined}
      />
      {!selectedProject && projects.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: colors.muted, marginBottom: 10 }}>Select a project to continue:</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {projects.map((p) => (
              <button key={p.id} onClick={() => setSelectedProject(p)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', fontSize: 11, cursor: 'pointer' }}>{p.title}</button>
            ))}
          </div>
        </div>
      )}
      {!selectedProject && projects.length === 0 && (
        <div style={{ marginBottom: 20, padding: 24, borderRadius: 12, background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.1)', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 10 }}>Create your first novel to use AI writing tools.</p>
          <GlassButton onClick={() => go('my-novels')}><Plus style={{ width: 13, height: 13 }} /> Create Your First Novel</GlassButton>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          const hasProject = !!selectedProject;
          return (
            <Card key={tool.label} hover={hasProject} onClick={() => hasProject ? go(tool.view, selectedProject) : undefined}
              style={{ opacity: hasProject ? 1 : 0.5, cursor: hasProject ? 'pointer' : 'default' }}
            >
              <div style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 18, height: 18, color: colors.gold }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{tool.label}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 2, lineHeight: 1.4 }}>{tool.desc}</div>
                  {!hasProject && <div style={{ fontSize: 9, color: '#636366', marginTop: 4, fontStyle: 'italic' }}>Select a project first</div>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Revision Room
// ═══════════════════════════════════════════
export function RevisionRoomPage() {
  const { go, projects, selectedProject } = useNav();
  const p = selectedProject || projects[0];
  const revWordCount = p ? p.chapters.reduce((s: number, c: any) => s + (c.wordCount || 0), 0) : 0;
  const revChapterCount = p ? p.chapters.length : 0;

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Revision Room" subtitle="Polish your manuscript to perfection"
        action={p ? <GlassButton onClick={() => go('writing', p)}><PenTool style={{ width: 13, height: 13 }} /> Edit in Studio</GlassButton> : undefined}
      />
      {p && revWordCount < 300 && revChapterCount > 0 && (
        <div style={{ marginBottom: 16 }}>
          <ContextualFeatureReveal feature="revision" wordCount={revWordCount} chapterCount={revChapterCount} hasSynopsis={false}
            onCta={() => go('writing', p)} ctaLabel="Open Writing Studio"
          />
        </div>
      )}
      {!p || p.chapters.length === 0 ? (
        <EmptyState icon={FileEdit} title="No chapters to revise" desc="Write some chapters first, then come here to polish them" />
      ) : (
        <div>
          <div style={{ marginBottom: 16, padding: '14px 18px', borderRadius: 12, background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.1)' }}>
            <p style={{ fontSize: 12, color: '#aeaeb2', lineHeight: 1.5 }}>
              Open a chapter in the Writing Studio. Use the AI tools there to polish prose, improve dialogue, adjust pacing, and check consistency.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {[
              { icon: CheckCircle2, label: 'Review Prose', desc: 'Polish grammar, style, and flow in the editor' },
              { icon: Quote, label: 'Polish Dialogue', desc: 'Make every voice distinct and natural' },
              { icon: Wand2, label: 'Review Pacing', desc: 'Adjust rhythm and momentum as you write' },
              { icon: BookMarked, label: 'Check Continuity', desc: 'Review plot consistency in each chapter' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} hover onClick={() => go('writing', p)}>
                  <div style={{ padding: 16, display: 'flex', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: 16, height: 16, color: colors.gold }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{item.desc}</div>
                      <div style={{ fontSize: 9, color: colors.gold, marginTop: 6 }}>Open Writing Studio →</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Translation Studio
// ═══════════════════════════════════════════
export function TranslationStudioPage() {
  const { go, selectedProject } = useNav();
  const trWordCount = selectedProject
    ? selectedProject.chapters.reduce((s: number, c: any) => s + (c.wordCount || 0), 0)
    : 0;
  const trChapterCount = selectedProject ? selectedProject.chapters.length : 0;

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Translation Studio" subtitle="Translate your novel to reach global readers"
        action={selectedProject ? <GlassButton onClick={() => go('translate', selectedProject)}><Languages style={{ width: 13, height: 13 }} /> Open Translator</GlassButton> : undefined}
      />
      {!selectedProject ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ContextualFeatureReveal feature="translation" wordCount={0} chapterCount={0} hasSynopsis={false} />
          <EmptyState icon={Languages} title="Select a project" desc="Choose a project from My Novels to translate" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Card hover onClick={() => go('translate', selectedProject)}>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>Translate Chapter</div>
              <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>Translate individual chapters with AI</div>
              <div style={{ fontSize: 9, color: colors.gold, marginTop: 8 }}>{selectedProject.sourceLanguage} → {selectedProject.targetLanguage}</div>
            </div>
          </Card>
          <FeaturePlaceholder title="Batch Translation" description="Translate your entire manuscript at once"
            features={['Translate all chapters in one click', 'Translation memory and glossary', 'Professional review workflow']}
            cta="Use chapter-by-chapter translation in the meantime"
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Publishing Center (full implementation)
// ═══════════════════════════════════════════
export { PublishingCenterPage } from './publishing-center';

// ═══════════════════════════════════════════
// Templates
// ═══════════════════════════════════════════
export function TemplatesPage() {
  const templates = [
    { id: 'blank', name: 'Blank Novel', genre: 'General', desc: 'Start from scratch with empty structure', chapters: 20 },
    { id: 'romance', name: 'Romance', genre: 'Romance', desc: 'Meet-cute, conflict, dark moment, happy ending', chapters: 30 },
    { id: 'fantasy', name: 'Fantasy', genre: 'Fantasy', desc: 'World-building, mentor, quest, epic climax', chapters: 35 },
    { id: 'mystery', name: 'Mystery', genre: 'Mystery', desc: 'Crime, clues, investigation, twist reveal', chapters: 25 },
    { id: 'ya', name: 'Young Adult', genre: 'YA', desc: 'Coming-of-age, voice-driven, emotional stakes', chapters: 28 },
    { id: 'webnovel', name: 'Webnovel', genre: 'Webnovel', desc: 'Serialized format, short chapters, hooks', chapters: 50 },
    { id: 'light-novel', name: 'Light Novel', genre: 'Light Novel', desc: 'Japanese-style, illustrations, shorter prose', chapters: 15 },
    { id: 'heros-journey', name: "Hero's Journey", genre: 'Adventure', desc: "Campbell's 12-stage monomyth structure", chapters: 24 },
    { id: 'save-the-cat', name: 'Save the Cat', genre: 'General', desc: "Blake Snyder's 15-beat story structure", chapters: 20 },
    { id: 'three-act', name: 'Three-Act', genre: 'General', desc: 'Setup, confrontation, resolution classic', chapters: 24 },
  ];

  const router = useRouter();

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Novel Templates" subtitle="Start your story with a proven structure" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {templates.map((t) => (
          <Card key={t.name}>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>{t.name}</div>
              <StatusBadge status={t.genre} />
              <div style={{ fontSize: 10, color: colors.muted, marginTop: 6, lineHeight: 1.4 }}>{t.desc}</div>
              <div style={{ fontSize: 9, color: '#636366', marginTop: 6 }}>{t.chapters} chapters</div>
              <div style={{ marginTop: 12 }}>
                <button onClick={() => router.push(`/dashboard/projects/new?template=${t.id}`)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 20,
                    background: colors.gold, color: '#1a0f00',
                    fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                  }}
                >Use Template</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Writing Goals (no longer a standalone page, included for backward compat)
// ═══════════════════════════════════════════
export function WritingGoalsPage() {
  const { projects } = useNovelifyStore();
  const totalWords = projects.reduce((s, p) => s + p.chapters.reduce((cs, c) => cs + c.wordCount, 0), 0);
  const totalChs = projects.reduce((s, p) => s + p.chapters.length, 0);
  const dailyTarget = 1000;
  const wordsToday = 0;

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Writing Goals" subtitle="Track your progress and build your writing habit" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <MetricCard icon={Target} label="Daily Target" value={fmtWords(dailyTarget)} color="gold" />
        <MetricCard icon={Clock} label="Today's Words" value={fmtWords(wordsToday)} sub={`${fmtWords(dailyTarget - wordsToday)} remaining`} color="amber" />
        <MetricCard icon={Award} label="Total Achievement" value={fmtWords(totalWords)} sub={`Across ${totalChs} chapters`} color="teal" />
      </div>
      <FeaturePlaceholder title="Goal Settings & Streaks"
        description="Set daily, weekly, and project-level word count goals"
        features={['Custom daily word targets per project', 'Weekly writing goals with progress tracking', 'Writing streak calendar and statistics', 'Project deadlines with milestone tracking']}
        cta="Basic tracking is active — detailed goal features coming soon"
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// Marketing Kit
// ═══════════════════════════════════════════
export function MarketingKitPage() {
  const { go, selectedProject } = useNav();
  const mkWordCount = selectedProject
    ? selectedProject.chapters.reduce((s: number, c: any) => s + (c.wordCount || 0), 0)
    : 0;
  const mkChapterCount = selectedProject ? selectedProject.chapters.length : 0;
  const hasSynopsis = !!(selectedProject as any)?.plotOutline;

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Marketing Kit" subtitle="Everything you need to promote your novel"
        action={<GlassButton onClick={() => go('synopsis', selectedProject)}><FileText style={{ width: 13, height: 13 }} /> Generate Synopsis</GlassButton>}
      />
      <div style={{ marginBottom: 16 }}>
        <ContextualFeatureReveal feature="marketing" wordCount={mkWordCount} chapterCount={mkChapterCount} hasSynopsis={hasSynopsis}
          onCta={selectedProject ? () => go('synopsis', selectedProject) : undefined} ctaLabel="Create Synopsis"
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: BookMarked, label: 'Book Blurb', desc: 'Back-cover copy that sells', view: 'synopsis' },
          { icon: Award, label: 'Tagline', desc: 'Memorable one-line hook', view: 'synopsis' },
          { icon: FileText, label: 'Amazon Description', desc: 'KDP-optimized listing', view: 'synopsis' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} hover onClick={() => go('synopsis', selectedProject)}>
              <div style={{ padding: 16, display: 'flex', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 16, height: 16, color: colors.gold }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{item.desc}</div>
                  <div style={{ fontSize: 9, color: colors.gold, marginTop: 4 }}>Open →</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
