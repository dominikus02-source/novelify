'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout, Plus, X, Trash2, PenTool, Sparkles, Check, Loader2,
  ChevronDown, ChevronRight, GripVertical, FileText, BookOpen,
  MapPin, Users, Target, Eye, ArrowRight, Layers, Clock,
  ListOrdered, Maximize2, Minimize2, MessageSquarePlus, Wand2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNovelifyStore, type Project, type Chapter, type Scene, type PlotBeat } from '@/lib/store';
import { colors, PageHeader, Card, EmptyState, SectionHeader, StatusBadge, GlassButton, fmtWords } from './dashboard-components';

const structureTemplates = [
  { id: 'three-act', name: 'Three-Act Structure', acts: ['Act I: Setup', 'Act II: Confrontation', 'Act III: Resolution'] },
  { id: 'heros-journey', name: "Hero's Journey", acts: ['Departure', 'Initiation', 'Return'] },
  { id: 'save-the-cat', name: 'Save the Cat', acts: ['Act I', 'Act II', 'Act III'] },
  { id: 'romance', name: 'Romance Beats', acts: ['Meeting', 'Conflict', 'Resolution'] },
  { id: 'mystery', name: 'Mystery Clue Map', acts: ['Setup', 'Investigation', 'Reveal'] },
  { id: 'webnovel', name: 'Webnovel Arc', acts: ['Arc 1', 'Arc 2', 'Arc 3'] },
  { id: 'custom', name: 'Custom Structure', acts: ['Section 1', 'Section 2', 'Section 3'] },
];

const statusColors: Record<string, string> = {
  idea: '#8E8E93', planned: '#C8873A', drafted: '#10B981', revised: '#6366F1', locked: '#8B5CF6',
};

const aiPresets = [
  { icon: Sparkles, label: 'Generate Beats from Premise', prompt: 'Based on this premise, generate a complete set of plot beats following the {template} structure. Each beat should have a clear purpose and emotional arc.' },
  { icon: Wand2, label: 'Expand Beat into Scenes', prompt: 'Expand this plot beat into 3-5 individual scenes. Each scene needs a clear goal, conflict, and outcome.' },
  { icon: MessageSquarePlus, label: 'Suggest Next Scene', prompt: 'Based on the current scene and chapter outline, suggest what should happen next in the story.' },
];

