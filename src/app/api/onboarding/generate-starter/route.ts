import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createChatCompletion } from '@/lib/ai';

interface WizardInput {
  storyType: string;
  genre: string;
  idea?: string;
  style: string;
  language: string;
  aiHelp: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: WizardInput = await request.json();
    const { storyType, genre, idea, style, language, aiHelp } = body;

    const ideaText = idea || 'A compelling story with an unexpected twist';
    const helpLevel = aiHelp === 'full' ? 'detailed with complete chapter-by-chapter plan' :
      aiHelp === 'outline' ? 'with a structured chapter outline' :
      aiHelp === 'chapter' ? 'with a chapter-by-chapter guide' : 'basic organizational framework';

    const systemPrompt = `You are a professional story development editor. You help writers structure their novel idea into a complete starter workspace.

Output valid JSON only (no markdown, no code fences):
{
  "title": "working title",
  "logline": "one-sentence hook",
  "premise": "2-3 sentence premise",
  "theme": "core theme",
  "targetReader": "who this story is for",
  "tone": "tone matching the story",
  "protagonist": { "name": "name", "role": "protagonist", "description": "brief description", "desire": "what they want", "conflict": "internal or external conflict", "emotionalWound": "past wound" },
  "antagonist": { "name": "name", "role": "antagonist", "description": "brief description", "motivation": "why they oppose" },
  "supportingCharacter": { "name": "name", "role": "supporting", "description": "brief description" },
  "beginning": "how the story opens",
  "middle": "what happens in the middle",
  "ending": "how it resolves",
  "majorTurningPoints": ["point 1", "point 2", "point 3"],
  "stakes": "what is at risk",
  "climaxIdea": "climax concept",
  "chapterOutline": [
    { "chapter": 1, "title": "chapter title", "purpose": "short purpose of this chapter", "openingImage": "how the chapter opens", "conflict": "what conflict arises", "firstParagraphSuggestion": "first paragraph text" }
  ],
  "firstScene": { "goal": "scene goal", "openingImage": "scene opening", "conflict": "conflict in scene", "firstParagraph": "first paragraph text" },
  "storyBibleNotes": [{ "title": "note title", "content": "note content", "category": "general|character|worldbuilding|lore|research" }],
  "plotBeats": [{ "act": "act1|act2|act3", "order": 1, "title": "beat title", "description": "beat description" }]
}`;

    const userMessage = `Create a ${storyType} starter workspace.

Genre: ${genre}
Story Idea: ${ideaText}
Writing Style: ${style}
Language: ${language}
Help Level: ${helpLevel}

Generate ${storyType === 'short story' ? '5-8' : '10-15'} chapters. Chapter 1 should have the most detail with a full firstParagraphSuggestion.
All content must be in ${language}.
Output ONLY valid JSON.`;

    const response = await createChatCompletion([
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ]);

    let parsed;
    try {
      const cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsed, language });
  } catch (error) {
    console.error('Onboarding generate error:', error);
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 });
  }
}
