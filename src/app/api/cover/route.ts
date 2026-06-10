import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { coverUploadSchema } from '@/lib/validations';
import { uploadCoverFile } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const projectId = formData.get('projectId') as string;
    const file = formData.get('file') as File | null;

    const parsed = coverUploadSchema.safeParse({ projectId });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be PNG, JPG, or WebP' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File must be under 10MB' },
        { status: 400 }
      );
    }

    const imageUrl = await uploadCoverFile(file, projectId);

    await db.project.update({
      where: { id: projectId },
      data: { coverImage: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading cover:', error);
    return NextResponse.json(
      { error: 'Failed to upload cover image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    await db.project.update({
      where: { id: projectId },
      data: { coverImage: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing cover:', error);
    return NextResponse.json(
      { error: 'Failed to remove cover' },
      { status: 500 }
    );
  }
}
