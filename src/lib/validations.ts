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

export const coverSchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().trim().min(1, 'Prompt is required'),
  style: z.string().optional(),
});

export const exportSchema = z.object({
  projectId: z.string().min(1),
  options: z.object({
    includeOriginal: z.boolean().default(true),
    includeTranslation: z.boolean().default(false),
    authorName: z.string().default('Author'),
    language: z.string().default('en'),
  }).optional(),
});
