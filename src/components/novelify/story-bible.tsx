'use client';

import {
  BookOpen, Users, MapPin, Clock, Globe, BookMarked, Search, Plus,
  X, Trash2, Link as LinkIcon, Target, PenTool, Quote, Swords, Heart,
  UserPlus, Save, UserCheck,
} from 'lucide-react';
import { useNovelifyStore } from '@/lib/store';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  colors, MetricCard, SectionHeader, StatusBadge,
  EmptyState, Card, FadeIn, GlassButton, PageHeader,
} from './dashboard-components';
import type { Character, Location, TimelineEvent, StoryNote, Relationship, ResearchItem } from '@/lib/store';

// ─── Types ───
type BibleTab = 'overview' | 'characters' | 'locations' | 'timeline' | 'lore' | 'research' | 'relationships' | 'objects';

interface ProjectOverview {
  premise: string | null;
  logline: string | null;
  theme: string | null;
  targetAudience: string | null;
  pov: string | null;
  tense: string | null;
  tone: string | null;
  styleGuide: string | null;
  centralConflict: string | null;
  stakes: string | null;
  endingIdea: string | null;
}

interface DrawerState<T> {
  open: boolean;
  item: T | null;
}

// ─── Constants ───
const TABS: { key: BibleTab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: BookOpen },
  { key: 'characters', label: 'Characters', icon: Users },
  { key: 'locations', label: 'Locations', icon: MapPin },
  { key: 'timeline', label: 'Timeline', icon: Clock },
  { key: 'lore', label: 'Lore', icon: Globe },
  { key: 'research', label: 'Research', icon: Search },
  { key: 'relationships', label: 'Relationships', icon: Heart },
  { key: 'objects', label: 'Objects', icon: Target },
];

const POV_OPTIONS = [
  { value: 'first_person', label: 'First Person' },
  { value: 'third_person_limited', label: 'Third Person Limited' },
  { value: 'third_person_omniscient', label: 'Third Person Omniscient' },
  { value: 'second_person', label: 'Second Person' },
];

const TENSE_OPTIONS = [
  { value: 'past', label: 'Past' },
  { value: 'present', label: 'Present' },
  { value: 'future', label: 'Future' },
];

const CHARACTER_ROLES = [
  'protagonist', 'antagonist', 'love_interest', 'mentor', 'ally',
  'rival', 'side_character', 'narrator', 'supporting',
];

const CHARACTER_STATUSES = ['alive', 'dead', 'missing', 'unknown', 'not_applicable'];

const LOCATION_TYPES = [
  'city', 'village', 'kingdom', 'house', 'school', 'workplace',
  'fantasy_realm', 'planet', 'other',
];

const IMPORTANCE_LEVELS = ['minor', 'major', 'critical'];

const TIMELINE_TYPES = ['backstory', 'main_plot', 'flashback', 'future', 'world_event'];

const LORE_CATEGORIES = [
  'lore', 'worldbuilding', 'rule', 'culture', 'magic', 'technology',
  'politics', 'history', 'creature',
];

const RELEVANCE_LEVELS = ['low', 'moderate', 'high', 'critical'];

const RELATIONSHIP_TYPES = [
  'family', 'romance', 'enemy', 'mentor', 'ally', 'rival', 'secret', 'complicated',
];

