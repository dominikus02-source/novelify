'use client';

import {
  BookOpen, FileText, Layout, Sparkles, Target, FileEdit, Languages,
  Download, Image as ImageIcon, Layers, BookMarked, BarChart3, Megaphone,
  Plus, Search, Clock, ArrowRight, CheckCircle2, PenTool, Globe,
  Trash2, Lightbulb, Quote, Wand2, Award, Star, Users, Map,
  FolderTree, ScrollText, MessageSquarePlus,
} from 'lucide-react';
import { useNovelifyStore, type Project } from '@/lib/store';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  colors, iconColors, MetricCard, SectionHeader, ProgressBar, StatusBadge,
  EmptyState, Card, FadeIn, QuickActionBtn, GlassButton, FeaturePlaceholder,
  PageHeader, fmtWords, timeAgo,
} from './dashboard-components';

// ═══════════════════════════════════════════
// My Novels
// ═══════════════════════════════════════════
export function MyNovelsPage() {
  const { projects, setSelectedProject, setCurrentView } = useNovelifyStore();
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
      <PageHeader title="My Novels" subtitle={`${projects.length} novel${projects.length !== 1 ? 's' : ''}`} />
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {filtered.map((project) => {
            const wc = project.chapters.reduce((s, c) => s + c.wordCount, 0);
            return (
              <Card key={project.id} hover onClick={() => { setSelectedProject(project); setCurrentView('project'); }}>
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
// Story Bible
// ═══════════════════════════════════════════
export function StoryBiblePage() {
  const { selectedProject, setSelectedProject, setCurrentView, projects } = useNovelifyStore();
  const [tab, setTab] = useState<'characters' | 'locations' | 'timeline' | 'lore'>('characters');

  if (!selectedProject) {
    return (
      <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
        <PageHeader title="Story Bible" subtitle="Build your story's foundation" />
        {projects.length === 0 ? (
          <EmptyState icon={BookMarked} title="No projects yet" desc="Create a novel to start building your story bible" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {projects.map((p) => (
              <Card key={p.id} hover onClick={() => { setSelectedProject(p); }}>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{p.chapters.length} chapters · {p.characters.length} characters</div>
                  <GlassButton small onClick={() => { setSelectedProject(p); }} style={{ marginTop: 10 }}>Open Bible</GlassButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const p = selectedProject;
  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title={`Story Bible: ${p.title}`} subtitle={`${p.characters.length} characters · ${p.chapters.length} chapters`}
        action={<GlassButton onClick={() => setCurrentView('writing')}><PenTool style={{ width: 13, height: 13 }} /> Open Writing Studio</GlassButton>}
      />
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['characters', 'locations', 'timeline', 'lore'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: `1px solid ${tab === t ? colors.goldBorder : colors.border}`, background: tab === t ? 'rgba(201,169,110,0.10)' : '#161616', color: tab === t ? colors.gold : '#8E8E93' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'characters' && (
        <div>
          <SectionHeader title="Characters" count={p.characters.length} />
          {p.characters.length === 0 ? (
            <EmptyState icon={Users} title="No characters yet" desc="Add characters to your story bible" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {p.characters.map((ch) => (
                <Card key={ch.id}>
                  <div style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.gold, fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{ch.name.charAt(0)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{ch.name}</div>
                      <StatusBadge status={ch.role} />
                      {ch.description && <div style={{ fontSize: 10, color: colors.muted, marginTop: 4, lineHeight: 1.4 }}>{ch.description}</div>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === 'locations' && <FeaturePlaceholder title="Locations" description="Map out the world your story lives in" features={['Track key locations across your story', 'Add descriptions, history, and significance', 'Link locations to specific chapters and scenes']} cta="Coming soon — start by adding notes in Story Bible" />}
      {tab === 'timeline' && <FeaturePlaceholder title="Timeline" description="Keep your story's chronology straight" features={['Visual timeline of story events', 'Track character arcs across chapters', 'Avoid continuity errors with date tracking']} cta="Coming soon — your chapters are the foundation" />}
      {tab === 'lore' && <FeaturePlaceholder title="Lore & Worldbuilding" description="Document the rules and history of your world" features={['Worldbuilding notes and rules', 'Magic systems, technology, and culture', 'History, politics, and geography']} cta="Coming soon — add worldbuilding notes from Writing Studio" />}
    </div>
  );
}

// ═══════════════════════════════════════════
// Plot Board
// ═══════════════════════════════════════════
export function PlotBoardPage() {
  const { selectedProject, setSelectedProject, setCurrentView, projects } = useNovelifyStore();

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Plot Board" subtitle="Visualize your story structure" />
      {!selectedProject ? (
        projects.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {projects.map((p) => (
              <Card key={p.id} hover onClick={() => { setSelectedProject(p); }}>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{p.chapters.length} chapters</div>
                  <GlassButton small onClick={() => setSelectedProject(p)} style={{ marginTop: 10 }}>Open Plot Board</GlassButton>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon={Layout} title="No projects yet" desc="Create a novel to start plotting" />
        )
      ) : (
        <FeaturePlaceholder title={`Plot Board: ${selectedProject.title}`}
          description="Visualize your chapters and scenes on a story arc board"
          features={[
            'Drag-and-drop scene reordering',
            'Three-act structure visualization',
            'Hero\'s journey beat sheet',
            'Chapter-by-chapter outline view',
            'Scene cards with status, POV, and word count',
          ]}
          cta="This feature is coming soon — your chapters are already structured in Writing Studio"
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// AI Co-Writer
// ═══════════════════════════════════════════
export function AICoWriterPage() {
  const { setCurrentView, selectedProject, projects, setSelectedProject } = useNovelifyStore();

  const aiTools = [
    { icon: Lightbulb, label: 'Generate Novel Idea', desc: 'Get a fresh story concept with characters and plot', view: 'writing' as const },
    { icon: PenTool, label: 'Continue Chapter', desc: 'AI continues your current chapter naturally', view: 'writing' as const },
    { icon: Wand2, label: 'Rewrite Scene', desc: 'Rewrite a scene with new tone or perspective', view: 'writing' as const },
    { icon: Quote, label: 'Improve Dialogue', desc: 'Make dialogue more natural and distinctive', view: 'writing' as const },
    { icon: FileText, label: 'Fix Pacing', desc: 'Adjust scene pacing for better flow', view: 'writing' as const },
    { icon: BookMarked, label: 'Check Continuity', desc: 'Find plot holes and consistency issues', view: 'writing' as const },
    { icon: MessageSquarePlus, label: 'Generate Synopsis', desc: 'Create a compelling story synopsis', view: 'synopsis' as const },
    { icon: Award, label: 'Generate Title', desc: 'AI suggests titles based on your story', view: 'synopsis' as const },
    { icon: Globe, label: 'Translate Text', desc: 'Translate selected text to another language', view: 'translation-studio' as const },
  ];

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="AI Co-Writer" subtitle="Your creative partner for every stage of writing"
        action={<GlassButton onClick={() => { if (selectedProject) setCurrentView('writing'); }}><Sparkles style={{ width: 13, height: 13 }} /> Open Writing Studio</GlassButton>}
      />
      {!selectedProject && projects.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: colors.muted, marginBottom: 10 }}>Select a project to use AI tools:</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {projects.map((p) => (
              <button key={p.id} onClick={() => setSelectedProject(p)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', fontSize: 11, cursor: 'pointer' }}>{p.title}</button>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.label} hover onClick={() => setCurrentView(tool.view)}>
              <div style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 18, height: 18, color: colors.gold }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{tool.label}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 2, lineHeight: 1.4 }}>{tool.desc}</div>
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
// Writing Goals
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
        features={[
          'Custom daily word targets per project',
          'Weekly writing goals with progress tracking',
          'Writing streak calendar and statistics',
          'Project deadlines with milestone tracking',
          'Real-time progress notifications',
        ]}
        cta="Basic tracking is active — detailed goal features coming soon"
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// Revision Room
// ═══════════════════════════════════════════
export function RevisionRoomPage() {
  const { selectedProject, setSelectedProject, setCurrentView, projects } = useNovelifyStore();
  const p = selectedProject || projects[0];

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Revision Room" subtitle="Polish your manuscript to perfection"
        action={p ? <GlassButton onClick={() => { setSelectedProject(p); setCurrentView('writing'); }}><PenTool style={{ width: 13, height: 13 }} /> Edit in Studio</GlassButton> : undefined}
      />
      {!p || p.chapters.length === 0 ? (
        <EmptyState icon={FileEdit} title="No chapters to revise" desc="Write some chapters first, then come here to polish them" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            { icon: CheckCircle2, label: 'AI Prose Check', desc: 'Polish grammar, style, and flow' },
            { icon: Quote, label: 'Dialogue Check', desc: 'Make every voice distinct and natural' },
            { icon: Wand2, label: 'Pacing Check', desc: 'Ensure rhythm and momentum are right' },
            { icon: FileText, label: 'Repetition Check', desc: 'Find overused words and phrases' },
            { icon: BookMarked, label: 'Continuity Check', desc: 'Catch plot holes and inconsistencies' },
            { icon: Star, label: 'Style Enhancement', desc: 'Elevate prose to match your target genre' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} hover onClick={() => setCurrentView('writing')}>
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
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Translation Studio
// ═══════════════════════════════════════════
export function TranslationStudioPage() {
  const { setCurrentView, selectedProject } = useNovelifyStore();

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Translation Studio" subtitle="Translate your novel to reach global readers"
        action={<GlassButton onClick={() => setCurrentView('translate')}><Languages style={{ width: 13, height: 13 }} /> Open Translator</GlassButton>}
      />
      {!selectedProject && (
        <EmptyState icon={Languages} title="Select a project" desc="Choose a project from My Novels to translate" />
      )}
      {selectedProject && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Card hover onClick={() => setCurrentView('translate')}>
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
// Publishing Center
// ═══════════════════════════════════════════
export function PublishingCenterPage() {
  const { setCurrentView, selectedProject } = useNovelifyStore();

  const items = [
    { icon: Download, label: 'EPUB Export', desc: 'Ebook for Apple Books, Google Play, Kobo', view: 'export' as const },
    { icon: FileText, label: 'PDF Export', desc: 'Print-ready manuscript', view: 'export' as const },
    { icon: FileEdit, label: 'Front Matter', desc: 'Title page, copyright, dedication' },
    { icon: User, label: 'Author Bio', desc: 'About the author page' },
    { icon: BookMarked, label: 'Book Description', desc: 'KDP and retailer descriptions' },
    { icon: CheckCircle2, label: 'KDP Checklist', desc: 'Pre-publish quality checklist' },
  ];

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Publishing Center" subtitle="Prepare your manuscript for the world" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const v = 'view' in item ? item.view : undefined;
          return (
            <Card key={item.label} hover onClick={() => v && setCurrentView(v)}>
              <div style={{ padding: 16, display: 'flex', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 16, height: 16, color: colors.gold }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{item.desc}</div>
                  {v ? <div style={{ fontSize: 9, color: colors.gold, marginTop: 4 }}>Open →</div> : <div style={{ fontSize: 9, color: '#636366', marginTop: 4, fontStyle: 'italic' }}>Coming soon</div>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Import for Publishing
const User = Users;

// ═══════════════════════════════════════════
// Cover Studio
// ═══════════════════════════════════════════
export function CoverStudioPage() {
  const { setCurrentView } = useNovelifyStore();

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Cover Studio" subtitle="Design your book cover"
        action={<GlassButton onClick={() => setCurrentView('cover')}><ImageIcon style={{ width: 13, height: 13 }} /> Open Cover Manager</GlassButton>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <Card hover onClick={() => setCurrentView('cover')}>
          <div style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ImageIcon style={{ width: 22, height: 22, color: colors.gold }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>Upload Cover</div>
              <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>Upload your Canva-designed cover</div>
            </div>
          </div>
        </Card>
        <FeaturePlaceholder title="Cover History" description="Track all your cover versions"
          features={['Version history of all cover uploads', 'KDP dimension presets and guides', 'Cover mockup preview with your title']}
          cta="Upload your first cover to get started"
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Templates
// ═══════════════════════════════════════════
export function TemplatesPage() {
  const templates = [
    { name: 'Blank Novel', genre: 'General', desc: 'Start from scratch with empty structure', chapters: 20 },
    { name: 'Romance', genre: 'Romance', desc: 'Meet-cute, conflict, dark moment, happy ending', chapters: 30 },
    { name: 'Fantasy', genre: 'Fantasy', desc: 'World-building, mentor, quest, epic climax', chapters: 35 },
    { name: 'Mystery', genre: 'Mystery', desc: 'Crime, clues, investigation, twist reveal', chapters: 25 },
    { name: 'Young Adult', genre: 'YA', desc: 'Coming-of-age, voice-driven, emotional stakes', chapters: 28 },
    { name: 'Webnovel', genre: 'Webnovel', desc: 'Serialized format, short chapters, hooks', chapters: 50 },
    { name: 'Light Novel', genre: 'Light Novel', desc: 'Japanese-style, illustrations, shorter prose', chapters: 15 },
    { name: 'Hero\'s Journey', genre: 'Adventure', desc: 'Campbell\'s 12-stage monomyth structure', chapters: 24 },
    { name: 'Save the Cat', genre: 'General', desc: 'Blake Snyder\'s 15-beat story structure', chapters: 20 },
    { name: 'Three-Act', genre: 'General', desc: 'Setup, confrontation, resolution classic', chapters: 24 },
  ];

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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Research Vault
// ═══════════════════════════════════════════
export function ResearchVaultPage() {
  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Research Vault" subtitle="Your story research, organized" />
      <FeaturePlaceholder title="All Your Research in One Place"
        description="Collect and organize research for your novels"
        features={[
          'Save notes and research links per project',
          'Character inspiration boards and reference images',
          'Location research with maps and cultural notes',
          'Historical facts and cultural references library',
          'AI-powered summaries from your research notes',
        ]}
        cta="Start adding research notes from your Writing Studio"
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// Analytics
// ═══════════════════════════════════════════
export function AnalyticsPage() {
  const { projects } = useNovelifyStore();
  const totalWords = projects.reduce((s, p) => s + p.chapters.reduce((cs, c) => cs + c.wordCount, 0), 0);
  const totalChs = projects.reduce((s, p) => s + p.chapters.length, 0);
  const avgCh = totalChs > 0 ? Math.round(totalWords / totalChs) : 0;
  const readingTime = Math.ceil(totalWords / 250);

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Analytics" subtitle="Understand your writing patterns" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <MetricCard icon={AlignLeft} label="Total Words" value={fmtWords(totalWords)} color="gold" />
        <MetricCard icon={FileText} label="Total Chapters" value={totalChs} color="purple" />
        <MetricCard icon={BookOpen} label="Avg Chapter" value={`${fmtWords(avgCh)} words`} color="teal" />
        <MetricCard icon={Clock} label="Reading Time" value={`${readingTime} min`} color="amber" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FeaturePlaceholder title="Writing Activity" description="Your writing patterns over time"
          features={['Words written per day/week/month chart', 'Most productive days and times', 'Writing streak heatmap']}
          cta="Data will populate as you write more"
        />
        <FeaturePlaceholder title="Story Analytics" description="Deep insights into your manuscript"
          features={['Dialogue vs narration ratio analysis', 'Character appearance frequency', 'Chapter length distribution chart', 'Word frequency and readability score']}
          cta="Coming soon — powered by AI analysis"
        />
      </div>
    </div>
  );
}

// Re-import for Analytics
const AlignLeft2 = FileText;

// ═══════════════════════════════════════════
// Marketing Kit
// ═══════════════════════════════════════════
export function MarketingKitPage() {
  const { setCurrentView } = useNovelifyStore();

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title="Marketing Kit" subtitle="Everything you need to promote your novel"
        action={<GlassButton onClick={() => setCurrentView('synopsis')}><FileText style={{ width: 13, height: 13 }} /> Generate Synopsis</GlassButton>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: BookMarked, label: 'Book Blurb', desc: 'Back-cover copy that sells', view: 'synopsis' as const },
          { icon: Award, label: 'Tagline', desc: 'Memorable one-line hook', view: 'synopsis' as const },
          { icon: FileText, label: 'Amazon Description', desc: 'KDP-optimized listing', view: 'synopsis' as const },
          { icon: Megaphone, label: 'Social Captions', desc: 'For TikTok, IG, Twitter', view: 'marketing' as const },
          { icon: Star, label: 'Launch Announcement', desc: 'Coming-soon template' },
          { icon: Users, label: 'Author Bio', desc: 'About the author page' },
        ].map((item) => {
          const Icon = item.icon;
          const v = 'view' in item ? item.view : undefined;
          return (
            <Card key={item.label} hover onClick={() => v && setCurrentView(v)}>
              <div style={{ padding: 16, display: 'flex', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 16, height: 16, color: colors.gold }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{item.desc}</div>
                  {v ? <div style={{ fontSize: 9, color: colors.gold, marginTop: 4 }}>Open →</div> : <div style={{ fontSize: 9, color: '#636366', marginTop: 4, fontStyle: 'italic' }}>Coming soon</div>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
