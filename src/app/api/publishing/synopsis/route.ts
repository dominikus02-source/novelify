import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { resolveLanguageContext, buildNovelSystemPrompt } from '@/lib/language-resolver';

const SYNOPSIS_TYPES = ['blurb', 'amazon', 'logline', 'tagline'] as const;

const TYPE_PROMPTS: Record<string, string> = {
  blurb: `Write a compelling book blurb (back-cover copy).

RULES:
- Length: 150-200 words
- Open with a strong hook
- Introduce the main character's conflict/stakes
- Create intrigue without spoilers
- End with a question or dramatic statement
- Use emotive, engaging language`,

  amazon: `Write an Amazon KDP product description.

STRUCTURE:
1. HEADLINE (bold): One-line strong hook
2. Description body (2-3 paragraphs): Engaging premise
3. BULLET POINTS: 3-5 key selling features
4. CALL TO ACTION: Natural purchase invitation

RULES:
- Short paragraphs for mobile readability
- Total length: 300-500 words
- Include genre keywords naturally for SEO
- Match tone to genre`,

  logline: `Write a one-sentence logline for the book.

RULES:
- Exactly 1 sentence, 25-50 words
- Format: "When [inciting incident], [protagonist] must [central conflict] or [stakes]"
- Capture the core dramatic tension
- No proper nouns unless famous`,

  tagline: `Write a short, memorable tagline for the book.

RULES:
- 5-10 words
- Punchy, evocative, memorable
- Like a movie poster tagline
- Capture the emotional core or genre promise`,
};

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { projectId, type } = body;

    if (!projectId || !type || !SYNOPSIS_TYPES.includes(type)) {
      return NextResponse.json(
        { error: 'projectId and type (blurb|amazon|logline|tagline) are required' },
        { status: 400 },
      );
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { userId: true, title: true, genre: true, premise: true, logline: true, theme: true },
    });

    if (!project || project.userId !== userId) {
      return new Response(null, { status: 403 });
    }

    const language = await resolveLanguageContext(userId, projectId);

    // Fetch plot beats for blurb/amazon
    let plotOutline = '';
    if (type === 'blurb' || type === 'amazon') {
      const beats = await db.plotBeat.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
        select: { title: true, description: true, act: true },
      });
      if (beats.length > 0) {
        plotOutline = beats.map(b => `[${b.act}] ${b.title}: ${b.description}`).join('\n');
      }
    }

    const systemPrompt = `${buildNovelSystemPrompt('synopsis', language, project.genre)}

You are a professional book marketing copywriter.

${TYPE_PROMPTS[type]}`;

    let userMessage = `Novel Title: ${project.title}`;
    if (project.premise) userMessage += `\nPremise: ${project.premise}`;
    if (project.logline) userMessage += `\nLogline: ${project.logline}`;
    if (project.theme) userMessage += `\nTheme: ${project.theme}`;
    if (plotOutline) userMessage += `\n\nPlot Outline:\n${plotOutline}`;

    const apiKey = process.env.ZAI_API_KEY;
    const baseUrl = process.env.ZAI_BASE_URL || 'https://api.deepseek.com';

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.ZAI_MODEL || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || '';

    // Optionally update publishingMetadata
    const metadataUpdate: Record<string, string> = {};
    if (type === 'blurb') metadataUpdate.blurb = generatedText;
    else if (type === 'amazon') metadataUpdate.amazonDescription = generatedText;
    else if (type === 'logline') metadataUpdate.logline = generatedText;
    else if (type === 'tagline') metadataUpdate.tagline = generatedText;

    if (Object.keys(metadataUpdate).length > 0) {
      await db.publishingMetadata.upsert({
        where: { projectId },
        update: metadataUpdate,
        create: { projectId, ...metadataUpdate },
      });
    }

    return NextResponse.json({
      content: generatedText,
      type,
      aiOutputLanguage: language.aiOutputLanguage,
    });
  } catch (error) {
    console.error('Error generating synopsis:', error);
    return NextResponse.json({ error: 'Failed to generate synopsis' }, { status: 500 });
  }
}