// ─── Sub Components ───

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, multiline, rows = 2, type, style: extStyle }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  multiline?: boolean; rows?: number; type?: string; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    width: '100%', background: '#161616', border: `1px solid ${colors.border}`,
    color: '#F5F5F7', fontSize: 12, padding: multiline ? '10px 12px' : '8px 12px',
    borderRadius: 10, outline: 'none', transition: 'border-color .2s',
    fontFamily: 'inherit', resize: multiline ? 'vertical' : 'none', ...extStyle,
  };
  const focusStyle = { borderColor: colors.goldBorder };
  if (multiline) {
    return (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        rows={rows} style={base}
        onFocus={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
        onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
      />
    );
  }
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      type={type || 'text'} style={base}
      onFocus={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
      onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[] | string[]; placeholder?: string;
}) {
  const opts = Array.isArray(options) ? (typeof options[0] === 'string' ? (options as string[]).map(o => ({ value: o, label: o.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) })) : options as { value: string; label: string }[]) : [];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', background: '#161616', border: `1px solid ${colors.border}`,
        color: value ? '#F5F5F7' : '#636366', fontSize: 12, padding: '8px 12px',
        borderRadius: 10, outline: 'none', cursor: 'pointer', appearance: 'none',
        fontFamily: 'inherit',
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
      onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <button onClick={onCancel} style={{
        flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${colors.border}`,
        background: '#161616', color: '#aeaeb2', fontSize: 11, cursor: 'pointer', fontWeight: 500,
      }}>Cancel</button>
      <button onClick={onConfirm} style={{
        flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
        background: '#F87171', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600,
      }}>Delete</button>
    </div>
  );
}

// ─── Drawer ───
function Drawer({ open, onClose, title, children, width = 480 }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 998 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw',
              background: colors.cardBg, borderLeft: `1px solid ${colors.border}`,
              zIndex: 999, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: `1px solid ${colors.border}`,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>{title}</span>
              <button onClick={onClose} style={{
                width: 28, height: 28, borderRadius: 8, border: 'none',
                background: '#161616', color: '#8E8E93', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── API helpers ───
async function apiGet(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function apiPost(url: string, data: any) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();
}

async function apiPatch(url: string, data: any) {
  const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

async function apiDelete(url: string) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

// ─── Main Component ───
export function StoryBiblePage() {
  const { go, projects, selectedProject, setSelectedProject } = useNav();
  const [tab, setTab] = useState<BibleTab>('overview');

  // Local data state
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [storyNotes, setStoryNotes] = useState<StoryNote[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
  const [overview, setOverview] = useState<ProjectOverview>({
    premise: null, logline: null, theme: null, targetAudience: null,
    pov: null, tense: null, tone: null, styleGuide: null,
    centralConflict: null, stakes: null, endingIdea: null,
  });
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Search/filter state
  const [charSearch, setCharSearch] = useState('');
  const [locSearch, setLocSearch] = useState('');
  const [timelineSearch, setTimelineSearch] = useState('');
  const [loreFilter, setLoreFilter] = useState('all');
  const [researchSearch, setResearchSearch] = useState('');
  const [relSearch, setRelSearch] = useState('');
  const [objSearch, setObjSearch] = useState('');

  // Drawer state
  const [charDrawer, setCharDrawer] = useState<DrawerState<Character>>({ open: false, item: null });
  const [locDrawer, setLocDrawer] = useState<DrawerState<Location>>({ open: false, item: null });
  const [timelineDrawer, setTimelineDrawer] = useState<DrawerState<TimelineEvent>>({ open: false, item: null });
  const [loreDrawer, setLoreDrawer] = useState<DrawerState<StoryNote>>({ open: false, item: null });
  const [researchDrawer, setResearchDrawer] = useState<DrawerState<ResearchItem>>({ open: false, item: null });
  const [relDrawer, setRelDrawer] = useState<DrawerState<Relationship>>({ open: false, item: null });
  const [objDrawer, setObjDrawer] = useState<DrawerState<StoryNote>>({ open: false, item: null });

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  const [loading, setLoading] = useState(true);

  const projectId = selectedProject?.id;

  // Fetch all data
  const fetchAll = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [chars, locs, events, notes, rels, research] = await Promise.all([
        apiGet(`/api/characters?projectId=${projectId}`),
        apiGet(`/api/locations?projectId=${projectId}`),
        apiGet(`/api/timeline-events?projectId=${projectId}`),
        apiGet(`/api/story-notes?projectId=${projectId}`),
        apiGet(`/api/relationships?projectId=${projectId}`),
        apiGet(`/api/research?projectId=${projectId}`),
      ]);
      setCharacters(chars);
      setLocations(locs);
      setTimelineEvents(events);
      setStoryNotes(notes);
      setRelationships(rels);
      setResearchItems(research);
    } catch (e) {
      console.error('Failed to fetch bible data', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch overview
  const fetchOverview = useCallback(async () => {
    if (!projectId) return;
    setOverviewLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setOverview({
          premise: data.premise ?? null,
          logline: data.logline ?? null,
          theme: data.theme ?? null,
          targetAudience: data.targetAudience ?? null,
          pov: data.pov ?? null,
          tense: data.tense ?? null,
          tone: data.tone ?? null,
          styleGuide: data.styleGuide ?? null,
          centralConflict: data.centralConflict ?? null,
          stakes: data.stakes ?? null,
          endingIdea: data.endingIdea ?? null,
        });
      }
    } catch (e) {
      console.error('Failed to fetch overview', e);
    } finally {
      setOverviewLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchAll(); fetchOverview(); }, [fetchAll, fetchOverview]);

  const charMap = useMemo(() => {
    const m = new Map<string, Character>();
    characters.forEach(c => m.set(c.id, c));
    return m;
  }, [characters]);

  // ─── Overview Handlers ───
  const saveOverview = useCallback(async (field: string, value: string | null) => {
    if (!projectId) return;
    try {
      await apiPatch(`/api/projects/${projectId}/overview`, { [field]: value || null });
    } catch (e) {
      console.error('Failed to save overview', e);
    }
  }, [projectId]);

  const updateOverviewField = (field: keyof ProjectOverview, value: string) => {
    setOverview(prev => ({ ...prev, [field]: value }));
    saveOverview(field, value);
  };

  // ─── Character Handlers ───
  const saveCharacter = async (data: Partial<Character>) => {
    if (!projectId) return;
    if (charDrawer.item) {
      const updated = await apiPatch(`/api/characters/${charDrawer.item.id}`, data);
      setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
    } else {
      const created = await apiPost('/api/characters', { ...data, projectId });
      setCharacters(prev => [...prev, created]);
    }
  };

  const deleteCharacter = async (id: string) => {
    await apiDelete(`/api/characters/${id}`);
    setCharacters(prev => prev.filter(c => c.id !== id));
    setDeleteTarget(null);
  };

  // ─── Location Handlers ───
  const saveLocation = async (data: Partial<Location>) => {
    if (!projectId) return;
    if (locDrawer.item) {
      const updated = await apiPatch(`/api/locations/${locDrawer.item.id}`, data);
      setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
    } else {
      const created = await apiPost('/api/locations', { ...data, projectId });
      setLocations(prev => [...prev, created]);
    }
  };

  const deleteLocation = async (id: string) => {
    await apiDelete(`/api/locations/${id}`);
    setLocations(prev => prev.filter(l => l.id !== id));
    setDeleteTarget(null);
  };

  // ─── Timeline Handlers ───
  const saveTimelineEvent = async (data: Partial<TimelineEvent>) => {
    if (!projectId) return;
    if (timelineDrawer.item) {
      const updated = await apiPatch(`/api/timeline-events/${timelineDrawer.item.id}`, data);
      setTimelineEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    } else {
      const created = await apiPost('/api/timeline-events', { ...data, projectId });
      setTimelineEvents(prev => [...prev, created]);
    }
  };

  const deleteTimelineEvent = async (id: string) => {
    await apiDelete(`/api/timeline-events/${id}`);
    setTimelineEvents(prev => prev.filter(e => e.id !== id));
    setDeleteTarget(null);
  };

  // ─── StoryNote Handlers (Lore + Objects) ───
  const saveStoryNote = async (data: Partial<StoryNote>, isObject: boolean) => {
    if (!projectId) return;
    const drawer = isObject ? objDrawer : loreDrawer;
    const setter = isObject ? setObjDrawer : setLoreDrawer;
    if (drawer.item) {
      const updated = await apiPatch(`/api/story-notes/${drawer.item.id}`, data);
      setStoryNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    } else {
      const created = await apiPost('/api/story-notes', { ...data, projectId });
      setStoryNotes(prev => [...prev, created]);
    }
  };

  const deleteStoryNote = async (id: string) => {
    await apiDelete(`/api/story-notes/${id}`);
    setStoryNotes(prev => prev.filter(n => n.id !== id));
    setDeleteTarget(null);
  };

  // ─── Relationship Handlers ───
  const saveRelationship = async (data: Partial<Relationship>) => {
    if (!projectId) return;
    if (relDrawer.item) {
      const updated = await apiPatch(`/api/relationships/${relDrawer.item.id}`, data);
      setRelationships(prev => prev.map(r => r.id === updated.id ? updated : r));
    } else {
      const created = await apiPost('/api/relationships', { ...data, projectId });
      setRelationships(prev => [...prev, created]);
    }
  };

  const deleteRelationship = async (id: string) => {
    await apiDelete(`/api/relationships/${id}`);
    setRelationships(prev => prev.filter(r => r.id !== id));
    setDeleteTarget(null);
  };

  // ─── Research Handlers ───
  const saveResearch = async (data: Partial<ResearchItem>) => {
    if (!projectId) return;
    if (researchDrawer.item) {
      const updated = await apiPatch(`/api/research/${researchDrawer.item.id}`, data);
      setResearchItems(prev => prev.map(r => r.id === updated.id ? updated : r));
    } else {
      const created = await apiPost('/api/research', { ...data, projectId });
      setResearchItems(prev => [...prev, created]);
    }
  };

  const deleteResearch = async (id: string) => {
    await apiDelete(`/api/research/${id}`);
    setResearchItems(prev => prev.filter(r => r.id !== id));
    setDeleteTarget(null);
  };

  // ─── Derived data ───
  const loreNotes = useMemo(() => storyNotes.filter(n => !n.category || n.category === 'general' || LORE_CATEGORIES.includes(n.category)), [storyNotes]);
  const objectNotes = useMemo(() => storyNotes.filter(n => n.category === 'object'), [storyNotes]);

  const totalWordCount = useMemo(() =>
    selectedProject ? selectedProject.chapters.reduce((s, c) => s + c.wordCount, 0) : 0,
    [selectedProject]
  );

  // ─── No project state ───
  if (!selectedProject) {
    return (
      <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
        <PageHeader title="Story Bible" subtitle="Build your story's foundation" />
        {projects.length === 0 ? (
          <EmptyState icon={BookMarked} title="No projects yet" desc="Create a novel to start building your story bible" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {projects.map((p) => (
              <Card key={p.id} hover onClick={() => go('story-bible', p)}>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{p.chapters.length} chapters · {p.characters.length} characters</div>
                  <div style={{ marginTop: 10 }}><GlassButton small onClick={() => go('story-bible', p)}>Open Bible</GlassButton></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const p = selectedProject;
  const statCharacters = characters.length;
  const statLocations = locations.length;
  const statTimeline = timelineEvents.length;
  const statResearch = researchItems.length;

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      {/* Header */}
      <PageHeader title={`Story Bible: ${p.title}`}
        subtitle={`${statCharacters} characters · ${p.chapters.length} chapters · ${totalWordCount.toLocaleString()} words`}
        action={
          <GlassButton onClick={() => go('writing', p)}>
            <PenTool style={{ width: 13, height: 13 }} /> Open Writing Studio
          </GlassButton>
        }
      />

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        <MetricCard icon={Users} label="Characters" value={statCharacters} color="gold" loading={loading} />
        <MetricCard icon={MapPin} label="Locations" value={statLocations} color="amber" loading={loading} />
        <MetricCard icon={Clock} label="Timeline Events" value={statTimeline} color="teal" loading={loading} />
        <MetricCard icon={BookMarked} label="Research Notes" value={statResearch} color="purple" loading={loading} />
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                cursor: 'pointer', border: `1px solid ${isActive ? colors.goldBorder : colors.border}`,
                background: isActive ? 'rgba(201,169,110,0.10)' : '#161616',
                color: isActive ? colors.gold : '#8E8E93',
                transition: 'all .15s',
              }}
            >
              <Icon style={{ width: 12, height: 12 }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── Content Area ─── */}
      {tab === 'overview' && renderOverview()}
      {tab === 'characters' && renderCharacters()}
      {tab === 'locations' && renderLocations()}
      {tab === 'timeline' && renderTimeline()}
      {tab === 'lore' && renderLore()}
      {tab === 'research' && renderResearch()}
      {tab === 'relationships' && renderRelationships()}
      {tab === 'objects' && renderObjects()}

      {/* ─── Drawers ─── */}
      {renderDrawers()}

      {/* ─── Delete Confirm Overlay ─── */}
      {deleteTarget && renderDeleteConfirm()}
    </div>
  );

  // ═══════════════════════════════════════════
  // Overview Tab
  // ═══════════════════════════════════════════
  function renderOverview() {
    if (overviewLoading) {
      return (
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} style={{ padding: 16 }}>
                <div className="skeleton-pulse" style={{ height: 12, width: '40%', background: '#2a2a2a', borderRadius: 4, marginBottom: 8 }} />
                <div className="skeleton-pulse" style={{ height: 32, width: '100%', background: '#2a2a2a', borderRadius: 6 }} />
              </Card>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[1, 2].map(i => (
              <Card key={i} style={{ padding: 16 }}>
                <div className="skeleton-pulse" style={{ height: 12, width: '30%', background: '#2a2a2a', borderRadius: 4, marginBottom: 8 }} />
                <div className="skeleton-pulse" style={{ height: 32, width: '100%', background: '#2a2a2a', borderRadius: 6 }} />
              </Card>
            ))}
          </div>
        </FadeIn>
      );
    }

    const fields: { key: keyof ProjectOverview; label: string; multiline?: boolean; rows?: number; type?: string }[] = [
      { key: 'premise', label: 'Premise', multiline: true, rows: 3 },
      { key: 'logline', label: 'Logline' },
      { key: 'theme', label: 'Theme' },
      { key: 'targetAudience', label: 'Target Audience' },
    ];

    return (
      <FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {fields.map(f => (
            <Card key={f.key} style={{ padding: 16 }}>
              <FormField label={f.label}>
                {f.multiline ? (
                  <textarea
                    value={overview[f.key] || ''}
                    onChange={(e) => updateOverviewField(f.key, e.target.value)}
                    rows={f.rows || 3}
                    placeholder={`Enter your story's ${f.label.toLowerCase()}...`}
                    style={{
                      width: '100%', background: 'transparent', border: 'none',
                      color: '#F5F5F7', fontSize: 12, outline: 'none', resize: 'vertical',
                      fontFamily: 'inherit', lineHeight: 1.6,
                    }}
                  />
                ) : (
                  <input
                    value={overview[f.key] || ''}
                    onChange={(e) => updateOverviewField(f.key, e.target.value)}
                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                    style={{
                      width: '100%', background: 'transparent', border: 'none',
                      color: '#F5F5F7', fontSize: 12, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                )}
              </FormField>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <Card style={{ padding: 16 }}>
            <FormField label="Point of View">
              <select
                value={overview.pov || ''}
                onChange={(e) => updateOverviewField('pov', e.target.value)}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: '#F5F5F7', fontSize: 12, outline: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <option value="" style={{ background: '#111' }}>Select POV...</option>
                {POV_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: '#111' }}>{o.label}</option>
                ))}
              </select>
            </FormField>
          </Card>
          <Card style={{ padding: 16 }}>
            <FormField label="Tense">
              <select
                value={overview.tense || ''}
                onChange={(e) => updateOverviewField('tense', e.target.value)}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: '#F5F5F7', fontSize: 12, outline: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <option value="" style={{ background: '#111' }}>Select tense...</option>
                {TENSE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: '#111' }}>{o.label}</option>
                ))}
              </select>
            </FormField>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card style={{ padding: 16 }}>
            <FormField label="Tone">
              <textarea
                value={overview.tone || ''}
                onChange={(e) => updateOverviewField('tone', e.target.value)}
                rows={3}
                placeholder="Describe the tone of your story..."
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: '#F5F5F7', fontSize: 12, outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', lineHeight: 1.6,
                }}
              />
            </FormField>
          </Card>
          <Card style={{ padding: 16 }}>
            <FormField label="Style Guide">
              <textarea
                value={overview.styleGuide || ''}
                onChange={(e) => updateOverviewField('styleGuide', e.target.value)}
                rows={3}
                placeholder="Writing style notes, voice guidelines..."
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: '#F5F5F7', fontSize: 12, outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', lineHeight: 1.6,
                }}
              />
            </FormField>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <Card style={{ padding: 16 }}>
            <FormField label="Central Conflict">
              <textarea
                value={overview.centralConflict || ''}
                onChange={(e) => updateOverviewField('centralConflict', e.target.value)}
                rows={3}
                placeholder="What is the central conflict of your story?"
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: '#F5F5F7', fontSize: 12, outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', lineHeight: 1.6,
                }}
              />
            </FormField>
          </Card>
          <Card style={{ padding: 16 }}>
            <FormField label="Stakes">
              <textarea
                value={overview.stakes || ''}
                onChange={(e) => updateOverviewField('stakes', e.target.value)}
                rows={3}
                placeholder="What does the protagonist stand to lose?"
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: '#F5F5F7', fontSize: 12, outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', lineHeight: 1.6,
                }}
              />
            </FormField>
          </Card>
        </div>

        <div style={{ marginTop: 14 }}>
          <Card style={{ padding: 16 }}>
            <FormField label="Ending Idea">
              <textarea
                value={overview.endingIdea || ''}
                onChange={(e) => updateOverviewField('endingIdea', e.target.value)}
                rows={2}
                placeholder="How do you envision the story ending?"
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: '#F5F5F7', fontSize: 12, outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', lineHeight: 1.6,
                }}
              />
            </FormField>
          </Card>
        </div>
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Characters Tab
  // ═══════════════════════════════════════════
  function renderCharacters() {
    const filtered = characters.filter(c =>
      c.name.toLowerCase().includes(charSearch.toLowerCase())
    );

    return (
      <FadeIn>
        <SectionHeader title="Characters" count={filtered.length}
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#636366' }} />
                <input value={charSearch} onChange={(e) => setCharSearch(e.target.value)}
                  placeholder="Search characters..."
                  style={{ padding: '6px 10px 6px 26px', borderRadius: 16, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', fontSize: 11, outline: 'none', width: 160 }}
                />
              </div>
              <GlassButton small onClick={() => setCharDrawer({ open: true, item: null })}>
                <Plus style={{ width: 11, height: 11 }} /> Add Character
              </GlassButton>
            </div>
          }
        />
        {filtered.length === 0 ? (
          <EmptyState icon={UserPlus} title="No characters yet"
            desc="Create your protagonist first. Give them a desire, a flaw, and something they are afraid to lose."
            action={<GlassButton small onClick={() => setCharDrawer({ open: true, item: null })}><Plus style={{ width: 11, height: 11 }} /> Create Character</GlassButton>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {filtered.map((ch) => (
              <Card key={ch.id} hover onClick={() => setCharDrawer({ open: true, item: ch })}>
                <div style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: ch.colorTag ? `${ch.colorTag}22` : 'rgba(201,169,110,0.10)',
                    border: ch.colorTag ? `1px solid ${ch.colorTag}44` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: ch.colorTag || colors.gold, fontSize: 14, fontWeight: 600, flexShrink: 0,
                  }}>
                    {ch.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{ch.name}</span>
                      <StatusBadge status={ch.role} />
                    </div>
                    {ch.description && (
                      <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ch.description}
                      </div>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'character', id: ch.id }); }}
                    style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Locations Tab
  // ═══════════════════════════════════════════
  function renderLocations() {
    const filtered = locations.filter(l =>
      l.name.toLowerCase().includes(locSearch.toLowerCase())
    );

    return (
      <FadeIn>
        <SectionHeader title="Locations" count={filtered.length}
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#636366' }} />
                <input value={locSearch} onChange={(e) => setLocSearch(e.target.value)}
                  placeholder="Search locations..."
                  style={{ padding: '6px 10px 6px 26px', borderRadius: 16, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', fontSize: 11, outline: 'none', width: 160 }}
                />
              </div>
              <GlassButton small onClick={() => setLocDrawer({ open: true, item: null })}>
                <Plus style={{ width: 11, height: 11 }} /> Add Location
              </GlassButton>
            </div>
          }
        />
        {filtered.length === 0 ? (
          <EmptyState icon={MapPin} title="No locations yet"
            desc="Every story needs a stage. Add the places where your novel unfolds."
            action={<GlassButton small onClick={() => setLocDrawer({ open: true, item: null })}><Plus style={{ width: 11, height: 11 }} /> Create Location</GlassButton>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {filtered.map((loc) => (
              <Card key={loc.id} hover onClick={() => setLocDrawer({ open: true, item: loc })}>
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin style={{ width: 14, height: 14, color: colors.amber }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{loc.name}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'location', id: loc.id }); }}
                      style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', padding: 4 }}>
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    <StatusBadge status={loc.importance} />
                    {loc.type && <StatusBadge status={loc.type} />}
                  </div>
                  {loc.description && (
                    <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {loc.description}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Timeline Tab
  // ═══════════════════════════════════════════
  function renderTimeline() {
    const sorted = [...timelineEvents].sort((a, b) => (a.eventDateOrOrder ?? 0) - (b.eventDateOrOrder ?? 0));
    const filtered = sorted.filter(e =>
      e.title.toLowerCase().includes(timelineSearch.toLowerCase()) ||
      e.description.toLowerCase().includes(timelineSearch.toLowerCase())
    );

    const typeColors: Record<string, string> = {
      backstory: '#8E8E93', main_plot: '#C9A96E', flashback: '#A78BFA',
      future: '#34D399', world_event: '#60A5FA',
    };

    return (
      <FadeIn>
        <SectionHeader title="Timeline" count={filtered.length}
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#636366' }} />
                <input value={timelineSearch} onChange={(e) => setTimelineSearch(e.target.value)}
                  placeholder="Search events..."
                  style={{ padding: '6px 10px 6px 26px', borderRadius: 16, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', fontSize: 11, outline: 'none', width: 160 }}
                />
              </div>
              <GlassButton small onClick={() => setTimelineDrawer({ open: true, item: null })}>
                <Plus style={{ width: 11, height: 11 }} /> Add Event
              </GlassButton>
            </div>
          }
        />
        {filtered.length === 0 ? (
          <EmptyState icon={Clock} title="No timeline events yet"
            desc="Plot your story's timeline from beginning to end. Every event matters."
            action={<GlassButton small onClick={() => setTimelineDrawer({ open: true, item: null })}><Plus style={{ width: 11, height: 11 }} /> Create Event</GlassButton>}
          />
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 1, background: colors.border }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filtered.map((e, idx) => {
                const tc = typeColors[e.type] || colors.gold;
                return (
                  <div key={e.id} style={{ display: 'flex', gap: 16, position: 'relative', padding: '10px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 24 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%', background: tc,
                        border: `2px solid ${colors.darkBg}`, zIndex: 1, flexShrink: 0,
                      }} />
                      {idx < filtered.length - 1 && <div style={{ flex: 1, width: 1, background: 'transparent' }} />}
                    </div>
                    <Card key={e.id} hover onClick={() => setTimelineDrawer({ open: true, item: e })}
                      style={{ flex: 1, cursor: 'pointer', padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{e.title}</span>
                            <StatusBadge status={e.type} />
                          </div>
                          {e.description && (
                            <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.5, marginBottom: 4 }}>
                              {e.description}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 8, fontSize: 9, color: '#636366' }}>
                            {e.eventDateOrOrder != null && <span>Order: {e.eventDateOrOrder}</span>}
                            {e.eventDateText && <span>{e.eventDateText}</span>}
                          </div>
                        </div>
                        <button onClick={(ev) => { ev.stopPropagation(); setDeleteTarget({ type: 'timeline', id: e.id }); }}
                          style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                          <Trash2 style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Lore Tab
  // ═══════════════════════════════════════════
  function renderLore() {
    const filtered = loreFilter === 'all' ? loreNotes : loreNotes.filter(n => n.category === loreFilter);
    const categories = ['all', ...LORE_CATEGORIES];

    return (
      <FadeIn>
        <SectionHeader title="Lore & Worldbuilding" count={filtered.length}
          action={
            <GlassButton small onClick={() => setLoreDrawer({ open: true, item: null })}>
              <Plus style={{ width: 11, height: 11 }} /> Add Lore Note
            </GlassButton>
          }
        />
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setLoreFilter(c)}
              style={{
                padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 500,
                cursor: 'pointer', border: `1px solid ${loreFilter === c ? colors.goldBorder : colors.border}`,
                background: loreFilter === c ? 'rgba(201,169,110,0.10)' : '#161616',
                color: loreFilter === c ? colors.gold : '#8E8E93',
              }}
            >{c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={Globe} title="No lore notes yet"
            desc="Document the rules, magic, history, and cultures that make your world unique."
            action={<GlassButton small onClick={() => setLoreDrawer({ open: true, item: null })}><Plus style={{ width: 11, height: 11 }} /> Create Lore Note</GlassButton>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {filtered.map((note) => (
              <Card key={note.id} hover onClick={() => setLoreDrawer({ open: true, item: note })}>
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Globe style={{ width: 13, height: 13, color: colors.gold }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{note.title}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'storynote', id: note.id }); }}
                      style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', padding: 4 }}>
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                  <StatusBadge status={note.category} />
                  {note.content && (
                    <div style={{ fontSize: 10, color: colors.muted, marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {note.content}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Research Tab
  // ═══════════════════════════════════════════
  function renderResearch() {
    const filtered = researchItems.filter(r =>
      r.title.toLowerCase().includes(researchSearch.toLowerCase()) ||
      r.summary.toLowerCase().includes(researchSearch.toLowerCase())
    );

    const relevanceColors: Record<string, string> = {
      low: '#8E8E93', moderate: '#C9A96E', high: '#F87171', critical: '#A78BFA',
    };

    return (
      <FadeIn>
        <SectionHeader title="Research" count={filtered.length}
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#636366' }} />
                <input value={researchSearch} onChange={(e) => setResearchSearch(e.target.value)}
                  placeholder="Search research..."
                  style={{ padding: '6px 10px 6px 26px', borderRadius: 16, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', fontSize: 11, outline: 'none', width: 160 }}
                />
              </div>
              <GlassButton small onClick={() => setResearchDrawer({ open: true, item: null })}>
                <Plus style={{ width: 11, height: 11 }} /> Add Research
              </GlassButton>
            </div>
          }
        />
        {filtered.length === 0 ? (
          <EmptyState icon={BookMarked} title="No research notes yet"
            desc="Save notes, links, and references that inspire your writing."
            action={<GlassButton small onClick={() => setResearchDrawer({ open: true, item: null })}><Plus style={{ width: 11, height: 11 }} /> Create Research</GlassButton>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {filtered.map((r) => {
              const rc = relevanceColors[r.relevance] || colors.muted;
              return (
                <Card key={r.id} hover onClick={() => setResearchDrawer({ open: true, item: r })}>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookMarked style={{ width: 13, height: 13, color: '#A78BFA' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{r.title}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'research', id: r.id }); }}
                        style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', padding: 4 }}>
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 8, fontSize: 9, fontWeight: 600, background: `${rc}1A`, color: rc, border: `1px solid ${rc}33`, marginBottom: 6 }}>
                      {r.relevance}
                    </div>
                    {r.summary && (
                      <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {r.summary}
                      </div>
                    )}
                    {r.sourceUrl && (
                      <div style={{ fontSize: 9, color: colors.gold, marginTop: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <LinkIcon style={{ width: 9, height: 9 }} />
                        {r.sourceUrl.replace(/^https?:\/\//, '').substring(0, 40)}{r.sourceUrl.length > 40 ? '...' : ''}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Relationships Tab
  // ═══════════════════════════════════════════
  function renderRelationships() {
    const filtered = relationships.filter(r => {
      const charA = charMap.get(r.characterAId);
      const charB = charMap.get(r.characterBId);
      const search = relSearch.toLowerCase();
      if (!search) return true;
      return (charA?.name || '').toLowerCase().includes(search) ||
        (charB?.name || '').toLowerCase().includes(search) ||
        r.type.toLowerCase().includes(search);
    });

    return (
      <FadeIn>
        <SectionHeader title="Relationships" count={filtered.length}
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#636366' }} />
                <input value={relSearch} onChange={(e) => setRelSearch(e.target.value)}
                  placeholder="Search relationships..."
                  style={{ padding: '6px 10px 6px 26px', borderRadius: 16, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', fontSize: 11, outline: 'none', width: 160 }}
                />
              </div>
              <GlassButton small onClick={() => setRelDrawer({ open: true, item: null })}>
                <Plus style={{ width: 11, height: 11 }} /> Add Relationship
              </GlassButton>
            </div>
          }
        />
        {filtered.length === 0 ? (
          <EmptyState icon={Heart} title="No relationships yet"
            desc="Map the connections between your characters — love, rivalry, betrayal, and alliance."
            action={<GlassButton small onClick={() => setRelDrawer({ open: true, item: null })}><Plus style={{ width: 11, height: 11 }} /> Create Relationship</GlassButton>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {filtered.map((rel) => {
              const charA = charMap.get(rel.characterAId);
              const charB = charMap.get(rel.characterBId);
              const typeIcon = rel.type === 'romance' ? Heart :
                rel.type === 'enemy' ? Swords :
                rel.type === 'family' ? Users :
                rel.type === 'mentor' ? UserCheck :
                Quote;
              const typeColor = rel.type === 'romance' ? '#F472B6' :
                rel.type === 'enemy' ? '#F87171' :
                rel.type === 'family' ? '#60A5FA' :
                rel.type === 'mentor' ? '#34D399' :
                rel.type === 'ally' ? '#34D399' :
                rel.type === 'rival' ? '#F87171' :
                colors.gold;
              const TypeIcon = typeIcon;
              return (
                <Card key={rel.id} hover onClick={() => setRelDrawer({ open: true, item: rel })}>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 10, background: `${typeColor}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TypeIcon style={{ width: 14, height: 14, color: typeColor }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: typeColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{rel.type}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'relationship', id: rel.id }); }}
                        style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', padding: 4 }}>
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.gold, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                          {charA?.name?.charAt(0) || '?'}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: '#F5F5F7' }}>{charA?.name || 'Unknown'}</span>
                      </div>
                      <div style={{ color: typeColor, fontSize: 10 }}>↔</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.gold, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                          {charB?.name?.charAt(0) || '?'}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: '#F5F5F7' }}>{charB?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    {rel.description && (
                      <div style={{ fontSize: 10, color: colors.muted, marginTop: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rel.description}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Objects Tab
  // ═══════════════════════════════════════════
  function renderObjects() {
    const filtered = objectNotes.filter(n =>
      n.title.toLowerCase().includes(objSearch.toLowerCase())
    );

    return (
      <FadeIn>
        <SectionHeader title="Objects" count={filtered.length}
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#636366' }} />
                <input value={objSearch} onChange={(e) => setObjSearch(e.target.value)}
                  placeholder="Search objects..."
                  style={{ padding: '6px 10px 6px 26px', borderRadius: 16, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', fontSize: 11, outline: 'none', width: 160 }}
                />
              </div>
              <GlassButton small onClick={() => setObjDrawer({ open: true, item: null })}>
                <Plus style={{ width: 11, height: 11 }} /> Add Object
              </GlassButton>
            </div>
          }
        />
        {filtered.length === 0 ? (
          <EmptyState icon={Target} title="No objects yet"
            desc="Track the important objects in your story — from magical artifacts to family heirlooms."
            action={<GlassButton small onClick={() => setObjDrawer({ open: true, item: null })}><Plus style={{ width: 11, height: 11 }} /> Create Object</GlassButton>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {filtered.map((note) => (
              <Card key={note.id} hover onClick={() => setObjDrawer({ open: true, item: note })}>
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Target style={{ width: 13, height: 13, color: colors.amber }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{note.title}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'storynote', id: note.id }); }}
                      style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', padding: 4 }}>
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                  <StatusBadge status="object" />
                  {note.content && (
                    <div style={{ fontSize: 10, color: colors.muted, marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {note.content}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </FadeIn>
    );
  }

  // ═══════════════════════════════════════════
  // Drawers
  // ═══════════════════════════════════════════
  function renderDrawers() {
    return (
      <>
        {/* Character Drawer */}
        <Drawer open={charDrawer.open} onClose={() => { setCharDrawer({ open: false, item: null }); setDeleteTarget(null); }}
          title={charDrawer.item ? 'Edit Character' : 'New Character'}>
          <CharForm item={charDrawer.item} onSave={saveCharacter} onClose={() => setCharDrawer({ open: false, item: null })} />
        </Drawer>

        {/* Location Drawer */}
        <Drawer open={locDrawer.open} onClose={() => { setLocDrawer({ open: false, item: null }); setDeleteTarget(null); }}
          title={locDrawer.item ? 'Edit Location' : 'New Location'}>
          <LocForm item={locDrawer.item} onSave={saveLocation} onClose={() => setLocDrawer({ open: false, item: null })} />
        </Drawer>

        {/* Timeline Drawer */}
        <Drawer open={timelineDrawer.open} onClose={() => { setTimelineDrawer({ open: false, item: null }); setDeleteTarget(null); }}
          title={timelineDrawer.item ? 'Edit Timeline Event' : 'New Timeline Event'}>
          <TimelineForm item={timelineDrawer.item} onSave={saveTimelineEvent} onClose={() => setTimelineDrawer({ open: false, item: null })} />
        </Drawer>

        {/* Lore Drawer */}
        <Drawer open={loreDrawer.open} onClose={() => { setLoreDrawer({ open: false, item: null }); setDeleteTarget(null); }}
          title={loreDrawer.item ? 'Edit Lore Note' : 'New Lore Note'}>
          <NoteForm item={loreDrawer.item} onSave={(data) => saveStoryNote(data, false)} onClose={() => setLoreDrawer({ open: false, item: null })}
            categories={LORE_CATEGORIES} />
        </Drawer>

        {/* Research Drawer */}
        <Drawer open={researchDrawer.open} onClose={() => { setResearchDrawer({ open: false, item: null }); setDeleteTarget(null); }}
          title={researchDrawer.item ? 'Edit Research' : 'New Research'}>
          <ResearchForm item={researchDrawer.item} onSave={saveResearch} onClose={() => setResearchDrawer({ open: false, item: null })} />
        </Drawer>

        {/* Relationship Drawer */}
        <Drawer open={relDrawer.open} onClose={() => { setRelDrawer({ open: false, item: null }); setDeleteTarget(null); }}
          title={relDrawer.item ? 'Edit Relationship' : 'New Relationship'}>
          <RelForm item={relDrawer.item} onSave={saveRelationship} onClose={() => setRelDrawer({ open: false, item: null })} />
        </Drawer>

        {/* Object Drawer */}
        <Drawer open={objDrawer.open} onClose={() => { setObjDrawer({ open: false, item: null }); setDeleteTarget(null); }}
          title={objDrawer.item ? 'Edit Object' : 'New Object'}>
          <NoteForm item={objDrawer.item} onSave={(data) => saveStoryNote(data, true)} onClose={() => setObjDrawer({ open: false, item: null })}
            categories={['object']} fixedCategory="object" />
        </Drawer>
      </>
    );
  }

  // ═══════════════════════════════════════════
  // Form Sub-components
  // ═══════════════════════════════════════════

  function CharForm({ item, onSave, onClose }: {
    item: Character | null; onSave: (data: Partial<Character>) => Promise<void>; onClose: () => void;
  }) {
    const [name, setName] = useState(item?.name || '');
    const [role, setRole] = useState(item?.role || 'supporting');
    const [age, setAge] = useState(item?.age || '');
    const [gender, setGender] = useState(item?.gender || '');
    const [occupation, setOccupation] = useState(item?.occupation || '');
    const [physicalDescription, setPhysicalDescription] = useState(item?.physicalDescription || '');
    const [personality, setPersonality] = useState(item?.personality || '');
    const [motivation, setMotivation] = useState(item?.motivation || '');
    const [fear, setFear] = useState(item?.fear || '');
    const [secret, setSecret] = useState(item?.secret || '');
    const [flaw, setFlaw] = useState(item?.flaw || '');
    const [strength, setStrength] = useState(item?.strength || '');
    const [backstory, setBackstory] = useState(item?.backstory || '');
    const [characterArc, setCharacterArc] = useState(item?.characterArc || '');
    const [relationshipToProtagonist, setRelationshipToProtagonist] = useState(item?.relationshipToProtagonist || '');
    const [firstAppearanceChapter, setFirstAppearanceChapter] = useState(item?.firstAppearanceChapter || '');
    const [status, setStatus] = useState(item?.status || 'alive');
    const [notes, setNotes] = useState(item?.notes || '');
    const [colorTag, setColorTag] = useState(item?.colorTag || '');
    const [description, setDescription] = useState(item?.description || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
      if (!name.trim()) { setError('Name is required'); return; }
      setSaving(true); setError('');
      try {
        await onSave({
          name: name.trim(), role, description,
          age: age || null, gender: gender || null, occupation: occupation || null,
          physicalDescription: physicalDescription || null, personality: personality || null,
          motivation: motivation || null, fear: fear || null, secret: secret || null,
          flaw: flaw || null, strength: strength || null, backstory: backstory || null,
          characterArc: characterArc || null, relationshipToProtagonist: relationshipToProtagonist || null,
          firstAppearanceChapter: firstAppearanceChapter || null, status, notes: notes || null,
          colorTag: colorTag || null,
        });
        onClose();
      } catch (e) { setError('Failed to save'); } finally { setSaving(false); }
    };

    return (
      <div>
        {error && <div style={{ fontSize: 11, color: '#F87171', marginBottom: 10 }}>{error}</div>}
        <FormField label="Name"><Input value={name} onChange={setName} placeholder="Character name" /></FormField>
        <FormField label="Role"><Select value={role} onChange={setRole} options={CHARACTER_ROLES} /></FormField>
        <FormField label="Description"><Input value={description} onChange={setDescription} placeholder="Brief description" multiline rows={2} /></FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Age"><Input value={age} onChange={setAge} placeholder="Age" /></FormField>
          <FormField label="Gender"><Input value={gender} onChange={setGender} placeholder="Gender" /></FormField>
        </div>
        <FormField label="Occupation"><Input value={occupation} onChange={setOccupation} placeholder="Occupation" /></FormField>
        <FormField label="Physical Description"><Input value={physicalDescription} onChange={setPhysicalDescription} placeholder="Describe their appearance" multiline rows={2} /></FormField>
        <FormField label="Personality"><Input value={personality} onChange={setPersonality} placeholder="Personality traits" multiline rows={2} /></FormField>
        <FormField label="Motivation"><Input value={motivation} onChange={setMotivation} placeholder="What drives them?" multiline rows={2} /></FormField>
        <FormField label="Fear"><Input value={fear} onChange={setFear} placeholder="Deepest fear" multiline rows={2} /></FormField>
        <FormField label="Secret"><Input value={secret} onChange={setSecret} placeholder="What do they hide?" multiline rows={2} /></FormField>
        <FormField label="Flaw"><Input value={flaw} onChange={setFlaw} placeholder="Character flaw" multiline rows={2} /></FormField>
        <FormField label="Strength"><Input value={strength} onChange={setStrength} placeholder="Character strength" multiline rows={2} /></FormField>
        <FormField label="Backstory"><Input value={backstory} onChange={setBackstory} placeholder="Their history" multiline rows={3} /></FormField>
        <FormField label="Character Arc"><Input value={characterArc} onChange={setCharacterArc} placeholder="How do they change?" multiline rows={2} /></FormField>
        <FormField label="Relationship to Protagonist"><Input value={relationshipToProtagonist} onChange={setRelationshipToProtagonist} placeholder="Connection to the protagonist" multiline rows={2} /></FormField>
        <FormField label="First Appearance"><Input value={firstAppearanceChapter} onChange={setFirstAppearanceChapter} placeholder="Chapter they first appear" /></FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Status"><Select value={status} onChange={setStatus} options={CHARACTER_STATUSES} /></FormField>
          <FormField label="Color Tag"><Input value={colorTag} onChange={setColorTag} placeholder="e.g. #C9A96E" /></FormField>
        </div>
        <FormField label="Notes"><Input value={notes} onChange={setNotes} placeholder="Additional notes" multiline rows={2} /></FormField>
        <button onClick={handleSave} disabled={saving}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12, border: 'none',
            background: colors.gold, color: '#1a0f00', fontSize: 12, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          {saving ? 'Saving...' : <><Save style={{ width: 13, height: 13 }} /> Save Character</>}
        </button>
      </div>
    );
  }

  function LocForm({ item, onSave, onClose }: {
    item: Location | null; onSave: (data: Partial<Location>) => Promise<void>; onClose: () => void;
  }) {
    const [name, setName] = useState(item?.name || '');
    const [type, setType] = useState(item?.type || 'other');
    const [description, setDescription] = useState(item?.description || '');
    const [mood, setMood] = useState(item?.mood || '');
    const [importance, setImportance] = useState(item?.importance || 'minor');
    const [rules, setRules] = useState(item?.rules || '');
    const [history, setHistory] = useState(item?.history || '');
    const [notes, setNotes] = useState(item?.notes || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
      if (!name.trim()) { setError('Name is required'); return; }
      setSaving(true); setError('');
      try {
        await onSave({
          name: name.trim(), type, description, mood: mood || null,
          importance, rules: rules || null, history: history || null, notes: notes || null,
        });
        onClose();
      } catch (e) { setError('Failed to save'); } finally { setSaving(false); }
    };

    return (
      <div>
        {error && <div style={{ fontSize: 11, color: '#F87171', marginBottom: 10 }}>{error}</div>}
        <FormField label="Name"><Input value={name} onChange={setName} placeholder="Location name" /></FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Type"><Select value={type} onChange={setType} options={LOCATION_TYPES} /></FormField>
          <FormField label="Importance"><Select value={importance} onChange={setImportance} options={IMPORTANCE_LEVELS} /></FormField>
        </div>
        <FormField label="Description"><Input value={description} onChange={setDescription} placeholder="Describe this place" multiline rows={3} /></FormField>
        <FormField label="Mood"><Input value={mood} onChange={setMood} placeholder="The atmosphere and feeling" multiline rows={2} /></FormField>
        <FormField label="Rules"><Input value={rules} onChange={setRules} placeholder="Special rules or properties" multiline rows={2} /></FormField>
        <FormField label="History"><Input value={history} onChange={setHistory} placeholder="The history of this place" multiline rows={3} /></FormField>
        <FormField label="Notes"><Input value={notes} onChange={setNotes} placeholder="Additional notes" multiline rows={2} /></FormField>
        <button onClick={handleSave} disabled={saving}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12, border: 'none',
            background: colors.gold, color: '#1a0f00', fontSize: 12, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          {saving ? 'Saving...' : <><Save style={{ width: 13, height: 13 }} /> Save Location</>}
        </button>
      </div>
    );
  }

  function TimelineForm({ item, onSave, onClose }: {
    item: TimelineEvent | null; onSave: (data: Partial<TimelineEvent>) => Promise<void>; onClose: () => void;
  }) {
    const [title, setTitle] = useState(item?.title || '');
    const [description, setDescription] = useState(item?.description || '');
    const [eventOrder, setEventOrder] = useState(item?.eventDateOrOrder != null ? String(item.eventDateOrOrder) : '');
    const [eventDateText, setEventDateText] = useState(item?.eventDateText || '');
    const [type, setType] = useState(item?.type || 'main_plot');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
      if (!title.trim()) { setError('Title is required'); return; }
      setSaving(true); setError('');
      try {
        await onSave({
          title: title.trim(), description, type,
          eventDateOrOrder: eventOrder ? parseFloat(eventOrder) : null,
          eventDateText: eventDateText || null,
        });
        onClose();
      } catch (e) { setError('Failed to save'); } finally { setSaving(false); }
    };

    return (
      <div>
        {error && <div style={{ fontSize: 11, color: '#F87171', marginBottom: 10 }}>{error}</div>}
        <FormField label="Title"><Input value={title} onChange={setTitle} placeholder="Event title" /></FormField>
        <FormField label="Type"><Select value={type} onChange={setType} options={TIMELINE_TYPES} /></FormField>
        <FormField label="Description"><Input value={description} onChange={setDescription} placeholder="Describe the event" multiline rows={3} /></FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Event Order"><Input value={eventOrder} onChange={setEventOrder} placeholder="Numeric order" type="number" /></FormField>
          <FormField label="Date Text"><Input value={eventDateText} onChange={setEventDateText} placeholder="e.g. 'Year 3000'" /></FormField>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12, border: 'none',
            background: colors.gold, color: '#1a0f00', fontSize: 12, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          {saving ? 'Saving...' : <><Save style={{ width: 13, height: 13 }} /> Save Event</>}
        </button>
      </div>
    );
  }

  function NoteForm({ item, onSave, onClose, categories, fixedCategory }: {
    item: StoryNote | null; onSave: (data: Partial<StoryNote>) => Promise<void>; onClose: () => void;
    categories: string[]; fixedCategory?: string;
  }) {
    const [title, setTitle] = useState(item?.title || '');
    const [content, setContent] = useState(item?.content || '');
    const [category, setCategory] = useState(item?.category || (fixedCategory || categories[0]));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
      if (!title.trim()) { setError('Title is required'); return; }
      setSaving(true); setError('');
      try {
        await onSave({
          title: title.trim(), content, category: fixedCategory || category,
        });
        onClose();
      } catch (e) { setError('Failed to save'); } finally { setSaving(false); }
    };

    return (
      <div>
        {error && <div style={{ fontSize: 11, color: '#F87171', marginBottom: 10 }}>{error}</div>}
        <FormField label="Title"><Input value={title} onChange={setTitle} placeholder="Note title" /></FormField>
        {!fixedCategory && (
          <FormField label="Category"><Select value={category} onChange={setCategory} options={categories} /></FormField>
        )}
        <FormField label="Content"><Input value={content} onChange={setContent} placeholder="Write your notes here..." multiline rows={8} /></FormField>
        <button onClick={handleSave} disabled={saving}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12, border: 'none',
            background: colors.gold, color: '#1a0f00', fontSize: 12, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          {saving ? 'Saving...' : <><Save style={{ width: 13, height: 13 }} /> Save Note</>}
        </button>
      </div>
    );
  }

  function ResearchForm({ item, onSave, onClose }: {
    item: ResearchItem | null; onSave: (data: Partial<ResearchItem>) => Promise<void>; onClose: () => void;
  }) {
    const [title, setTitle] = useState(item?.title || '');
    const [sourceUrl, setSourceUrl] = useState(item?.sourceUrl || '');
    const [summary, setSummary] = useState(item?.summary || '');
    const [notes, setNotes] = useState(item?.notes || '');
    const [relevance, setRelevance] = useState(item?.relevance || 'moderate');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
      if (!title.trim()) { setError('Title is required'); return; }
      setSaving(true); setError('');
      try {
        await onSave({
          title: title.trim(), sourceUrl: sourceUrl || null,
          summary, notes: notes || null, relevance,
        });
        onClose();
      } catch (e) { setError('Failed to save'); } finally { setSaving(false); }
    };

    return (
      <div>
        {error && <div style={{ fontSize: 11, color: '#F87171', marginBottom: 10 }}>{error}</div>}
        <FormField label="Title"><Input value={title} onChange={setTitle} placeholder="Research title" /></FormField>
        <FormField label="Source URL"><Input value={sourceUrl} onChange={setSourceUrl} placeholder="https://..." /></FormField>
        <FormField label="Relevance"><Select value={relevance} onChange={setRelevance} options={RELEVANCE_LEVELS} /></FormField>
        <FormField label="Summary"><Input value={summary} onChange={setSummary} placeholder="Brief summary" multiline rows={3} /></FormField>
        <FormField label="Notes"><Input value={notes} onChange={setNotes} placeholder="Detailed notes" multiline rows={4} /></FormField>
        <button onClick={handleSave} disabled={saving}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12, border: 'none',
            background: colors.gold, color: '#1a0f00', fontSize: 12, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          {saving ? 'Saving...' : <><Save style={{ width: 13, height: 13 }} /> Save Research</>}
        </button>
      </div>
    );
  }

  function RelForm({ item, onSave, onClose }: {
    item: Relationship | null; onSave: (data: Partial<Relationship>) => Promise<void>; onClose: () => void;
  }) {
    const [characterAId, setCharacterAId] = useState(item?.characterAId || '');
    const [characterBId, setCharacterBId] = useState(item?.characterBId || '');
    const [type, setType] = useState(item?.type || 'complicated');
    const [description, setDescription] = useState(item?.description || '');
    const [conflict, setConflict] = useState(item?.conflict || '');
    const [evolution, setEvolution] = useState(item?.evolution || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
      if (!characterAId || !characterBId) { setError('Both characters are required'); return; }
      if (characterAId === characterBId) { setError('Cannot create a relationship with the same character'); return; }
      setSaving(true); setError('');
      try {
        await onSave({
          characterAId, characterBId, type, description,
          conflict: conflict || null, evolution: evolution || null,
        });
        onClose();
      } catch (e) { setError('Failed to save'); } finally { setSaving(false); }
    };

    const charOptions = characters.map(c => ({ value: c.id, label: c.name }));

    return (
      <div>
        {error && <div style={{ fontSize: 11, color: '#F87171', marginBottom: 10 }}>{error}</div>}
        <FormField label="Character A">
          <Select value={characterAId} onChange={setCharacterAId} options={charOptions} placeholder="Select character..." />
        </FormField>
        <FormField label="Character B">
          <Select value={characterBId} onChange={setCharacterBId} options={charOptions} placeholder="Select character..." />
        </FormField>
        <FormField label="Type"><Select value={type} onChange={setType} options={RELATIONSHIP_TYPES} /></FormField>
        <FormField label="Description"><Input value={description} onChange={setDescription} placeholder="Describe the relationship" multiline rows={3} /></FormField>
        <FormField label="Conflict"><Input value={conflict} onChange={setConflict} placeholder="Sources of tension or conflict" multiline rows={2} /></FormField>
        <FormField label="Evolution"><Input value={evolution} onChange={setEvolution} placeholder="How does it change over time?" multiline rows={2} /></FormField>
        <button onClick={handleSave} disabled={saving}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12, border: 'none',
            background: colors.gold, color: '#1a0f00', fontSize: 12, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          {saving ? 'Saving...' : <><Save style={{ width: 13, height: 13 }} /> Save Relationship</>}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // Delete Confirmation
  // ═══════════════════════════════════════════
  function renderDeleteConfirm() {
    const handleDelete = () => {
      if (!deleteTarget) return;
      const { type, id } = deleteTarget;
      switch (type) {
        case 'character': deleteCharacter(id); break;
        case 'location': deleteLocation(id); break;
        case 'timeline': deleteTimelineEvent(id); break;
        case 'storynote': deleteStoryNote(id); break;
        case 'research': deleteResearch(id); break;
        case 'relationship': deleteRelationship(id); break;
        default: setDeleteTarget(null);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        onClick={() => setDeleteTarget(null)}
      >
        <div onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.cardBg, border: `1px solid ${colors.border}`,
            borderRadius: 16, padding: 24, maxWidth: 360, width: '90%',
          }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#F87171' }}>
              <Trash2 style={{ width: 20, height: 20 }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>Delete {deleteTarget?.type}?</div>
            <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.5 }}>This action cannot be undone. Are you sure you want to delete this item?</div>
          </div>
          <DeleteConfirm onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
        </div>
      </motion.div>
    );
  }
}

// ─── Shared hook ───
function useNav() {
  const router = useRouter();
  const { setSelectedProject, setCurrentView, projects, selectedProject } = useNovelifyStore();

  const go = (view: string, project?: any) => {
    if (project) setSelectedProject(project);
    setCurrentView(view as any);
    const base = '/dashboard';
    const routes: Record<string, string> = {
      'writing': `${base}/writing/${project?.id || selectedProject?.id}`,
      'story-bible': `${base}/bible/${project?.id || selectedProject?.id}`,
      'plot-board': `${base}/plot/${project?.id || selectedProject?.id}`,
      'revision': `${base}/revision/${project?.id || selectedProject?.id}`,
      'translation': `${base}/translation/${project?.id || selectedProject?.id}`,
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
