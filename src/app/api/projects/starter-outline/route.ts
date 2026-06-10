import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserId, unauthorized } from '@/lib/session';
import { resolveLanguageContext } from '@/lib/language-resolver';
import { createChatCompletion } from '@/lib/ai';
import { getStructureBeats } from '@/lib/templates';
import { db } from '@/lib/db';
import { trackUsage } from '@/lib/billing/usage';

const starterOutlineSchema = z.object({
  storyType: z.string(),
  genre: z.string(),
  customGenre: z.string().optional(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  aiOutputLanguage: z.string(),
  structureTemplate: z.string(),
  pov: z.string().optional(),
  tense: z.string().optional(),
  tone: z.string().optional(),
  proseStyle: z.string().optional(),
  targetAudience: z.string().optional(),
  targetWordCount: z.number().optional(),
  workingTitle: z.string().optional(),
  premise: z.string().optional(),
  mainCharacterIdea: z.string().optional(),
  settingIdea: z.string().optional(),
  conflictIdea: z.string().optional(),
  endingIdea: z.string().optional(),
  specialNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();

    const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const userPlan = user?.plan || 'free';
    await trackUsage(userId, userPlan, 'starter_outline', 1);

    const body = await request.json();
    const parsed = starterOutlineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const {
      storyType, genre, customGenre,
      structureTemplate, pov, tense, tone, proseStyle,
      targetAudience, targetWordCount,
      workingTitle, premise, mainCharacterIdea, settingIdea,
      conflictIdea, endingIdea, specialNotes,
    } = parsed.data;

    const languageContext = await resolveLanguageContext(userId);
    const effectiveTarget = parsed.data.targetLanguage || languageContext.targetLanguage;

    const systemPrompt = `You are a novel outline assistant. Output ALL content in ${effectiveTarget}. If the user writes their premise in another language, still output in ${effectiveTarget}. Preserve proper names and place names.

Your task is to generate a structured novel outline as valid JSON. Do NOT include any text outside the JSON object.

The JSON must follow this exact structure:
{
  "title": "string",
  "logline": "string",
  "premise": "string",
  "theme": "string",
  "centralConflict": "string",
  "mainCharacters": [
    { "name": "string", "role": "string", "motivation": "string", "flaw": "string", "arc": "string" }
  ],
  "locations": [
    { "name": "string", "type": "string", "description": "string" }
  ],
  "plotBeats": [
    { "act": "string", "order": number, "title": "string", "description": "string" }
  ],
  "chapterOutline": [
    { "chapterNumber": number, "title": "string", "summary": "string", "purpose": "string", "targetWordCount": number }
  ],
  "sceneCards": [
    { "chapterNumber": number, "title": "string", "summary": "string", "sceneGoal": "string", "conflict": "string", "outcome": "string" }
  ],
  "storyBibleNotes": [
    { "category": "string", "title": "string", "content": "string" }
  ],
  "styleGuide": "string"
}`;

    const genreDisplay = genre === 'custom' && customGenre ? customGenre : genre;

    const userPrompt = `Generate a ${storyType} outline in the ${genreDisplay} genre using the ${structureTemplate} structure.

Details:
${workingTitle ? `- Working Title: ${workingTitle}` : ''}
${premise ? `- Premise: ${premise}` : ''}
${mainCharacterIdea ? `- Main Character Idea: ${mainCharacterIdea}` : ''}
${settingIdea ? `- Setting Idea: ${settingIdea}` : ''}
${conflictIdea ? `- Conflict Idea: ${conflictIdea}` : ''}
${endingIdea ? `- Ending Idea: ${endingIdea}` : ''}
${pov ? `- POV: ${pov}` : ''}
${tense ? `- Tense: ${tense}` : ''}
${tone ? `- Tone: ${tone}` : ''}
${proseStyle ? `- Prose Style: ${proseStyle}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${targetWordCount ? `- Target Word Count: ${targetWordCount}` : ''}
${specialNotes ? `- Special Notes: ${specialNotes}` : ''}

Output language: ${effectiveTarget}`;

    let parsedOutline: Record<string, unknown>;
    try {
      const aiResponse = await createChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      parsedOutline = JSON.parse(jsonStr);
    } catch {
      const beats = getStructureBeats(structureTemplate);
      const wordsPerChapter = targetWordCount
        ? Math.round(targetWordCount / Math.max(beats.length, 1))
        : 2500;
      parsedOutline = {
        title: workingTitle || 'Untitled',
        logline: '',
        premise: premise || '',
        theme: '',
        centralConflict: conflictIdea || '',
        mainCharacters: mainCharacterIdea
          ? [{ name: mainCharacterIdea, role: 'protagonist', motivation: '', flaw: '', arc: '' }]
          : [],
        locations: settingIdea
          ? [{ name: settingIdea, type: 'other', description: '' }]
          : [],
        plotBeats: beats,
        chapterOutline: beats.map((beat, i) => ({
          chapterNumber: i + 1,
          title: beat.title,
          summary: beat.description,
          purpose: '',
          targetWordCount: wordsPerChapter,
        })),
        sceneCards: [],
        storyBibleNotes: [],
        styleGuide: '',
      };
    }

    return NextResponse.json({
      success: true,
      data: { ...parsedOutline, _language: effectiveTarget },
      usedTemplate: structureTemplate,
      language: effectiveTarget,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorized();
    }
    console.error('Error generating outline:', error);
    return NextResponse.json({ error: 'Failed to generate outline' }, { status: 500 });
  }
}
