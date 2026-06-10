import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { coverSchema } from '@/lib/validations';

// POST /api/cover - Cover image generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = coverSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { projectId, prompt, style } = parsed.data;

    // Build image prompt combining style and user prompt
    const imagePrompt = `Book cover design for a novel, ${style || 'modern'} style, ${prompt}, professional quality, dramatic lighting`;

    const zai = await ZAI.create();
    const response = await zai.images.generations.create({
      prompt: imagePrompt,
      size: '864x1152',
    });

    const imageBase64 = response.data[0]?.base64;
    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    // Store as data URL (works on Vercel serverless)
    const dataUrl = `data:image/png;base64,${imageBase64}`;

    // Update the project's coverImage field
    await db.project.update({
      where: { id: projectId },
      data: { coverImage: dataUrl },
    });

    return NextResponse.json({ imageUrl: dataUrl });
  } catch (error) {
    console.error('Error generating cover image:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover image' },
      { status: 500 }
    );
  }
}
