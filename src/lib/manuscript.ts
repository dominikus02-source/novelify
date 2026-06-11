import { db } from '@/lib/db';

export interface ManuscriptChapter {
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
  scenes?: { title: string; content: string; wordCount: number }[];
}

export interface ManuscriptAssembly {
  title: string;
  author: string;
  language: string;
  genre: string | null;
  description: string | null;
  isbn: string | null;
  copyrightYear: number | null;
  copyrightHolder: string | null;
  coverImageUrl: string | null;
  frontMatter: { includeTitlePage: boolean; includeCopyrightPage: boolean; copyrightNotice: string | null; includeDedication: boolean; dedication: string | null; includeEpigraph: boolean; epigraph: string | null; includeForeword: boolean; foreword: string | null; includePreface: boolean; preface: string | null; includeAcknowledgments: boolean; acknowledgments: string | null; includeTableOfContents: boolean; alsoByAuthor: string | null };
  backMatter: { includeAboutAuthor: boolean; aboutAuthor: string | null; includeAuthorWebsite: boolean; authorWebsite: string | null; includeReviewRequest: boolean; reviewRequest: string | null; includeNewsletterSignup: boolean; newsletterSignup: string | null; includeThankYou: boolean; thankYouNote: string | null; includeNextBookTeaser: boolean; nextBookTeaser: string | null; includeAlsoByAuthor: boolean; alsoByAuthor: string | null };
  chapters: ManuscriptChapter[];
  totalWords: number;
  chapterCount: number;
}

