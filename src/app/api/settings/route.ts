import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/session';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  // Profile
  penName: z.string().max(100).optional().nullable(),
  authorBio: z.string().max(2000).optional().nullable(),
  defaultAuthorName: z.string().max(100).optional().nullable(),
  website: z.string().max(500).optional().nullable(),

  // Language & AI Output
  defaultSourceLanguage: z.string().length(2).optional(),
  defaultTargetLanguage: z.string().length(2).optional(),
  defaultAiOutputLanguage: z.string().length(2).optional(),
  alwaysUseProjectTargetLanguage: z.boolean().optional(),
  translationStyle: z.enum(['faithful', 'literary', 'localized', 'simple']).optional(),
  preserveCharacterNames: z.boolean().optional(),
  preservePlaceNames: z.boolean().optional(),
  glossaryBehavior: z.enum(['preserve', 'translate', 'ask']).optional(),

  // Writing Preferences
  defaultGenre: z.string().max(100).optional().nullable(),
  defaultPOV: z.enum(['first_person', 'third_person_limited', 'third_person_omniscient']).optional(),
  defaultTense: z.enum(['past', 'present']).optional(),
  defaultChapterWordTarget: z.number().int().min(100).max(50000).optional(),
  defaultDailyWordGoal: z.number().int().min(0).max(50000).optional(),
  autosaveInterval: z.number().int().min(500).max(30000).optional(),
  defaultWritingMode: z.enum(['chapter', 'scene', 'focus']).optional(),
  manuscriptFont: z.enum(['serif', 'sans', 'mono']).optional(),
  editorDensity: z.enum(['comfortable', 'compact']).optional(),

  // AI Preferences
  aiCreativity: z.enum(['precise', 'balanced', 'imaginative']).optional(),
  defaultTone: z.enum(['literary', 'cinematic', 'simple', 'emotional', 'commercial']).optional(),
  proseStyle: z.enum(['clean', 'poetic', 'fast_paced', 'descriptive']).optional(),
  contentLevel: z.enum(['general', 'mature']).optional(),
  aiSuggestionMode: z.enum(['suggest_only', 'append_after_confirmation', 'never_auto_replace']).optional(),
  includeStoryBibleContext: z.boolean().optional(),
  includePreviousChapterContext: z.boolean().optional(),
  includeStyleGuideContext: z.boolean().optional(),

  // Export & Publishing
  defaultExportFormat: z.enum(['epub', 'pdf', 'docx', 'markdown']).optional(),
  pageSize: z.enum(['A4', 'Letter', '6x9']).optional(),
  includeTableOfContents: z.boolean().optional(),
  includeCopyrightPage: z.boolean().optional(),
  defaultCopyrightText: z.string().max(5000).optional().nullable(),
  publisherName: z.string().max(200).optional().nullable(),
  isbn: z.string().max(20).optional().nullable(),
  authorBioForExport: z.string().max(2000).optional().nullable(),
  frontMatterTemplate: z.string().max(5000).optional().nullable(),
  backMatterTemplate: z.string().max(5000).optional().nullable(),

  // Notifications
  writingReminderEnabled: z.boolean().optional(),
  writingReminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  dailyGoalReminder: z.boolean().optional(),
  weeklyProgressEmail: z.boolean().optional(),
  exportCompletedNotification: z.boolean().optional(),
  aiTaskCompletedNotification: z.boolean().optional(),
  marketingReminder: z.boolean().optional(),

  // Privacy & Security
  manuscriptPrivacy: z.enum(['private', 'link_shared', 'collaborator_only']).optional(),
  allowAITrainingOnMyManuscript: z.boolean().optional(),

  // Appearance
  theme: z.enum(['dark', 'light', 'system']).optional(),
  accentColor: z.enum(['gold', 'amber', 'blue', 'violet']).optional(),
  editorPaper: z.enum(['warm', 'white', 'sepia']).optional(),
  editorFont: z.enum(['serif', 'sans', 'mono']).optional(),
  reducedMotion: z.boolean().optional(),
  compactSidebar: z.boolean().optional(),
});

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const userId = await getUserId();

    let settings = await db.userSettings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await db.userSettings.create({ data: { userId } });
    }

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') return unauthorized();
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId();

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Upsert settings
    const settings = await db.userSettings.upsert({
      where: { userId },
      update: parsed.data,
      create: { userId, ...parsed.data },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') return unauthorized();
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
