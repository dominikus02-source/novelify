import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/synopsis - Synopsis/description generator
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, type, context } = body;

    if (!type || (type !== 'blurb' && type !== 'amazon')) {
      return NextResponse.json(
        { error: 'type must be "blurb" or "amazon"' },
        { status: 400 }
      );
    }

    const { title, genre, plotOutline } = context || {};

    if (!title) {
      return NextResponse.json(
        { error: 'title is required in context' },
        { status: 400 }
      );
    }

    // Build the appropriate system prompt based on type
    let systemPrompt: string;
    if (type === 'blurb') {
      systemPrompt = `You are a professional book marketing copywriter. Write a compelling back-cover blurb for this novel. 150-200 words. Hook the reader. Create intrigue without spoilers. End with a question or dramatic statement that makes readers want to buy the book.`;
    } else {
      systemPrompt = `You are a professional book marketing copywriter specializing in Amazon KDP listings. Write an Amazon KDP product description for this novel. Include compelling headline, bullet points of key selling features, and a call to action. 300-500 words. Use formatting that stands out on Amazon's product page.`;
    }

    // Build user message with novel context
    let userMessage = `Novel Title: ${title}\n`;
    if (genre) {
      userMessage += `Genre: ${genre}\n`;
    }
    if (plotOutline) {
      userMessage += `Plot Outline:\n${plotOutline}\n`;
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    });

    const generatedText = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content: generatedText });
  } catch (error) {
    console.error('Error generating synopsis:', error);
    return NextResponse.json(
      { error: 'Failed to generate synopsis' },
      { status: 500 }
    );
  }
}