export async function getOrderedManuscript(projectId: string): Promise<ManuscriptAssembly> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      title: true,
      genre: true,
      targetLanguage: true,
      coverImage: true,
      chapters: {
        orderBy: { chapterNumber: 'asc' },
        select: {
          chapterNumber: true,
          title: true,
          contentOriginal: true,
          wordCount: true,
          scenes: {
            orderBy: { sceneNumber: 'asc' },
            select: {
              title: true,
              content: true,
              wordCount: true,
            },
          },
        },
      },
      publishingMetadata: {
        select: {
          bookTitle: true,
          authorName: true,
          language: true,
          longDescription: true,
          shortDescription: true,
          isbn: true,
          copyrightYear: true,
          copyrightHolder: true,
          coverImageUrl: true,
          authorBio: true,
          authorWebsite: true,
        },
      },
      frontMatter: {
        select: {
          includeTitlePage: true,
          includeCopyrightPage: true,
          copyrightNotice: true,
          includeDedication: true,
          dedication: true,
          includeEpigraph: true,
          epigraph: true,
          includeForeword: true,
          foreword: true,
          includePreface: true,
          preface: true,
          includeAcknowledgments: true,
          acknowledgments: true,
          includeTableOfContents: true,
          alsoByAuthor: true,
        },
      },
      backMatter: {
        select: {
          includeAboutAuthor: true,
          aboutAuthor: true,
          includeAuthorWebsite: true,
          authorWebsite: true,
          includeReviewRequest: true,
          reviewRequest: true,
          includeNewsletterSignup: true,
          newsletterSignup: true,
          includeThankYou: true,
          thankYouNote: true,
          includeNextBookTeaser: true,
          nextBookTeaser: true,
          includeAlsoByAuthor: true,
          alsoByAuthor: true,
        },
      },
    },
  });

  if (!project) throw new Error('Project not found');

  const meta = project.publishingMetadata;
  const front = project.frontMatter;
  const back = project.backMatter;
  const chapters: ManuscriptChapter[] = project.chapters.map(ch => ({
    chapterNumber: ch.chapterNumber,
    title: ch.title,
    content: ch.contentOriginal || '',
    wordCount: ch.wordCount || 0,
    scenes: ch.scenes.map(s => ({ title: s.title, content: s.content, wordCount: s.wordCount })),
  }));

  const totalWords = chapters.reduce((s, ch) => s + ch.wordCount, 0);

  return {
    title: meta?.bookTitle || project.title,
    author: meta?.authorName || 'Author',
    language: meta?.language || project.targetLanguage || 'en',
    genre: project.genre,
    description: meta?.longDescription || meta?.shortDescription || null,
    isbn: meta?.isbn || null,
    copyrightYear: meta?.copyrightYear || null,
    copyrightHolder: meta?.copyrightHolder || meta?.authorName || null,
    coverImageUrl: meta?.coverImageUrl || project.coverImage || null,
    frontMatter: {
      includeTitlePage: front?.includeTitlePage ?? true,
      includeCopyrightPage: front?.includeCopyrightPage ?? true,
      copyrightNotice: front?.copyrightNotice || null,
      includeDedication: front?.includeDedication ?? false,
      dedication: front?.dedication || null,
      includeEpigraph: front?.includeEpigraph ?? false,
      epigraph: front?.epigraph || null,
      includeForeword: front?.includeForeword ?? false,
      foreword: front?.foreword || null,
      includePreface: front?.includePreface ?? false,
      preface: front?.preface || null,
      includeAcknowledgments: front?.includeAcknowledgments ?? false,
      acknowledgments: front?.acknowledgments || null,
      includeTableOfContents: front?.includeTableOfContents ?? true,
      alsoByAuthor: front?.alsoByAuthor || null,
    },
    backMatter: {
      includeAboutAuthor: back?.includeAboutAuthor ?? true,
      aboutAuthor: back?.aboutAuthor || meta?.authorBio || null,
      includeAuthorWebsite: back?.includeAuthorWebsite ?? false,
      authorWebsite: back?.authorWebsite || meta?.authorWebsite || null,
      includeReviewRequest: back?.includeReviewRequest ?? false,
      reviewRequest: back?.reviewRequest || null,
      includeNewsletterSignup: back?.includeNewsletterSignup ?? false,
      newsletterSignup: back?.newsletterSignup || null,
      includeThankYou: back?.includeThankYou ?? false,
      thankYouNote: back?.thankYouNote || null,
      includeNextBookTeaser: back?.includeNextBookTeaser ?? false,
      nextBookTeaser: back?.nextBookTeaser || null,
      includeAlsoByAuthor: back?.includeAlsoByAuthor ?? false,
      alsoByAuthor: back?.alsoByAuthor || null,
    },
    chapters,
    totalWords,
    chapterCount: chapters.length,
  };
}

export function sanitizeContent(content: string): string {
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .trim();
}

export function formatParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

export function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function buildTocHtml(chapters: ManuscriptChapter[]): string {
  if (chapters.length === 0) return '';
  const items = chapters.map(ch => `<li><a href="#ch-${ch.chapterNumber}">Chapter ${ch.chapterNumber}: ${escapeXml(ch.title)}</a></li>`).join('\n');
  return `<nav id="toc"><h2>Table of Contents</h2><ol>${items}</ol></nav>`;
}