export function PlotBoardPage() {
  const router = useRouter();
  const {
    selectedProject, setSelectedProject, projects,
    setSelectedChapter, setSelectedScene, setWritingMode,
  } = useNovelifyStore();

  const [view, setView] = useState<'beats' | 'chapters' | 'scenes' | 'timeline'>('beats');
  const [structure, setStructure] = useState('three-act');
  const [plotBeats, setPlotBeats] = useState<PlotBeat[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBeat, setEditingBeat] = useState<PlotBeat | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAddBeat, setShowAddBeat] = useState(false);
  const [showAddScene, setShowAddScene] = useState<string | null>(null);
  const [expandedActs, setExpandedActs] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [filterChar, setFilterChar] = useState('');
  const [filterLoc, setFilterLoc] = useState('');

  const project = selectedProject;

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    const pid = project.id;

    Promise.all([
      fetch(`/api/plot-beats?projectId=${pid}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/characters?projectId=${pid}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/locations?projectId=${pid}`).then(r => r.ok ? r.json() : []),
    ]).then(([beats, chars, locs]) => {
      setPlotBeats(beats);
      setCharacters(chars);
      setLocations(locs);
      setChapters([...(project.chapters || [])].sort((a, b) => a.chapterNumber - b.chapterNumber));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [project?.id]);

  useEffect(() => {
    if (!project?.chapters?.length) return;
    const ids = project.chapters.map(c => c.id);
    Promise.all(ids.map(id => fetch(`/api/scenes?chapterId=${id}`).then(r => r.ok ? r.json() : [])))
      .then(results => setScenes(results.flat().sort((a, b) => a.sceneNumber - b.sceneNumber)))
      .catch(() => {});
  }, [project?.chapters]);

  const refreshBeats = useCallback(async () => {
    if (!project) return;
    const res = await fetch(`/api/plot-beats?projectId=${project.id}`);
    if (res.ok) setPlotBeats(await res.json());
  }, [project?.id]);

  const goToWritingStudio = (chapterId?: string, sceneId?: string) => {
    if (!project) return;
    if (chapterId) {
      const ch = chapters.find(c => c.id === chapterId);
      if (ch) setSelectedChapter(ch);
    }
    if (sceneId) {
      const sc = scenes.find(s => s.id === sceneId);
      if (sc) setSelectedScene(sc);
    }
    setWritingMode('chapter');
    router.push(`/dashboard/writing/${project.id}`);
  };

  const handleAddBeat = async (act: string) => {
    if (!project) return;
    const maxOrder = plotBeats.filter(b => b.act === act).reduce((max, b) => Math.max(max, b.order), 0);
    const res = await fetch('/api/plot-beats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, template: structure, act, order: maxOrder + 1, title: `Beat ${maxOrder + 1}`, description: '', status: 'idea' }),
    });
    if (res.ok) refreshBeats();
  };

  const handleSaveBeat = async () => {
    if (!editingBeat) return;
    await fetch(`/api/plot-beats/${editingBeat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingBeat),
    });
    setEditingBeat(null);
    refreshBeats();
  };

  const handleDeleteBeat = async (id: string) => {
    await fetch(`/api/plot-beats/${id}`, { method: 'DELETE' });
    refreshBeats();
  };

  const handleConvertBeat = async (beatId: string) => {
    const beat = plotBeats.find(b => b.id === beatId);
    if (!beat || !project) return;
    const title = beat.title;
    const res = await fetch('/api/plot-beats/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beatId, title }),
    });
    if (res.ok) {
      const data = await res.json();
      if (project) {
        const updated = { ...project, chapters: [...(project.chapters || []), data.chapter] };
        setChapters([...chapters, data.chapter]);
      }
      refreshBeats();
    }
  };

  const handleAddScene = async (chapterId: string) => {
    const chScenes = scenes.filter(s => s.chapterId === chapterId);
    const maxNum = chScenes.reduce((max, s) => Math.max(max, s.sceneNumber), 0);
    const res = await fetch('/api/scenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId, sceneNumber: maxNum + 1, title: `Scene ${maxNum + 1}` }),
    });
    if (res.ok) {
      const data = await res.json();
      setScenes([...scenes, data]);
    }
  };

  const handleSaveScene = async () => {
    if (!editingScene) return;
    await fetch(`/api/scenes/${editingScene.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingScene),
    });
    setScenes(scenes.map(s => s.id === editingScene.id ? editingScene : s));
    setEditingScene(null);
  };

  const handleAIGenerate = async () => {
    if (!project || !aiPrompt.trim()) return;
    setIsAiGenerating(true);
    setAiResult('');
    try {
      const context = `Project: ${project.title}
Genre: ${project.genre || 'Not set'}
Premise: ${(project as any).premise || 'Not set'}
Structure: ${structureTemplates.find(t => t.id === structure)?.name || structure}
Current Beats: ${plotBeats.map(b => `[${b.act}] ${b.title}`).join('\n')}
Chapters: ${chapters.map(c => `${c.chapterNumber}. ${c.title}`).join('\n')}`;

      const res = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          prompt: `${aiPrompt}\n\nProject Context:\n${context}`,
          context: { plotOutline: project.plotOutline || '', genre: project.genre, projectTitle: project.title, sourceLanguage: project.sourceLanguage },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data.content || '');
      } else setAiResult('Error generating content.');
    } catch { setAiResult('Failed to connect.'); }
    finally { setIsAiGenerating(false); }
  };

  if (!project) {
    return (
      <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
        <PageHeader title="Plot Board" subtitle="Shape your story from big turning points into chapters and scenes" />
        {projects.length === 0 ? (
          <EmptyState icon={Layout} title="No projects yet" desc="Create a novel to start plotting" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {projects.map(p => (
              <Card key={p.id} hover onClick={() => { setSelectedProject(p); router.push(`/dashboard/plot/${p.id}`); }}>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{p.chapters.length} chapters</div>
                  <GlassButton small onClick={() => { setSelectedProject(p); router.push(`/dashboard/plot/${p.id}`); }} style={{ marginTop: 10 }}>Open Plot Board</GlassButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const totalWords = chapters.reduce((s, c) => s + c.wordCount, 0);
  const sceneCount = scenes.length;
  const template = structureTemplates.find(t => t.id === structure) || structureTemplates[0];

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
      <PageHeader title={`Plot Board: ${project.title}`} subtitle={`${plotBeats.length} beats · ${chapters.length} chapters · ${sceneCount} scenes · ${fmtWords(totalWords)}`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <GlassButton onClick={() => setShowAIModal(true)}><Sparkles style={{ width: 13, height: 13 }} /> AI</GlassButton>
            <GlassButton onClick={() => goToWritingStudio()}><PenTool style={{ width: 13, height: 13 }} /> Writing Studio</GlassButton>
          </div>
        }
      />

      {/* Structure selector + View tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={structure} onChange={e => setStructure(e.target.value)}
          style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1px solid ${colors.border}`, background: '#161616', color: '#F5F5F7', outline: 'none', cursor: 'pointer' }}
        >
          {structureTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        {(['beats', 'chapters', 'scenes', 'timeline'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: '7px 16px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: `1px solid ${view === v ? colors.goldBorder : colors.border}`, background: view === v ? 'rgba(201,169,110,0.10)' : '#161616', color: view === v ? colors.gold : '#8E8E93' }}
          >{v === 'beats' ? 'Beat Board' : v === 'chapters' ? 'Chapters' : v === 'scenes' ? 'Scene Cards' : 'Timeline'}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Loader2 className="animate-spin" size={24} style={{ color: colors.gold }} />
        </div>
      ) : (
        <>
          {/* Beat Board View */}
          {view === 'beats' && (
            <div>
              {template.acts.map(act => {
                const actKey = act.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const beats = plotBeats.filter(b => b.act === actKey).sort((a, b) => a.order - b.order);
                const expanded = expandedActs[actKey] ?? true;
                return (
                  <div key={act} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <button onClick={() => setExpandedActs(p => ({ ...p, [actKey]: !expanded }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636366', padding: 2 }}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 600, color: '#F5F5F7', margin: 0 }}>{act}</h3>
                      <span style={{ fontSize: 10, color: colors.muted }}>({beats.length} beats)</span>
                      <div style={{ flex: 1 }} />
                      <button onClick={() => handleAddBeat(actKey)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 16, fontSize: 10, fontWeight: 500, cursor: 'pointer', border: `1px solid ${colors.border}`, background: '#161616', color: colors.gold }}
                      ><Plus size={10} /> Add Beat</button>
                    </div>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          {beats.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', borderRadius: 12, border: `1px dashed ${colors.border}`, background: 'rgba(255,255,255,0.02)' }}>
                              <p style={{ fontSize: 11, color: colors.muted, margin: 0 }}>No beats yet. Add your first plot beat.</p>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {beats.map(beat => (
                                <motion.div key={beat.id} layout style={{ padding: '14px 16px', borderRadius: 12, background: '#111111', border: `1px solid ${colors.border}` }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${statusColors[beat.status] || statusColors.idea}20`, border: `1px solid ${statusColors[beat.status] || statusColors.idea}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: statusColors[beat.status] || statusColors.idea, flexShrink: 0 }}>{beat.order}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      {editingBeat?.id === beat.id ? (
                                        <div>
                                          <input value={editingBeat.title} onChange={e => setEditingBeat({ ...editingBeat, title: e.target.value })}
                                            style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: `1px solid ${colors.goldBorder}`, background: '#1c1c1e', color: '#F5F5F7', fontSize: 13, fontWeight: 600, outline: 'none', marginBottom: 6 }}
                                          />
                                          <textarea value={editingBeat.description} onChange={e => setEditingBeat({ ...editingBeat, description: e.target.value })}
                                            style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: `1px solid ${colors.border}`, background: '#1c1c1e', color: '#aeaeb2', fontSize: 11, outline: 'none', minHeight: 60, resize: 'vertical', marginBottom: 6, fontFamily: 'inherit' }}
                                          />
                                          <div style={{ display: 'flex', gap: 6 }}>
                                            <select value={editingBeat.status} onChange={e => setEditingBeat({ ...editingBeat, status: e.target.value })}
                                              style={{ padding: '4px 8px', borderRadius: 6, fontSize: 10, border: `1px solid ${colors.border}`, background: '#1c1c1e', color: '#aeaeb2', outline: 'none' }}
                                            >{['idea', 'planned', 'drafted', 'revised', 'locked'].map(s => <option key={s} value={s}>{s}</option>)}</select>
                                            <button onClick={handleSaveBeat} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: colors.gold, color: '#1a0f00', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}><Check size={12} /> Save</button>
                                            <button onClick={() => setEditingBeat(null)} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${colors.border}`, background: 'transparent', color: '#8E8E93', fontSize: 10, cursor: 'pointer' }}>Cancel</button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{beat.title}</span>
                                            <StatusBadge status={beat.status} />
                                            {beat.linkedChapterId && <span style={{ fontSize: 9, color: colors.gold, background: 'rgba(201,169,110,0.10)', padding: '1px 6px', borderRadius: 4 }}>Linked</span>}
                                          </div>
                                          {beat.description && <p style={{ fontSize: 11, color: colors.muted, margin: '0 0 6px', lineHeight: 1.4 }}>{beat.description}</p>}
                                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <button onClick={() => setEditingBeat({ ...beat })} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#8E8E93', cursor: 'pointer' }}>Edit</button>
                                            <button onClick={() => handleConvertBeat(beat.id)} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, border: 'none', background: 'rgba(16,185,129,0.10)', color: '#10B981', cursor: 'pointer' }}>Convert to Chapter</button>
                                            <button onClick={() => handleDeleteBeat(beat.id)} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, border: 'none', background: 'rgba(248,113,113,0.10)', color: '#F87171', cursor: 'pointer' }}>Delete</button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* Chapter Outline View */}
          {view === 'chapters' && (
            <div>
              {chapters.length === 0 ? (
                <EmptyState icon={BookOpen} title="No chapters yet" desc="Choose a structure or let AI draft the first outline from your premise." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chapters.map((ch, i) => {
                    const chScenes = scenes.filter(s => s.chapterId === ch.id);
                    return (
                      <motion.div key={ch.id} layout style={{ padding: '14px 16px', borderRadius: 12, background: '#111111', border: `1px solid ${colors.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(201,169,110,0.10)', border: `1px solid ${colors.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: colors.gold, flexShrink: 0 }}>{ch.chapterNumber}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{ch.title}</span>
                              <StatusBadge status={ch.status} />
                              <span style={{ fontSize: 10, color: colors.muted }}>{ch.wordCount}w · {chScenes.length} scenes</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleAddScene(ch.id)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, border: `1px solid ${colors.border}`, background: '#161616', color: colors.gold, cursor: 'pointer' }}>+ Scene</button>
                            <button onClick={() => goToWritingStudio(ch.id)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, border: 'none', background: 'rgba(201,169,110,0.15)', color: colors.gold, cursor: 'pointer' }}>Open</button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Scene Cards View */}
          {view === 'scenes' && (
            <div>
              {chapters.length === 0 ? (
                <EmptyState icon={FileText} title="No scenes yet" desc="Scenes are where your plot becomes readable momentum. Start with a goal, conflict, and outcome." />
              ) : (
                chapters.map(ch => {
                  const chScenes = scenes.filter(s => s.chapterId === ch.id).sort((a, b) => a.sceneNumber - b.sceneNumber);
                  const expanded = expandedChapters[ch.id] ?? true;
                  return (
                    <div key={ch.id} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <button onClick={() => setExpandedChapters(p => ({ ...p, [ch.id]: !expanded }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636366', padding: 2 }}>
                          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <span style={{ fontSize: 12, fontWeight: 600, color: colors.gold }}>Ch {ch.chapterNumber}: {ch.title}</span>
                        <span style={{ fontSize: 10, color: colors.muted }}>({chScenes.length} scenes)</span>
                      </div>
                      <AnimatePresence>
                        {expanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            {chScenes.length === 0 ? (
                              <div style={{ padding: '16px', textAlign: 'center', borderRadius: 8, border: `1px dashed ${colors.border}`, marginLeft: 22 }}>
                                <p style={{ fontSize: 10, color: colors.muted, margin: 0 }}>No scenes. Add your first scene.</p>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 22 }}>
                                {chScenes.map(scene => (
                                  <motion.div key={scene.id} layout style={{ padding: '12px 14px', borderRadius: 10, background: '#111111', border: `1px solid ${colors.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[scene.status] || statusColors.idea, marginTop: 6, flexShrink: 0 }} />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                          <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{scene.title}</span>
                                          <StatusBadge status={scene.status} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 12, fontSize: 9, color: colors.muted }}>
                                          {scene.goal && <span>Goal: {scene.goal}</span>}
                                          {scene.conflict && <span>Conflict: {scene.conflict}</span>}
                                          <span>{scene.wordCount}w</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                          <button onClick={() => goToWritingStudio(ch.id, scene.id)} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, border: 'none', background: 'rgba(201,169,110,0.10)', color: colors.gold, cursor: 'pointer' }}>Write</button>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Timeline View */}
          {view === 'timeline' && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <select value={filterChar} onChange={e => setFilterChar(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 10, border: `1px solid ${colors.border}`, background: '#161616', color: '#aeaeb2', outline: 'none' }}>
                  <option value="">All POVs</option>
                  {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {scenes.length === 0 ? (
                <EmptyState icon={Clock} title="No timeline yet" desc="Create scenes first to see them on a timeline." />
              ) : (
                <div style={{ position: 'relative', paddingLeft: 30 }}>
                  <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 1, background: colors.border }} />
                  {scenes
                    .filter(s => !filterChar || s.povCharacterId === filterChar)
                    .sort((a, b) => a.sceneNumber - b.sceneNumber)
                    .map((scene, i) => {
                      const ch = chapters.find(c => c.id === scene.chapterId);
                      const povChar = characters.find(c => c.id === scene.povCharacterId);
                      return (
                        <motion.div key={scene.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          style={{ position: 'relative', padding: '0 0 16px 20px' }}
                        >
                          <div style={{ position: 'absolute', left: -7, top: 4, width: 14, height: 14, borderRadius: '50%', background: statusColors[scene.status] || statusColors.idea, border: '2px solid #080808', zIndex: 1 }} />
                          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#111111', border: `1px solid ${colors.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{scene.title}</span>
                              <StatusBadge status={scene.status} />
                            </div>
                            <div style={{ fontSize: 10, color: colors.muted }}>
                              {ch && <span>Ch {ch.chapterNumber} · </span>}
                              {povChar && <span>POV: {povChar.name} · </span>}
                              {scene.goal && <span>Goal: {scene.goal}</span>}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* AI Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ width: '100%', maxWidth: 560, background: '#111111', borderRadius: 16, border: `1px solid ${colors.border}`, padding: 24 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 600, color: '#F5F5F7', margin: 0 }}>AI Plot Assistant</h3>
                <button onClick={() => { setShowAIModal(false); setAiResult(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636366', padding: 4 }}><X size={18} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {aiPresets.map(p => {
                  const Icon = p.icon;
                  return (
                    <button key={p.label} onClick={() => setAiPrompt(p.prompt.replace('{template}', template.name))}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${colors.border}`, background: '#1c1c1e', color: '#F5F5F7', fontSize: 11, cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    ><Icon size={14} style={{ color: colors.gold }} /> {p.label}</button>
                  );
                })}
              </div>

              <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${colors.border}`, background: '#1c1c1e', color: '#F5F5F7', fontSize: 12, outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Describe what you want AI to generate..."
              />

              {aiResult && (
                <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <p style={{ fontSize: 12, color: '#d4d4d4', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{aiResult}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={handleAIGenerate} disabled={!aiPrompt.trim() || isAiGenerating}
                  style={{ flex: 1, padding: '10px 20px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${colors.gold}, #E8C98A)`, color: '#1a0f00', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (!aiPrompt.trim() || isAiGenerating) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >{isAiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate</button>
                <button onClick={() => { setAiResult(''); setAiPrompt(''); }}
                  style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${colors.border}`, background: 'transparent', color: '#8E8E93', fontSize: 12, cursor: 'pointer' }}
                >Clear</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
