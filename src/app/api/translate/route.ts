import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/translate - Literary translation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, chapterId, sourceLanguage, targetLanguage, content } = body;

    if (!sourceLanguage) {
      return NextResponse.json(
        { error: 'sourceLanguage is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'targetLanguage is required' },
        { status: 400 }
      );
    }

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    // Build the system prompt for literary translation
    const systemPrompt = `You are a professional literary translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}.
Preserve the voice, tone, emotion, and literary quality of the original.
This is a meaning-for-meaning translation, not word-for-word.
Maintain the narrative flow and artistic style.`;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content },
      ],
      thinking: { type: 'disabled' },
    });

    const translatedText = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content: translatedText });
  } catch (error) {
    console.error('Error in translation:', error);
    return NextResponse.json(
      { error: 'Failed to translate content' },
      { status: 500 }
    );
  }
}