export function buildFrontMatterHtml(assembly: ManuscriptAssembly): string {
  const parts: string[] = [];
  const f = assembly.frontMatter;

  if (f.includeTitlePage) {
    parts.push(`<section id="title-page" class="front-matter title-page">
<h1>${escapeXml(assembly.title)}</h1>
<p class="author">by ${escapeXml(assembly.author)}</p>
${assembly.genre ? `<p class="genre">${escapeXml(assembly.genre)}</p>` : ''}
</section>`);
  }

  if (f.includeCopyrightPage) {
    const year = assembly.copyrightYear || new Date().getFullYear();
    const holder = assembly.copyrightHolder || assembly.author;
    parts.push(`<section id="copyright" class="front-matter copyright-page">
<p>Copyright © ${year} ${escapeXml(holder)}</p>
<p>All rights reserved.</p>
${f.copyrightNotice ? `<p>${escapeXml(f.copyrightNotice)}</p>` : ''}
${assembly.isbn ? `<p>ISBN: ${escapeXml(assembly.isbn)}</p>` : ''}
</section>`);
  }

  if (f.includeDedication && f.dedication) {
    parts.push(`<section id="dedication" class="front-matter dedication"><p>${escapeXml(f.dedication)}</p></section>`);
  }

  if (f.includeEpigraph && f.epigraph) {
    parts.push(`<section id="epigraph" class="front-matter epigraph"><blockquote>${escapeXml(f.epigraph)}</blockquote></section>`);
  }

  if (f.includeForeword && f.foreword) {
    parts.push(`<section id="foreword" class="front-matter"><h2>Foreword</h2><div>${formatParagraphs(f.foreword).map(p => `<p>${escapeXml(p)}</p>`).join('\n')}</div></section>`);
  }

  if (f.includePreface && f.preface) {
    parts.push(`<section id="preface" class="front-matter"><h2>Preface</h2><div>${formatParagraphs(f.preface).map(p => `<p>${escapeXml(p)}</p>`).join('\n')}</div></section>`);
  }

  if (f.includeAcknowledgments && f.acknowledgments) {
    parts.push(`<section id="acknowledgments" class="front-matter"><h2>Acknowledgments</h2><div>${formatParagraphs(f.acknowledgments).map(p => `<p>${escapeXml(p)}</p>`).join('\n')}</div></section>`);
  }

  if (f.includeTableOfContents) {
    parts.push(buildTocHtml(assembly.chapters));
  }

  return parts.join('\n');
}

export function buildBackMatterHtml(assembly: ManuscriptAssembly): string {
  const parts: string[] = [];
  const b = assembly.backMatter;

  if (b.includeAboutAuthor && b.aboutAuthor) {
    parts.push(`<section id="about-author" class="back-matter"><h2>About the Author</h2><div>${formatParagraphs(b.aboutAuthor).map(p => `<p>${escapeXml(p)}</p>`).join('\n')}</div></section>`);
  }

  if (b.includeAuthorWebsite && b.authorWebsite) {
    parts.push(`<section id="author-website" class="back-matter"><p>Author website: ${escapeXml(b.authorWebsite)}</p></section>`);
  }

  if (b.includeReviewRequest && b.reviewRequest) {
    parts.push(`<section id="review-request" class="back-matter"><div>${formatParagraphs(b.reviewRequest).map(p => `<p>${escapeXml(p)}</p>`).join('\n')}</div></section>`);
  }

  if (b.includeNewsletterSignup && b.newsletterSignup) {
    parts.push(`<section id="newsletter" class="back-matter"><div>${formatParagraphs(b.newsletterSignup).map(p => `<p>${escapeXml(p)}</p>`).join('\n')}</div></section>`);
  }

  if (b.includeThankYou && b.thankYouNote) {
    parts.push(`<section id="thank-you" class="back-matter"><p>${escapeXml(b.thankYouNote)}</p></section>`);
  }

  if (b.includeNextBookTeaser && b.nextBookTeaser) {
    parts.push(`<section id="next-book" class="back-matter"><h2>Coming Soon</h2><div>${formatParagraphs(b.nextBookTeaser).map(p => `<p>${escapeXml(p)}</p>`).join('\n')}</div></section>`);
  }

  if (b.includeAlsoByAuthor && b.alsoByAuthor) {
    parts.push(`<section id="also-by" class="back-matter"><h2>Also by ${escapeXml(assembly.author)}</h2><p>${escapeXml(b.alsoByAuthor)}</p></section>`);
  }

  return parts.join('\n');
}

