import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

// POST /api/cover - Cover image generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, prompt, style } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

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

    // Save the image to public/images/covers
    const timestamp = Date.now();
    const filename = `${projectId}-${timestamp}.png`;
    const filePath = path.join(process.cwd(), 'public', 'images', 'covers', filename);

    // Convert base64 to buffer and save
    const buffer = Buffer.from(imageBase64, 'base64');
    await writeFile(filePath, buffer);

    // Update the project's coverImage field
    const { db } = await import('@/lib/db');
    await db.project.update({
      where: { id: projectId },
      data: { coverImage: `/images/covers/${filename}` },
    });

    return NextResponse.json({ imageUrl: `/images/covers/${filename}` });
  } catch (error) {
    console.error('Error generating cover image:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover image' },
      { status: 500 }
    );
  }
}
