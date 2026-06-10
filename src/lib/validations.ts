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
  age: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  physicalDescription: z.string().optional().nullable(),
  personality: z.string().optional().nullable(),
  motivation: z.string().optional().nullable(),
  fear: z.string().optional().nullable(),
  secret: z.string().optional().nullable(),
  flaw: z.string().optional().nullable(),
  strength: z.string().optional().nullable(),
  backstory: z.string().optional().nullable(),
  characterArc: z.string().optional().nullable(),
  relationshipToProtagonist: z.string().optional().nullable(),
  firstAppearanceChapter: z.string().optional().nullable(),
  status: z.string().default('alive'),
  notes: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  colorTag: z.string().optional().nullable(),
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
  age: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  physicalDescription: z.string().optional().nullable(),
  personality: z.string().optional().nullable(),
  motivation: z.string().optional().nullable(),
  fear: z.string().optional().nullable(),
  secret: z.string().optional().nullable(),
  flaw: z.string().optional().nullable(),
  strength: z.string().optional().nullable(),
  backstory: z.string().optional().nullable(),
  characterArc: z.string().optional().nullable(),
  relationshipToProtagonist: z.string().optional().nullable(),
  firstAppearanceChapter: z.string().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  colorTag: z.string().optional().nullable(),
});

export const exportSchema = z.object({
  projectId: z.string().min(1),
  format: z.enum(['epub', 'pdf', 'docx', 'markdown']).default('epub'),
  options: z.object({
    includeScenes: z.boolean().default(false),
    authorName: z.string().default('Author'),
    language: z.string().default('en'),
    coverImage: z.string().optional().nullable(),
  }).optional(),
});

export const updatePublishingMetadataSchema = z.object({
  bookTitle: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  seriesTitle: z.string().optional().nullable(),
  seriesNumber: z.number().int().optional().nullable(),
  authorName: z.string().optional().nullable(),
  publisherName: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  subgenre: z.string().optional().nullable(),
  keywordsJson: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  ageRange: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  copyrightYear: z.number().int().optional().nullable(),
  copyrightHolder: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  logline: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  synopsis: z.string().optional().nullable(),
  blurb: z.string().optional().nullable(),
  amazonDescription: z.string().optional().nullable(),
  goodreadsDescription: z.string().optional().nullable(),
  authorBio: z.string().optional().nullable(),
  authorWebsite: z.string().optional().nullable(),
  authorSocialJson: z.string().optional().nullable(),
});

export const updateFrontMatterSchema = z.object({
  includeTitlePage: z.boolean().optional(),
  includeCopyrightPage: z.boolean().optional(),
  copyrightNotice: z.string().optional().nullable(),
  includeDedication: z.boolean().optional(),
  dedication: z.string().optional().nullable(),
  includeEpigraph: z.boolean().optional(),
  epigraph: z.string().optional().nullable(),
  includeForeword: z.boolean().optional(),
  foreword: z.string().optional().nullable(),
  includePreface: z.boolean().optional(),
  preface: z.string().optional().nullable(),
  includeAcknowledgments: z.boolean().optional(),
  acknowledgments: z.string().optional().nullable(),
  includeTableOfContents: z.boolean().optional(),
  alsoByAuthor: z.string().optional().nullable(),
});

export const updateBackMatterSchema = z.object({
  includeAboutAuthor: z.boolean().optional(),
  aboutAuthor: z.string().optional().nullable(),
  includeAuthorWebsite: z.boolean().optional(),
  authorWebsite: z.string().optional().nullable(),
  includeReviewRequest: z.boolean().optional(),
  reviewRequest: z.string().optional().nullable(),
  includeNewsletterSignup: z.boolean().optional(),
  newsletterSignup: z.string().optional().nullable(),
  includeThankYou: z.boolean().optional(),
  thankYouNote: z.string().optional().nullable(),
  includeNextBookTeaser: z.boolean().optional(),
  nextBookTeaser: z.string().optional().nullable(),
  includeAlsoByAuthor: z.boolean().optional(),
  alsoByAuthor: z.string().optional().nullable(),
});

export const updateChecklistSchema = z.object({
  metadataComplete: z.boolean().optional(),
  coverReady: z.boolean().optional(),
  synopsisReady: z.boolean().optional(),
  blurbReady: z.boolean().optional(),
  frontMatterReady: z.boolean().optional(),
  backMatterReady: z.boolean().optional(),
  manuscriptReady: z.boolean().optional(),
  revisionReady: z.boolean().optional(),
  exportReady: z.boolean().optional(),
});

export const createPlotBeatSchema = z.object({
  projectId: z.string().min(1),
  template: z.string().default('three-act'),
  act: z.string().default('act1'),
  order: z.number().default(0),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().default(''),
  status: z.string().default('idea'),
  linkedChapterId: z.string().optional().nullable(),
  linkedSceneId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updatePlotBeatSchema = z.object({
  template: z.string().optional(),
  act: z.string().optional(),
  order: z.number().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  linkedChapterId: z.string().optional().nullable(),
  linkedSceneId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createRelationshipSchema = z.object({
  projectId: z.string().min(1),
  characterAId: z.string().min(1),
  characterBId: z.string().min(1),
  type: z.string().default('complicated'),
  description: z.string().optional().default(''),
  conflict: z.string().optional().nullable(),
  evolution: z.string().optional().nullable(),
});

export const updateRelationshipSchema = z.object({
  type: z.string().optional(),
  description: z.string().optional(),
  conflict: z.string().optional().nullable(),
  evolution: z.string().optional().nullable(),
});

export const createResearchItemSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1, 'Title is required'),
  sourceUrl: z.string().optional().nullable(),
  summary: z.string().optional().default(''),
  notes: z.string().optional().nullable(),
  relevance: z.string().default('moderate'),
  linkedCharacterId: z.string().optional().nullable(),
  linkedLocationId: z.string().optional().nullable(),
  linkedChapterId: z.string().optional().nullable(),
});

export const updateResearchItemSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  sourceUrl: z.string().optional().nullable(),
  summary: z.string().optional(),
  notes: z.string().optional().nullable(),
  relevance: z.string().optional(),
  linkedCharacterId: z.string().optional().nullable(),
  linkedLocationId: z.string().optional().nullable(),
  linkedChapterId: z.string().optional().nullable(),
});

export const updateProjectOverviewSchema = z.object({
  premise: z.string().optional().nullable(),
  logline: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  pov: z.string().optional().nullable(),
  tense: z.string().optional().nullable(),
  tone: z.string().optional().nullable(),
  centralConflict: z.string().optional().nullable(),
  stakes: z.string().optional().nullable(),
  endingIdea: z.string().optional().nullable(),
});

export const createBulkChaptersSchema = z.object({
  projectId: z.string().min(1),
  count: z.number().int().positive().default(5),
  titlePrefix: z.string().default('Chapter'),
});

export const reorderScenesSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    order: z.number().int().positive(),
  })),
});

export const reorderChaptersSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    order: z.number().int().positive(),
  })),
});

export const convertBeatToChapterSchema = z.object({
  beatId: z.string().min(1),
  title: z.string().optional(),
});

export const createChapterWithSceneSchema = z.object({
  projectId: z.string().min(1),
  chapterNumber: z.number().int().positive(),
  chapterTitle: z.string().optional(),
  sceneTitle: z.string().optional(),
});
