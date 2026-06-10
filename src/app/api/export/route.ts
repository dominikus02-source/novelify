import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { exportSchema } from '@/lib/validations';
import { generateEpub } from '@/lib/epub';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = exportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { projectId, format, options } = parsed.data;
    const { includeOriginal, includeTranslation, authorName, language } = options || {};

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const safeName = project.title.replace(/[^a-zA-Z0-9-]/g, '_');

    if (format === 'epub') {
      const epubBuffer = await generateEpub({
        title: project.title,
        author: authorName || 'Author',
        language: language || 'en',
        genre: project.genre,
        chapters: project.chapters.map((ch) => ({
          chapterNumber: ch.chapterNumber,
          title: ch.title,
          contentOriginal: ch.contentOriginal,
          contentTranslated: ch.contentTranslated,
        })),
        includeOriginal: includeOriginal ?? true,
        includeTranslation: includeTranslation ?? false,
      });

      await db.export.create({
        data: { projectId, format: 'epub', status: 'completed' },
      });

      return new NextResponse(epubBuffer, {
        headers: {
          'Content-Type': 'application/epub+zip',
          'Content-Disposition': `attachment; filename="${safeName}.epub"`,
        },
      });
    }

    // PDF fallback — generate HTML (printable)
    const html = buildManuscriptHtml(project, {
      includeOriginal: includeOriginal ?? true,
      includeTranslation: includeTranslation ?? false,
      authorName: authorName || 'Author',
      language: language || 'en',
    });

    await db.export.create({
      data: { projectId, format: 'pdf', status: 'completed' },
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeName}-manuscript.html"`,
      },
    });
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { error: 'Failed to export project' },
      { status: 500 }
    );
  }
}

function buildManuscriptHtml(
  project: {
    title: string;
    genre: string | null;
    chapters: {
      chapterNumber: number;
      title: string;
      contentOriginal: string;
      contentTranslated: string | null;
    }[];
  },
  options: {
    includeOriginal: boolean;
    includeTranslation: boolean;
    authorName: string;
    language: string;
  }
): string {
  const { includeOriginal, includeTranslation, authorName, language } = options;

  const tocItems = project.chapters
    .map(
      (ch) =>
        `    <li><a href="#chapter-${ch.chapterNumber}">Chapter ${ch.chapterNumber}: ${escapeHtml(ch.title)}</a></li>`
    )
    .join('\n');

  const chapterSections = project.chapters
    .map((ch) => {
      let content = '';

      if (includeOriginal && ch.contentOriginal) {
        content += `      <div class="original-content">
        <h3>Original</h3>
        <div class="prose">${formatContent(ch.contentOriginal)}</div>
      </div>\n`;
      }

      if (includeTranslation && ch.contentTranslated) {
        content += `      <div class="translated-content">
        <h3>Translation</h3>
        <div class="prose">${formatContent(ch.contentTranslated)}</div>
      </div>\n`;
      }

      if (!content) {
        content = `      <p class="empty-chapter">This chapter has no content yet.</p>\n`;
      }

      return `    <section id="chapter-${ch.chapterNumber}" class="chapter">
      <h2>Chapter ${ch.chapterNumber}: ${escapeHtml(ch.title)}</h2>
${content}    </section>`;
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.title)} - Manuscript</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.8; color: #1a1a1a; background: #fefefe; max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
    .title-page { text-align: center; padding: 4rem 0 6rem; border-bottom: 2px solid #e0e0e0; margin-bottom: 3rem; }
    .title-page h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: 0.02em; }
    .title-page .author { font-size: 1.2rem; color: #555; font-style: italic; }
    .title-page .genre { font-size: 0.9rem; color: #888; margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em; }
    .toc { margin-bottom: 3rem; padding: 1.5rem; background: #f9f9f9; border-radius: 4px; }
    .toc h2 { font-size: 1.3rem; margin-bottom: 1rem; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.5rem; }
    .toc ol { list-style: none; counter-reset: toc-counter; }
    .toc li { padding: 0.3rem 0; counter-increment: toc-counter; }
    .toc li a { color: #2a5a8a; text-decoration: none; }
    .chapter { margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #eee; }
    .chapter h2 { font-size: 1.5rem; margin-bottom: 1.5rem; color: #333; }
    .chapter h3 { font-size: 1rem; color: #777; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; margin-top: 1.5rem; }
    .prose { white-space: pre-wrap; font-size: 1.05rem; }
    .original-content { margin-bottom: 1.5rem; }
    .translated-content { margin-bottom: 1.5rem; padding-left: 1rem; border-left: 3px solid #e0e0e0; }
    .empty-chapter { color: #999; font-style: italic; }
    @media print { body { max-width: none; padding: 0; } .chapter { page-break-before: always; } }
  </style>
</head>
<body>
  <div class="title-page">
    <h1>${escapeHtml(project.title)}</h1>
    <div class="author">by ${escapeHtml(authorName)}</div>
    ${project.genre ? `<div class="genre">${escapeHtml(project.genre)}</div>` : ''}
  </div>
  <div class="toc">
    <h2>Table of Contents</h2>
    <ol>${tocItems}</ol>
  </div>
  <div class="chapters">${chapterSections}</div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatContent(content: string): string {
  return escapeHtml(content);
}