export function buildChaptersHtml(chapters: ManuscriptChapter[], includeScenes: boolean = false): string {
  return chapters.map(ch => {
    let content = formatParagraphs(ch.content).map(p => `<p>${escapeXml(p)}</p>`).join('\n');
    if (includeScenes && ch.scenes && ch.scenes.length > 0) {
      const sceneContent = ch.scenes.filter(s => s.content).map(s =>
        `<div class="scene"><h3>${escapeXml(s.title)}</h3>${formatParagraphs(s.content).map(p => `<p>${escapeXml(p)}</p>`).join('\n')}</div>`
      ).join('\n');
      if (sceneContent) content += '\n' + sceneContent;
    }
    return `<section id="ch-${ch.chapterNumber}" class="chapter">
<h2 class="chapter-title">Chapter ${ch.chapterNumber}: ${escapeXml(ch.title)}</h2>
${content || '<p class="empty">This chapter has no content yet.</p>'}
</section>`;
  }).join('\n');
}

export function assembleFullHtml(assembly: ManuscriptAssembly, includeScenes: boolean = false): string {
  const frontHtml = buildFrontMatterHtml(assembly);
  const chaptersHtml = buildChaptersHtml(assembly.chapters, includeScenes);
  const backHtml = buildBackMatterHtml(assembly);
  const coverCss = assembly.coverImageUrl
    ? `.cover-page { page-break-after: always; text-align: center; padding: 0; } .cover-page img { max-width: 100%; height: auto; }`
    : '';

  return `<!DOCTYPE html>
<html lang="${escapeXml(assembly.language || 'en')}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeXml(assembly.title)}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.8; color: #1a1a1a; background: #fff; max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
.title-page { text-align: center; padding: 6rem 0 4rem; }
.title-page h1 { font-size: 2.2em; font-weight: 700; margin-bottom: 0.5em; }
.title-page .author { font-size: 1.2em; color: #555; font-style: italic; margin-bottom: 0.5em; }
.title-page .genre { font-size: 0.85em; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }
.copyright-page { font-size: 0.85em; color: #666; text-align: center; padding: 3rem 0; }
.dedication, .epigraph { font-style: italic; text-align: center; padding: 2rem 0; font-size: 1.05em; }
.front-matter, .back-matter { margin-bottom: 2rem; }
.front-matter h2, .back-matter h2 { font-size: 1.3em; margin-bottom: 1rem; text-align: center; }
#toc { margin: 2rem 0; padding: 1.5rem; background: #f9f9f9; border-radius: 4px; }
#toc h2 { font-size: 1.2em; margin-bottom: 1rem; text-align: center; }
#toc ol { list-style: none; counter-reset: toc; }
#toc li { padding: 0.3rem 0; counter-increment: toc; }
#toc li::before { content: counter(toc) ". "; font-weight: 600; }
#toc a { color: #2a5a8a; text-decoration: none; }
.chapter { margin-bottom: 2rem; page-break-before: always; padding-top: 1rem; }
.chapter-title { font-size: 1.4em; text-align: center; margin-bottom: 1.5em; font-weight: 600; }
.chapter h3 { font-size: 1.05em; margin-top: 1.5em; margin-bottom: 0.75em; color: #555; }
p { margin: 0 0 0.8em 0; text-indent: 1.5em; text-align: justify; }
.scene { margin: 1.5em 0; padding-left: 1em; border-left: 2px solid #ddd; }
.empty { color: #999; font-style: italic; text-indent: 0; }
blockquote { font-style: italic; color: #555; border-left: 3px solid #ccc; padding-left: 1em; margin: 1em 0; }
@media print { body { max-width: none; padding: 0; } .chapter { page-break-before: always; } }
${coverCss}
</style>
</head>
<body>
${assembly.coverImageUrl ? `<div class="cover-page"><img src="${escapeXml(assembly.coverImageUrl)}" alt="Cover" /></div>` : ''}
${frontHtml}
<div class="chapters">${chaptersHtml}</div>
${backHtml}
</body>
</html>`;
}

export function calculateManuscriptStats(projectId: string) {
  return db.project.findUnique({
    where: { id: projectId },
    select: {
      _count: { select: { chapters: true, characters: true, locations: true } },
      chapters: { select: { wordCount: true } },
    },
  });
}
