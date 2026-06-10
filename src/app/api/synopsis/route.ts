import { NextRequest, NextResponse } from 'next/server';
import { synopsisSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';
import { createChatCompletion } from '@/lib/ai';

const limiter = rateLimit({ interval: 30000, maxRequests: 5 });

// POST /api/synopsis - Synopsis/description generator
export async function POST(request: NextRequest) {
  try {
    const limitCheck = limiter.check(request);
    if (limitCheck) return limitCheck;

    const body = await request.json();
    const parsed = synopsisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, context } = parsed.data;
    const { title, genre, plotOutline } = context;

    // Build the appropriate system prompt based on type
    let systemPrompt: string;
    if (type === 'blurb') {
      systemPrompt = `You are a professional book marketing copywriter. Write a compelling back-cover blurb for this novel. Detect the language from the context and write in that same language.

RULES:
- Length: 150-200 words
- Open with a strong hook
- Introduce the main character's conflict/stakes
- Create intrigue without spoilers
- End with a question or dramatic statement
- Use emotive, engaging language
- Goal: make readers want to buy/read the book immediately`;
    } else {
      systemPrompt = `You are a professional book marketing copywriter specializing in Amazon KDP listings. Write an Amazon KDP product description for this novel. Detect the language from the context and write in that same language.

STRUCTURE:
1. HEADLINE (bold): One-line strong hook
2. Description body (2-3 paragraphs): Engaging premise
3. BULLET POINTS: 3-5 key selling features (plot, characters, themes, uniqueness)
4. CALL TO ACTION: Natural purchase invitation

RULES:
- Short paragraphs for mobile readability
- Total length: 300-500 words
- Include genre keywords naturally (for Amazon SEO)
- Match tone to genre (romance=passionate, thriller=tense, etc.)
- End with CTA like "Scroll up, click 'Buy Now', and dive into [title] today!"`;
    }

    // Build user message with novel context
    let userMessage = `Novel Title: ${title}\n`;
    if (genre) {
      userMessage += `Genre: ${genre}\n`;
    }
    if (plotOutline) {
      userMessage += `Plot Outline:\n${plotOutline}\n`;
    }

    const generatedText = await createChatCompletion([
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    return NextResponse.json({ content: generatedText });
  } catch (error) {
    console.error('Error generating synopsis:', error);
    return NextResponse.json(
      { error: 'Failed to generate synopsis' },
      { status: 500 }
    );
  }
}
