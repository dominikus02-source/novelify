import { NextRequest, NextResponse } from 'next/server';
import { aiWriteSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';
import { createChatCompletion } from '@/lib/ai';

const limiter = rateLimit({ interval: 30000, maxRequests: 5 });

// POST /api/write - AI writing assistant
export async function POST(request: NextRequest) {
  try {
    const limitCheck = limiter.check(request);
    if (limitCheck) return limitCheck;

    const body = await request.json();
    const parsed = aiWriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { prompt, context } = parsed.data;
    const { chapterContent, plotOutline, characters, styleGuide, sourceLanguage, projectTitle, genre } = context || {};

    // Build the system prompt — language-agnostic novel writing specialist
    const systemPrompt = `You are a professional novel-writing assistant. Your task is to continue the story or polish the user's prose. Detect the language of the user's content automatically and respond in the same language.

RULES:
- Detect and use the SAME language as the user's content (English, Indonesian, Spanish, etc.)
- Fix grammar, spelling, and awkward phrasing naturally — never mention you fixed anything
- Improve flow and readability while preserving the author's voice and style
- Maintain consistent POV, tense, and character voice
- Show-don't-tell technique
- Natural dialogue that fits each character
- No plot contradictions
- Appropriate pacing for the scene
- 200-500 words per response (adjust to scene needs)
- End with a natural hook when possible (for chapter/scene transitions)
- Follow genre conventions if specified (romance, fantasy, mystery, thriller, etc.)

If the user submits existing text for polishing, treat it as a proofread/edit request — improve the language and feel without changing the story content.`;

    // Build the user message with context
    let userMessage = '';

    if (plotOutline) {
      userMessage += `Plot Outline:\n${plotOutline}\n\n`;
    }

    if (characters) {
      userMessage += `Characters:\n${characters}\n\n`;
    }

    if (styleGuide) {
      userMessage += `Style Guide:\n${styleGuide}\n\n`;
    }

    if (chapterContent) {
      userMessage += `Current Chapter Content:\n${chapterContent}\n\n`;
    }

    userMessage += `Writer's Request: ${prompt}`;

    const content = await createChatCompletion([
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in AI writing assistant:', error);
    return NextResponse.json(
      { error: 'Failed to generate writing' },
      { status: 500 }
    );
  }
}
