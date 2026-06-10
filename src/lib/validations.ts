import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  genre: z.string().max(100).optional().nullable(),
  sourceLanguage: z.string().length(2).default('id'),
  targetLanguage: z.string().length(2).default('en'),
  plotOutline: z.string().optional().nullable(),
  styleGuide: z.string().optional().nullable(),
});

export const updateProjectSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  genre: z.string().max(100).optional().nullable(),
  status: z.enum(['draft', 'translating', 'ready', 'exported']).optional(),
  coverImage: z.string().optional().nullable(),
  plotOutline: z.string().optional().nullable(),
  styleGuide: z.string().optional().nullable(),
});

export const createChapterSchema = z.object({
  projectId: z.string().min(1),
  chapterNumber: z.number().int().positive(),
  title: z.string().trim().min(1, 'Title is required').max(200),
});

export const createSceneSchema = z.object({
  chapterId: z.string().min(1),
  sceneNumber: z.number().int().positive(),
  title: z.string().trim().min(1, 'Title is required').max(200),
});

export const updateSceneSchema = z.object({
  content: z.string().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  summary: z.string().optional(),
  goal: z.string().optional(),
  conflict: z.string().optional(),
  outcome: z.string().optional(),
  wordCount: z.number().int().nonnegative().optional(),
  targetWordCount: z.number().int().nonnegative().optional(),
  status: z.enum(['idea', 'drafting', 'revised', 'edited', 'locked']).optional(),
});

export const updateChapterSchema = z.object({
  contentOriginal: z.string().optional(),
  contentTranslated: z.string().optional().nullable(),
  title: z.string().trim().min(1).max(200).optional(),
  wordCount: z.number().int().nonnegative().optional(),
  status: z.enum(['draft', 'reviewed', 'locked']).optional(),
});

export const createCharacterSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().default(''),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).default('supporting'),
});

export const aiWriteSchema = z.object({
  projectId: z.string().optional(),
  chapterId: z.string().optional(),
  prompt: z.string().trim().min(1, 'Prompt is required'),
  context: z.object({
    chapterContent: z.string().optional(),
    plotOutline: z.string().optional(),
    characters: z.string().optional(),
    styleGuide: z.string().optional(),
    sourceLanguage: z.string().optional(),
  }).optional(),
});

export const translateSchema = z.object({
  projectId: z.string().optional(),
  chapterId: z.string().optional(),
  sourceLanguage: z.string().min(1, 'sourceLanguage is required'),
  targetLanguage: z.string().min(1, 'targetLanguage is required'),
  content: z.string().min(1, 'content is required'),
});

export const synopsisSchema = z.object({
  projectId: z.string().optional(),
  type: z.enum(['blurb', 'amazon']),
  context: z.object({
    title: z.string().min(1, 'title is required'),
    genre: z.string().optional(),
    plotOutline: z.string().optional(),
  }),
});

export const coverUploadSchema = z.object({
  projectId: z.string().min(1),
});

export const createWritingGoalSchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(['daily', 'weekly', 'monthly', 'project']).default('daily'),
  targetWords: z.number().int().nonnegative().default(1000),
  currentWords: z.number().int().nonnegative().default(0),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
});

export const updateWritingGoalSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'project']).optional(),
  targetWords: z.number().int().nonnegative().optional(),
  currentWords: z.number().int().nonnegative().optional(),
  endDate: z.string().optional().nullable(),
});

export const createStoryNoteSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().default(''),
  category: z.enum(['general', 'character', 'plot', 'worldbuilding', 'research']).default('general'),
  linkedChapterId: z.string().optional().nullable(),
  linkedSceneId: z.string().optional().nullable(),
});

export const updateStoryNoteSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().optional(),
  category: z.enum(['general', 'character', 'plot', 'worldbuilding', 'research']).optional(),
  linkedChapterId: z.string().optional().nullable(),
  linkedSceneId: z.string().optional().nullable(),
});

export const createLocationSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().default(''),
  importance: z.enum(['minor', 'major', 'critical']).default('minor'),
});

export const updateLocationSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().optional(),
  importance: z.enum(['minor', 'major', 'critical']).optional(),
});

export const createTimelineEventSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().default(''),
  eventDateOrOrder: z.number().optional().nullable(),
  linkedSceneId: z.string().optional().nullable(),
});

export const updateTimelineEventSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().optional(),
  eventDateOrOrder: z.number().optional().nullable(),
  linkedSceneId: z.string().optional().nullable(),
});

export const createVersionSchema = z.object({
  projectId: z.string().min(1),
  chapterId: z.string().optional().nullable(),
  sceneId: z.string().optional().nullable(),
  content: z.string().default(''),
  wordCount: z.number().int().nonnegative().default(0),
  label: z.string().default(''),
});

export const updateCharacterSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).optional(),
});

export const exportSchema = z.object({
  projectId: z.string().min(1),
  format: z.enum(['epub', 'pdf']).default('epub'),
  options: z.object({
    includeOriginal: z.boolean().default(true),
    includeTranslation: z.boolean().default(false),
    authorName: z.string().default('Author'),
    language: z.string().default('en'),
  }).optional(),
});
