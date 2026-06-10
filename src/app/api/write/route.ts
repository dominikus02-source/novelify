import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { aiWriteSchema } from '@/lib/validations';

// POST /api/write - AI writing assistant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = aiWriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { prompt, context } = parsed.data;
    const { chapterContent, plotOutline, characters, styleGuide, sourceLanguage } = context || {};

    // Build the system prompt
    const systemPrompt = `You are a literary writing assistant for a novelist. Continue writing the story based on the user's prompt.
Maintain voice consistency and literary quality. Write in the ${sourceLanguage || 'the original'} language.
Do not introduce plot contradictions. Write approximately 200-500 words.`;

    // Build the user message with context
    let userMessage = '';

    if (plotOutline) {
      userMessage += `Plot Outline:\n${plotOutline}\n\n`;
    }

    if (characters && characters.length > 0) {
      userMessage += `Characters:\n${characters.map((c: { name: string; description: string; role: string }) => `- ${c.name} (${c.role}): ${c.description}`).join('\n')}\n\n`;
    }

    if (styleGuide) {
      userMessage += `Style Guide:\n${styleGuide}\n\n`;
    }

    if (chapterContent) {
      userMessage += `Current Chapter Content:\n${chapterContent}\n\n`;
    }

    userMessage += `Writer's Request: ${prompt}`;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in AI writing assistant:', error);
    return NextResponse.json(
      { error: 'Failed to generate writing' },
      { status: 500 }
    );
  }
}
