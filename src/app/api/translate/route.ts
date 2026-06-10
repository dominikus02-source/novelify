import { NextRequest, NextResponse } from 'next/server';
import { translateSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';
import { createChatCompletion } from '@/lib/ai';
import { getUserId, unauthorized } from '@/lib/session';
import { checkWordLimit } from '@/lib/word-limit';
import { resolveLanguageContext, buildLanguageInstruction } from '@/lib/language-resolver';

const limiter = rateLimit({ interval: 60000, maxRequests: 10 });

export async function POST(request: NextRequest) {
  try {
    const limitCheck = limiter.check(request);
    if (limitCheck) return limitCheck;

    const userId = await getUserId();
    if (!userId) return unauthorized();

    const body = await request.json();
    const parsed = translateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { sourceLanguage, targetLanguage, content } = parsed.data;

    const sourceWords = content.split(/\s+/).filter(Boolean).length;
    const limitResult = await checkWordLimit(userId, sourceWords);
    if ('error' in limitResult) {
      return NextResponse.json({ error: limitResult.error }, { status: 500 });
    }
    if (!limitResult.allowed) {
      return NextResponse.json({
        error: 'Daily word limit reached',
        limit: limitResult.limit,
        used: limitResult.used,
        remaining: limitResult.remaining,
      }, { status: 429 });
    }

    // Resolve language for user settings context
    const language = await resolveLanguageContext(userId, parsed.data.projectId);

    const systemPrompt = `You are a professional literary translator specializing in novels. Translate the following literary text from ${sourceLanguage} to ${targetLanguage} at publishable quality.

${buildLanguageInstruction(language)}

RULES:
- Meaning-for-meaning translation (dynamic equivalence), never word-for-word
- Preserve the author's voice, tone, and emotional impact
- Dialogue must sound natural in the target language
- Cultural terms: adapt when possible, keep with subtle context when needed
- Never add or remove story content
- Maintain narrative flow and literary style
- Consistent translation of character names, places, and special terms
- For idioms/slang: find natural equivalents in the target language
- The output should read as if originally written in ${targetLanguage}

CRITICAL: You are translating FROM ${sourceLanguage} TO ${targetLanguage}. The output MUST be in ${targetLanguage} only.`;

    const translatedText = await createChatCompletion([
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content },
    ]);

    return NextResponse.json({ content: translatedText, remaining: limitResult.remaining, aiOutputLanguage: targetLanguage });
  } catch (error) {
    console.error('Error in translation:', error);
    return NextResponse.json(
      { error: 'Failed to translate content' },
      { status: 500 },
    );
  }
}
