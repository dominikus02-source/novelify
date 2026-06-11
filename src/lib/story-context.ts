import { db } from '@/lib/db';

export interface StoryContextForAI {
  projectTitle: string;
  genre: string | null;
  premise: string | null;
  logline: string | null;
  theme: string | null;
  styleGuide: string | null;
  pov: string | null;
  tense: string | null;
  tone: string | null;
  centralConflict: string | null;
  stakes: string | null;
  characters: { name: string; role: string; description: string; personality: string | null; motivation: string | null; flaw: string | null; arc: string | null }[];
  locations: { name: string; type: string; description: string; mood: string | null }[];
  plotBeats: { title: string; description: string; act: string; order: number; status: string }[];
  timelineEvents: { title: string; type: string; description: string }[];
  chapters: { title: string; chapterNumber: number; wordCount: number; status: string; summary: string }[];
  relationships: { characterA: string; characterB: string; type: string; description: string }[];
  researchNotes: { title: string; summary: string; relevance: string }[];
}

export async function getProjectStoryContext(projectId: string): Promise<StoryContextForAI> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      title: true,
      genre: true,
      premise: true,
      logline: true,
      theme: true,
      styleGuide: true,
      pov: true,
      tense: true,
      tone: true,
      centralConflict: true,
      stakes: true,
      characters: {
        select: {
          name: true,
          role: true,
          description: true,
          personality: true,
          motivation: true,
          flaw: true,
          characterArc: true,
        },
      },
      locations: {
        select: {
          name: true,
          type: true,
          description: true,
          mood: true,
        },
      },
      chapters: {
        orderBy: { chapterNumber: 'asc' },
        select: {
          title: true,
          chapterNumber: true,
          wordCount: true,
          status: true,
        },
      },
      timelineEvents: {
        orderBy: { eventDateOrOrder: 'asc' },
        select: {
          title: true,
          type: true,
          description: true,
        },
      },
      plotBeats: {
        orderBy: { order: 'asc' },
        select: {
          title: true,
          description: true,
          act: true,
          order: true,
          status: true,
        },
      },
      relationships: {
        select: {
          type: true,
          description: true,
          characterA: { select: { name: true } },
          characterB: { select: { name: true } },
        },
      },
      researchItems: {
        where: { relevance: { in: ['high', 'critical'] } },
        select: {
          title: true,
          summary: true,
          relevance: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return {
    projectTitle: project.title,
    genre: project.genre,
    premise: project.premise,
    logline: project.logline,
    theme: project.theme,
    styleGuide: project.styleGuide,
    pov: project.pov,
    tense: project.tense,
    tone: project.tone,
    centralConflict: project.centralConflict,
    stakes: project.stakes,
    characters: project.characters.map(c => ({
      name: c.name,
      role: c.role,
      description: c.description,
      personality: c.personality,
      motivation: c.motivation,
      flaw: c.flaw,
      arc: c.characterArc,
    })),
    locations: project.locations.map(l => ({
      name: l.name,
      type: l.type,
      description: l.description,
      mood: l.mood,
    })),
    plotBeats: project.plotBeats.map(b => ({
      title: b.title,
      description: b.description,
      act: b.act,
      order: b.order,
      status: b.status,
    })),
    timelineEvents: project.timelineEvents.map(e => ({
      title: e.title,
      type: e.type,
      description: e.description,
    })),
    chapters: project.chapters.map(ch => ({
      title: ch.title,
      chapterNumber: ch.chapterNumber,
      wordCount: ch.wordCount,
      status: ch.status,
      summary: '',
    })),
    relationships: project.relationships.map(r => ({
      characterA: r.characterA.name,
      characterB: r.characterB.name,
      type: r.type,
      description: r.description,
    })),
    researchNotes: project.researchItems.map(r => ({
      title: r.title,
      summary: r.summary,
      relevance: r.relevance,
    })),
  };
}

export function buildStoryContextForPrompt(context: StoryContextForAI): string {
  const parts: string[] = [];

  parts.push(`TITLE: ${context.projectTitle}`);
  if (context.genre) parts.push(`GENRE: ${context.genre}`);
  if (context.premise) parts.push(`PREMISE: ${context.premise}`);
  if (context.theme) parts.push(`THEME: ${context.theme}`);
  if (context.centralConflict) parts.push(`CENTRAL CONFLICT: ${context.centralConflict}`);
  if (context.stakes) parts.push(`STAKES: ${context.stakes}`);
  if (context.pov) parts.push(`POV: ${context.pov}`);
  if (context.tense) parts.push(`TENSE: ${context.tense}`);
  if (context.tone) parts.push(`TONE: ${context.tone}`);
  if (context.styleGuide) parts.push(`STYLE GUIDE: ${context.styleGuide}`);

  if (context.characters.length > 0) {
    parts.push('\nCHARACTERS:');
    context.characters.forEach(c => {
      let line = `- ${c.name} (${c.role})`;
      if (c.description) line += `: ${c.description}`;
      if (c.personality) line += ` [Personality: ${c.personality}]`;
      if (c.motivation) line += ` [Motivation: ${c.motivation}]`;
      if (c.flaw) line += ` [Flaw: ${c.flaw}]`;
      parts.push(line);
    });
  }

  if (context.locations.length > 0) {
    parts.push('\nLOCATIONS:');
    context.locations.forEach(l => {
      let line = `- ${l.name} (${l.type})`;
      if (l.description) line += `: ${l.description}`;
      parts.push(line);
    });
  }

  if (context.plotBeats.length > 0) {
    parts.push('\nPLOT STRUCTURE:');
    context.plotBeats.forEach(b => {
      parts.push(`- [${b.act}] ${b.title}: ${b.description} (${b.status})`);
    });
  }

  if (context.timelineEvents.length > 0) {
    parts.push('\nTIMELINE:');
    context.timelineEvents.forEach(e => {
      parts.push(`- [${e.type}] ${e.title}: ${e.description}`);
    });
  }

  if (context.relationships.length > 0) {
    parts.push('\nRELATIONSHIPS:');
    context.relationships.forEach(r => {
      parts.push(`- ${r.characterA} <-> ${r.characterB}: ${r.type} - ${r.description}`);
    });
  }

  if (context.researchNotes.length > 0) {
    parts.push('\nRESEARCH:');
    context.researchNotes.forEach(r => {
      parts.push(`- ${r.title}: ${r.summary}`);
    });
  }

  parts.push('\nCURRENT PROGRESS:');
  parts.push(`Chapters: ${context.chapters.length} written`);
  const totalWords = context.chapters.reduce((s, c) => s + c.wordCount, 0);
  parts.push(`Total words: ${totalWords}`);

  return parts.join('\n');
}

export async function getProjectPlotContext(projectId: string): Promise<string> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      title: true,
      genre: true,
      chapters: {
        orderBy: { chapterNumber: 'asc' },
        select: {
          chapterNumber: true,
          title: true,
          wordCount: true,
          status: true,
          scenes: {
            orderBy: { sceneNumber: 'asc' },
            select: { title: true, summary: true, status: true, wordCount: true, povCharacterId: true },
          },
        },
      },
      plotBeats: {
        orderBy: { order: 'asc' },
        select: {
          act: true,
          title: true,
          linkedChapterId: true,
          order: true,
        },
      },
    },
  });

  if (!project) return '';

  const parts: string[] = [];
  parts.push(`STORY: ${project.title}`);
  if (project.genre) parts.push(`Genre: ${project.genre}`);

  if (project.plotBeats.length > 0) {
    parts.push('\nPLOT BEATS:');
    project.plotBeats.forEach(b => {
      parts.push(`  [${b.act.toUpperCase()}] ${b.title}${b.linkedChapterId ? ' → (has chapter)' : ''}`);
    });
  }

  parts.push('\nCHAPTER OUTLINE:');
  project.chapters.forEach((ch, i) => {
    parts.push(`  Ch ${ch.chapterNumber}: "${ch.title}" (${ch.wordCount}w, ${ch.status})`);
    ch.scenes.forEach(s => {
      parts.push(`    - Scene: "${s.title}" (${s.wordCount}w, ${s.status})`);
    });
  });

  return parts.join('\n');
}
