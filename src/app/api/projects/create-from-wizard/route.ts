import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserId, unauthorized } from '@/lib/session';
import { getStructureBeats } from '@/lib/templates';

const outlineCharacterSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  motivation: z.string().optional(),
  flaw: z.string().optional(),
  arc: z.string().optional(),
});

const outlineLocationSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
});

const outlinePlotBeatSchema = z.object({
  act: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string().optional(),
});

const outlineChapterSchema = z.object({
  chapterNumber: z.number(),
  title: z.string(),
  summary: z.string().optional(),
  purpose: z.string().optional(),
  targetWordCount: z.number().optional(),
});

const outlineSceneCardSchema = z.object({
  chapterNumber: z.number(),
  title: z.string().optional(),
  summary: z.string().optional(),
  sceneGoal: z.string().optional(),
  conflict: z.string().optional(),
  outcome: z.string().optional(),
});

const outlineStoryNoteSchema = z.object({
  category: z.string().optional(),
  title: z.string(),
  content: z.string().optional(),
});

const outlineSchema = z.object({
  title: z.string().optional(),
  logline: z.string().optional(),
  premise: z.string().optional(),
  theme: z.string().optional(),
  centralConflict: z.string().optional(),
  mainCharacters: z.array(outlineCharacterSchema).optional(),
  locations: z.array(outlineLocationSchema).optional(),
  plotBeats: z.array(outlinePlotBeatSchema).optional(),
  chapterOutline: z.array(outlineChapterSchema).optional(),
  sceneCards: z.array(outlineSceneCardSchema).optional(),
  storyBibleNotes: z.array(outlineStoryNoteSchema).optional(),
  styleGuide: z.string().optional(),
}).optional();

