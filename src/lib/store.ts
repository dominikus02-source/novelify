import { create } from "zustand";

// View types for the single-page navigation
export type AppView = 
  | "hero" 
  | "dashboard" 
  | "project"
  | "writing" 
  | "translate" 
  | "synopsis" 
  | "cover" 
  | "export"
  | "settings"
  // New command center views
  | "my-novels"
  | "story-bible"
  | "plot-board"
  | "ai-cowriter"
  | "writing-goals"
  | "revision"
  | "translation-studio"
  | "publishing"
  | "cover-studio"
  | "templates"
  | "research"
  | "analytics"
  | "marketing";

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

interface AppState {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  
  // Project state
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  
  // Chapter state
  selectedChapter: Chapter | null;
  setSelectedChapter: (chapter: Chapter | null) => void;
  
  // Scene state
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  selectedScene: Scene | null;
  setSelectedScene: (scene: Scene | null) => void;
  
  // Writing mode
  writingMode: 'chapter' | 'scene' | 'full' | 'focus';
  setWritingMode: (mode: 'chapter' | 'scene' | 'full' | 'focus') => void;
  
  // Studio panel tab
  studioTab: 'ai' | 'bible' | 'outline' | 'characters' | 'notes' | 'versions' | 'export';
  setStudioTab: (tab: 'ai' | 'bible' | 'outline' | 'characters' | 'notes' | 'versions' | 'export') => void;
  
  // Bible sub-tab
  bibleTab: 'characters' | 'locations' | 'timeline' | 'worldbuilding';
  setBibleTab: (tab: 'characters' | 'locations' | 'timeline' | 'worldbuilding') => void;
  
  // Versioning
  versions: ManuscriptVersion[];
  setVersions: (versions: ManuscriptVersion[]) => void;
  
  // Story Bible
  storyNotes: StoryNote[];
  setStoryNotes: (notes: StoryNote[]) => void;
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  timelineEvents: TimelineEvent[];
  setTimelineEvents: (events: TimelineEvent[]) => void;
  
  // Goals
  writingGoals: WritingGoal[];
  setWritingGoals: (goals: WritingGoal[]) => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  dashboardTab: string;
  setDashboardTab: (tab: string) => void;
  isAiWriting: boolean;
  setIsAiWriting: (writing: boolean) => void;
  isAiTranslating: boolean;
  setIsAiTranslating: (translating: boolean) => void;
  isAiGenerating: boolean;
  setIsAiGenerating: (generating: boolean) => void;
}

export const useNovelifyStore = create<AppState>((set) => ({
  // Navigation
  currentView: "hero",
  setCurrentView: (view) => set({ currentView: view }),
  
  // Projects
  projects: [],
  setProjects: (projects) => set({ projects }),
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
  
  // Chapters
  selectedChapter: null,
  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),
  
  // Scenes
  scenes: [],
  setScenes: (scenes) => set({ scenes }),
  selectedScene: null,
  setSelectedScene: (scene) => set({ selectedScene: scene }),
  
  // Writing mode
  writingMode: 'chapter',
  setWritingMode: (mode) => set({ writingMode: mode }),
  
  // Studio panel tab
  studioTab: 'ai',
  setStudioTab: (tab) => set({ studioTab: tab }),
  
  // Bible sub-tab
  bibleTab: 'characters',
  setBibleTab: (tab) => set({ bibleTab: tab }),
  
  // Versions
  versions: [],
  setVersions: (versions) => set({ versions }),
  
  // Story Bible
  storyNotes: [],
  setStoryNotes: (notes) => set({ storyNotes: notes }),
  locations: [],
  setLocations: (locations) => set({ locations }),
  timelineEvents: [],
  setTimelineEvents: (events) => set({ timelineEvents: events }),
  
  // Goals
  writingGoals: [],
  setWritingGoals: (goals) => set({ writingGoals: goals }),
  
  // UI
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  dashboardTab: 'overview',
  setDashboardTab: (tab) => set({ dashboardTab: tab }),
  isAiWriting: false,
  setIsAiWriting: (writing) => set({ isAiWriting: writing }),
  isAiTranslating: false,
  setIsAiTranslating: (translating) => set({ isAiTranslating: translating }),
  isAiGenerating: false,
  setIsAiGenerating: (generating) => set({ isAiGenerating: generating }),
}));
