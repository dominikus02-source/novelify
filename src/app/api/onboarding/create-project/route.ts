import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data, language } = body;

    if (!data || !data.title) {
      return NextResponse.json({ error: 'Invalid generation data' }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          userId: session.user.id,
          title: data.title || 'Untitled Novel',
          genre: body.genre || 'General',
          sourceLanguage: language === 'id' ? 'id' : 'en',
          targetLanguage: 'en',
          status: 'draft',
          plotOutline: data.premise || '',
          logline: data.logline || '',
          premise: data.premise || '',
          theme: data.theme || '',
          centralConflict: data.stakes || '',
          tone: data.tone || '',
          targetAudience: data.targetReader || '',
          wordTarget: 50000,
          chaptersTarget: (data.chapterOutline || []).length || 20,
        },
      });

      const chapterIds: string[] = [];
      const chapters = data.chapterOutline || [];
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        const chapter = await tx.chapter.create({
          data: {
            projectId: project.id,
            chapterNumber: i + 1,
            title: ch.title || `Chapter ${i + 1}`,
            contentOriginal: (i === 0 && ch.firstParagraphSuggestion) ? ch.firstParagraphSuggestion : '',
            status: 'idea',
          },
        });
        chapterIds.push(chapter.id);
      }

      if (chapters.length === 0) {
        const ch = await tx.chapter.create({
          data: {
            projectId: project.id,
            chapterNumber: 1,
            title: 'Chapter One',
            status: 'idea',
          },
        });
        chapterIds.push(ch.id);
      }

      if (data.protagonist?.name) {
        await tx.character.create({
          data: {
            projectId: project.id,
            name: data.protagonist.name,
            description: data.protagonist.description || '',
            role: 'protagonist',
            motivation: data.protagonist.desire || '',
            backstory: data.protagonist.emotionalWound || '',
            conflict: data.protagonist.conflict || '',
          },
        });
      }

      if (data.antagonist?.name) {
        await tx.character.create({
          data: {
            projectId: project.id,
            name: data.antagonist.name,
            description: data.antagonist.description || '',
            role: 'antagonist',
            motivation: data.antagonist.motivation || '',
          },
        });
      }

      if (data.supportingCharacter?.name) {
        await tx.character.create({
          data: {
            projectId: project.id,
            name: data.supportingCharacter.name,
            description: data.supportingCharacter.description || '',
            role: 'supporting',
          },
        });
      }

      if (data.storyBibleNotes && Array.isArray(data.storyBibleNotes)) {
        for (const note of data.storyBibleNotes) {
          await tx.storyNote.create({
            data: {
              projectId: project.id,
              title: note.title || 'Note',
              content: note.content || '',
              category: note.category || 'general',
            },
          });
        }
      }

      if (data.plotBeats && Array.isArray(data.plotBeats)) {
        for (const beat of data.plotBeats) {
          await tx.plotBeat.create({
            data: {
              projectId: project.id,
              template: 'three-act',
              act: beat.act || 'act1',
              order: beat.order || 0,
              title: beat.title || 'Beat',
              description: beat.description || '',
            },
          });
        }
      }

      if (data.firstScene && chapterIds.length > 0) {
        await tx.scene.create({
          data: {
            chapterId: chapterIds[0],
            sceneNumber: 1,
            title: 'Opening Scene',
            content: data.firstScene.firstParagraph || '',
            goal: data.firstScene.goal || '',
            conflict: data.firstScene.conflict || '',
            summary: data.firstScene.openingImage || '',
            status: 'idea',
          },
        });
      }

      await tx.writingGoal.create({
        data: {
          projectId: project.id,
          type: 'daily',
          targetWords: 1000,
        },
      });

      await tx.publishingMetadata.create({
        data: {
          projectId: project.id,
          title: data.title || '',
          authorName: session.user.name || '',
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          onboardingCompleted: true,
          firstNovelCreatedAt: new Date(),
        },
      });

      return tx.project.findUnique({
        where: { id: project.id },
        include: {
          chapters: { orderBy: { chapterNumber: 'asc' } },
          characters: true,
          plotBeats: { orderBy: { order: 'asc' } },
          storyNotes: true,
        },
      });
    });

    return NextResponse.json({ success: true, project: result });
  } catch (error) {
    console.error('Onboarding create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