const createFromWizardSchema = z.object({
  storyType: z.string(),
  genre: z.string(),
  customGenre: z.string().optional(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  aiOutputLanguage: z.string(),
  structureTemplate: z.string().optional(),
  pov: z.string().optional(),
  tense: z.string().optional(),
  tone: z.string().optional(),
  proseStyle: z.string().optional(),
  targetAudience: z.string().optional(),
  targetWordCount: z.number(),
  dailyWordGoal: z.number().optional(),
  chapterWordTarget: z.number().optional(),
  deadline: z.string().optional(),
  workingTitle: z.string().optional(),
  premise: z.string().optional(),
  mainCharacterIdea: z.string().optional(),
  settingIdea: z.string().optional(),
  conflictIdea: z.string().optional(),
  endingIdea: z.string().optional(),
  specialNotes: z.string().optional(),
  outline: outlineSchema,
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();

    const body = await request.json();
    const parsed = createFromWizardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const {
      genre, customGenre,
      sourceLanguage, targetLanguage,
      structureTemplate,
      pov, tense, tone, proseStyle, targetAudience,
      targetWordCount, dailyWordGoal, deadline,
      workingTitle, premise, conflictIdea, endingIdea,
      outline,
    } = parsed.data;

    const result = await db.$transaction(async (tx) => {
      const userSettings = await tx.userSettings.findUnique({
        where: { userId },
      });

      const project = await tx.project.create({
        data: {
          userId,
          title: workingTitle || 'Untitled',
          genre: genre === 'custom' && customGenre ? customGenre : genre,
          sourceLanguage,
          targetLanguage,
          status: 'draft',
          plotOutline: outline?.premise || premise || '',
          styleGuide: outline?.styleGuide || '',
          premise: outline?.premise || premise || null,
          logline: outline?.logline || null,
          theme: outline?.theme || null,
          centralConflict: outline?.centralConflict || conflictIdea || null,
          pov: pov || null,
          tense: tense || null,
          tone: tone || null,
          targetAudience: targetAudience || null,
          wordTarget: targetWordCount || 50000,
          endingIdea: endingIdea || null,
          templateId: structureTemplate || null,
        },
      });

      const chapterIdMap = new Map<number, string>();

      if (outline?.chapterOutline && outline.chapterOutline.length > 0) {
        for (const ch of outline.chapterOutline) {
          const chapter = await tx.chapter.create({
            data: {
              projectId: project.id,
              chapterNumber: ch.chapterNumber,
              title: ch.title,
              contentOriginal: ch.summary || '',
              wordCount: 0,
              status: 'draft',
            },
          });
          chapterIdMap.set(ch.chapterNumber, chapter.id);
        }
      } else {
        const chapter = await tx.chapter.create({
          data: {
            projectId: project.id,
            chapterNumber: 1,
            title: 'Chapter One',
            contentOriginal: '',
            wordCount: 0,
            status: 'draft',
          },
        });
        chapterIdMap.set(1, chapter.id);
      }

      if (outline?.mainCharacters) {
        for (const char of outline.mainCharacters) {
          await tx.character.create({
            data: {
              projectId: project.id,
              name: char.name,
              role: char.role || 'supporting',
              motivation: char.motivation || null,
              flaw: char.flaw || null,
              characterArc: char.arc || null,
            },
          });
        }
      }

      if (outline?.locations) {
        for (const loc of outline.locations) {
          await tx.location.create({
            data: {
              projectId: project.id,
              name: loc.name,
              type: loc.type || 'other',
              description: loc.description || '',
            },
          });
        }
      }

      if (outline?.plotBeats) {
        for (const beat of outline.plotBeats) {
          await tx.plotBeat.create({
            data: {
              projectId: project.id,
              template: structureTemplate || 'three-act',
              act: beat.act,
              order: beat.order,
              title: beat.title,
              description: beat.description || '',
              status: 'idea',
            },
          });
        }
      } else if (structureTemplate) {
        const templateBeats = getStructureBeats(structureTemplate);
        for (const beat of templateBeats) {
          await tx.plotBeat.create({
            data: {
              projectId: project.id,
              template: structureTemplate,
              act: beat.act,
              order: beat.order,
              title: beat.title,
              description: beat.description || '',
              status: 'idea',
            },
          });
        }
      }

      if (outline?.storyBibleNotes) {
        for (const note of outline.storyBibleNotes) {
          await tx.storyNote.create({
            data: {
              projectId: project.id,
              category: note.category || 'general',
              title: note.title,
              content: note.content || '',
            },
          });
        }
      }

      if (outline?.sceneCards) {
        const sceneCountMap = new Map<string, number>();
        for (const card of outline.sceneCards) {
          const chapterId = chapterIdMap.get(card.chapterNumber);
          if (chapterId) {
            const count = (sceneCountMap.get(chapterId) || 0) + 1;
            sceneCountMap.set(chapterId, count);
            await tx.scene.create({
              data: {
                chapterId,
                sceneNumber: count,
                title: card.title || '',
                summary: card.summary || '',
                goal: card.sceneGoal || '',
                conflict: card.conflict || '',
                outcome: card.outcome || '',
                status: 'idea',
              },
            });
          }
        }
      }

      await tx.writingGoal.create({
        data: {
          projectId: project.id,
          type: 'daily',
          targetWords: dailyWordGoal || 1000,
          currentWords: 0,
          endDate: deadline ? new Date(deadline) : null,
        },
      });

      await tx.publishingMetadata.create({
        data: {
          projectId: project.id,
          authorName: userSettings?.defaultAuthorName || null,
          language: targetLanguage,
        },
      });

      return await tx.project.findUnique({
        where: { id: project.id },
        select: {
          id: true,
          userId: true,
          title: true,
          genre: true,
          sourceLanguage: true,
          targetLanguage: true,
          status: true,
          plotOutline: true,
          styleGuide: true,
          coverImage: true,
          wordTarget: true,
          chaptersTarget: true,
          templateId: true,
          premise: true,
          logline: true,
          theme: true,
          targetAudience: true,
          pov: true,
          tense: true,
          tone: true,
          centralConflict: true,
          stakes: true,
          endingIdea: true,
          createdAt: true,
          updatedAt: true,
          chapters: {
            select: {
              id: true,
              projectId: true,
              chapterNumber: true,
              title: true,
              contentOriginal: true,
              contentTranslated: true,
              wordCount: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              scenes: {
                select: {
                  id: true,
                  chapterId: true,
                  sceneNumber: true,
                  title: true,
                  content: true,
                  summary: true,
                  goal: true,
                  conflict: true,
                  outcome: true,
                  emotionalShift: true,
                  povCharacterId: true,
                  locationId: true,
                  wordCount: true,
                  targetWordCount: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          characters: {
            select: {
              id: true,
              projectId: true,
              name: true,
              description: true,
              role: true,
              age: true,
              gender: true,
              occupation: true,
              physicalDescription: true,
              personality: true,
              motivation: true,
              fear: true,
              secret: true,
              flaw: true,
              strength: true,
              backstory: true,
              characterArc: true,
              relationshipToProtagonist: true,
              firstAppearanceChapter: true,
              status: true,
              notes: true,
              imageUrl: true,
              colorTag: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          plotBeats: {
            select: {
              id: true,
              projectId: true,
              template: true,
              act: true,
              order: true,
              title: true,
              description: true,
              status: true,
              linkedChapterId: true,
              notes: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          storyNotes: {
            select: {
              id: true,
              projectId: true,
              title: true,
              content: true,
              category: true,
              linkedCharacterId: true,
              linkedLocationId: true,
              linkedChapterId: true,
              linkedSceneId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          locations: {
            select: {
              id: true,
              projectId: true,
              name: true,
              type: true,
              description: true,
              mood: true,
              importance: true,
              rules: true,
              history: true,
              notes: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          writingGoals: {
            select: {
              id: true,
              projectId: true,
              type: true,
              targetWords: true,
              currentWords: true,
              startDate: true,
              endDate: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          publishingMetadata: {
            select: {
              id: true,
              projectId: true,
              bookTitle: true,
              subtitle: true,
              seriesTitle: true,
              seriesNumber: true,
              authorName: true,
              publisherName: true,
              language: true,
              genre: true,
              subgenre: true,
              keywordsJson: true,
              targetAudience: true,
              ageRange: true,
              isbn: true,
              copyrightYear: true,
              copyrightHolder: true,
              shortDescription: true,
              longDescription: true,
              logline: true,
              tagline: true,
              synopsis: true,
              blurb: true,
              amazonDescription: true,
              goodreadsDescription: true,
              authorBio: true,
              authorWebsite: true,
              authorSocialJson: true,
              coverImageUrl: true,
              coverAssetId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorized();
    }
    console.error('Error creating project from wizard:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
