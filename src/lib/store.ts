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
  | "settings";

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
  createdAt: string;
  updatedAt: string;
  chapters: Chapter[];
  characters: Character[];
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
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
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
  
  // UI
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  isAiWriting: false,
  setIsAiWriting: (writing) => set({ isAiWriting: writing }),
  isAiTranslating: false,
  setIsAiTranslating: (translating) => set({ isAiTranslating: translating }),
  isAiGenerating: false,
  setIsAiGenerating: (generating) => set({ isAiGenerating: generating }),
}));
