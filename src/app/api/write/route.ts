import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { aiWriteSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';
import { createChatCompletion } from '@/lib/ai';
import { getUserId, unauthorized } from '@/lib/session';
import { checkWordLimit } from '@/lib/word-limit';
import { resolveLanguageContext, buildNovelSystemPrompt } from '@/lib/language-resolver';
import { trackUsage } from '@/lib/billing/usage';

const limiter = rateLimit({ interval: 30000, maxRequests: 5 });

export async function POST(request: NextRequest) {
  try {
    const limitCheck = limiter.check(request);
    if (limitCheck) return limitCheck;

    const userId = await getUserId();
    if (!userId) return unauthorized();

    const body = await request.json();
    const parsed = aiWriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { prompt, context } = parsed.data;
    const { chapterContent, plotOutline, characters, styleGuide, sourceLanguage, projectTitle, genre } = (context || {}) as { chapterContent?: string; plotOutline?: string; characters?: string; styleGuide?: string; sourceLanguage?: string; projectTitle?: string; genre?: string };

    const estimatedWords = Math.min(500, prompt.split(/\s+/).filter(Boolean).length * 3);
    const limitResult = await checkWordLimit(userId, estimatedWords);
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

    // Verify project ownership if projectId provided
    if (parsed.data.projectId) {
      const project = await db.project.findUnique({ where: { id: parsed.data.projectId }, select: { userId: true } });
      if (!project || project.userId !== userId) return new Response(null, { status: 403 });
    }

    const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const userPlan = user?.plan || 'free';

    // Resolve language context
    const language = await resolveLanguageContext(userId, parsed.data.projectId);
    const systemPrompt = buildNovelSystemPrompt('writer', language, genre);

    let userMessage = '';
    if (plotOutline) userMessage += `Plot Outline:\n${plotOutline}\n\n`;
    if (characters) userMessage += `Characters:\n${characters}\n\n`;
    if (styleGuide) userMessage += `Style Guide:\n${styleGuide}\n\n`;
    if (chapterContent) userMessage += `Current Chapter Content:\n${chapterContent}\n\n`;
    userMessage += `Writer's Request: ${prompt}`;

    await trackUsage(userId, userPlan, 'ai_credit', Math.max(1, Math.ceil(estimatedWords / 100)));

    const content = await createChatCompletion([
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    const actualWords = content.split(/\s+/).filter(Boolean).length;
    const diff = actualWords - estimatedWords;
    if (diff > 0) {
      await checkWordLimit(userId, diff);
    }

    return NextResponse.json({ content, wordCount: actualWords, remaining: limitResult.remaining, aiOutputLanguage: language.aiOutputLanguage });
  } catch (error) {
    console.error('Error in AI writing assistant:', error);
    return NextResponse.json(
      { error: 'Failed to generate writing' },
      { status: 500 },
    );
  }
}
