import { create } from "zustand";

export type AppView =
  | "hero"
  | "dashboard"
  | "my-novels"
  | "writing"
  | "story-bible"
  | "plot-board"
  | "ai-cowriter"
  | "revision"
  | "translation"
  | "publishing"
  | "templates"
  | "marketing"
  | "settings"
  | "project";

export interface Project {
  id: string;
  title: string;
  genre: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  status: string;
  plotOutline: string | null;
  styleGuide: string | null;
  coverImage: string | null;
  wordTarget: number;
  chaptersTarget: number;
  templateId: string | null;
  createdAt: string;
  updatedAt: string;
  chapters: Chapter[];
  characters: Character[];
}

export interface Scene {
  id: string;
  chapterId: string;
  sceneNumber: number;
  title: string;
  content: string;
  summary: string;
  goal: string;
  conflict: string;
  outcome: string;
  povCharacterId: string | null;
  wordCount: number;
  targetWordCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  projectId: string;
  chapterNumber: number;
  title: string;
  contentOriginal: string;
  contentTranslated: string | null;
  wordCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  scenes: Scene[];
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  description: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManuscriptVersion {
  id: string;
  projectId: string;
  chapterId: string | null;
  sceneId: string | null;
  content: string;
  wordCount: number;
  label: string;
  createdAt: string;
}

export interface WritingGoal {
  id: string;
  projectId: string;
  type: string;
  targetWords: number;
  currentWords: number;
  startDate: string;
  endDate: string | null;
}

export interface StoryNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  category: string;
  linkedChapterId: string | null;
  linkedSceneId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  projectId: string;
  name: string;
  description: string;
  importance: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  title: string;
  description: string;
  eventDateOrOrder: number | null;
  linkedSceneId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Views that need a selected project to function
export const PROJECT_VIEWS: AppView[] = [
  'writing', 'story-bible', 'plot-board',
  'revision', 'translation', 'publishing',
];

// Views that can resolve from the store without a project
export function resolveActiveProject(
  projects: Project[],
  selectedProject: Project | null,
  lastActiveProjectId: string | null,
): Project | null {
  if (selectedProject) return selectedProject;
  if (lastActiveProjectId) {
    const found = projects.find(p => p.id === lastActiveProjectId);
    if (found) return found;
  }
  if (projects.length > 0) {
    return projects.reduce((a, b) =>
      new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
    );
  }
  return null;
}

interface AppState {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  projects: Project[];
  setProjects: (projects: Project[]) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  lastActiveProjectId: string | null;

  selectedChapter: Chapter | null;
  setSelectedChapter: (chapter: Chapter | null) => void;

  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  selectedScene: Scene | null;
  setSelectedScene: (scene: Scene | null) => void;

  writingMode: 'chapter' | 'scene' | 'full' | 'focus';
  setWritingMode: (mode: 'chapter' | 'scene' | 'full' | 'focus') => void;

  studioTab: 'ai' | 'bible' | 'outline' | 'characters' | 'notes' | 'versions' | 'export';
  setStudioTab: (tab: 'ai' | 'bible' | 'outline' | 'characters' | 'notes' | 'versions' | 'export') => void;

  bibleTab: 'characters' | 'locations' | 'timeline' | 'worldbuilding' | 'research';
  setBibleTab: (tab: 'characters' | 'locations' | 'timeline' | 'worldbuilding' | 'research') => void;

  versions: ManuscriptVersion[];
  setVersions: (versions: ManuscriptVersion[]) => void;

  storyNotes: StoryNote[];
  setStoryNotes: (notes: StoryNote[]) => void;
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  timelineEvents: TimelineEvent[];
  setTimelineEvents: (events: TimelineEvent[]) => void;

  writingGoals: WritingGoal[];
  setWritingGoals: (goals: WritingGoal[]) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isAiWriting: boolean;
  setIsAiWriting: (writing: boolean) => void;
  isAiTranslating: boolean;
  setIsAiTranslating: (translating: boolean) => void;
  isAiGenerating: boolean;
  setIsAiGenerating: (generating: boolean) => void;
}

export const useNovelifyStore = create<AppState>((set, get) => ({
  currentView: "hero",
  setCurrentView: (view) => set({ currentView: view }),

  projects: [],
  setProjects: (projects) => set({ projects }),
  selectedProject: null,
  setSelectedProject: (project) => set({
    selectedProject: project,
    lastActiveProjectId: project?.id || null,
  }),
  lastActiveProjectId: null,

  selectedChapter: null,
  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),

  scenes: [],
  setScenes: (scenes) => set({ scenes }),
  selectedScene: null,
  setSelectedScene: (scene) => set({ selectedScene: scene }),

  writingMode: 'chapter',
  setWritingMode: (mode) => set({ writingMode: mode }),

  studioTab: 'ai',
  setStudioTab: (tab) => set({ studioTab: tab }),

  bibleTab: 'characters',
  setBibleTab: (tab) => set({ bibleTab: tab }),

  versions: [],
  setVersions: (versions) => set({ versions }),

  storyNotes: [],
  setStoryNotes: (notes) => set({ storyNotes: notes }),
  locations: [],
  setLocations: (locations) => set({ locations }),
  timelineEvents: [],
  setTimelineEvents: (events) => set({ timelineEvents: events }),

  writingGoals: [],
  setWritingGoals: (goals) => set({ writingGoals: goals }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  isAiWriting: false,
  setIsAiWriting: (writing) => set({ isAiWriting: writing }),
  isAiTranslating: false,
  setIsAiTranslating: (translating) => set({ isAiTranslating: translating }),
  isAiGenerating: false,
  setIsAiGenerating: (generating) => set({ isAiGenerating: generating }),
}));
