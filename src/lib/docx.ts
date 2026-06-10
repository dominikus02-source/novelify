import {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, HeadingLevel, PageBreak, convertInchesToTwip,
} from 'docx';
import type { ManuscriptAssembly } from '@/lib/manuscript';

function formatParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
}

function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 24, font: 'Georgia' })],
    spacing: { line: 360, after: 120 },
    indent: { firstLine: 360 },
  });
}

function centeredParagraph(text: string, size: number = 24, bold: boolean = false): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size, font: 'Georgia', bold })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });
}

function headingParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 32, font: 'Georgia', bold: true })],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 400 },
  });
}

function emptyParagraph(before: number = 200, after: number = 200): Paragraph {
  return new Paragraph({ children: [], spacing: { before, after } });
}

export async function generateDocxFromAssembly(
  assembly: ManuscriptAssembly,
  options?: { includeScenes?: boolean }
): Promise<Buffer> {
  const includeScenes = options?.includeScenes ?? false;
  const children: Paragraph[] = [];

  // Title page
  children.push(emptyParagraph(4000, 0));
  children.push(centeredParagraph(assembly.title, 52, true));
  children.push(emptyParagraph(200, 0));
  children.push(centeredParagraph(`by ${assembly.author}`, 32));
  if (assembly.genre) {
    children.push(emptyParagraph(200, 0));
    children.push(centeredParagraph(assembly.genre, 20));
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Copyright
  const year = assembly.copyrightYear || new Date().getFullYear();
  const holder = assembly.copyrightHolder || assembly.author;
  children.push(emptyParagraph(2000, 0));
  children.push(centeredParagraph(`Copyright \u00A9 ${year} ${holder}`, 20));
  children.push(centeredParagraph('All rights reserved.', 20));
  if (assembly.frontMatter.copyrightNotice) {
    children.push(emptyParagraph(200, 0));
    children.push(centeredParagraph(assembly.frontMatter.copyrightNotice, 20));
  }
  if (assembly.isbn) {
    children.push(emptyParagraph(200, 0));
    children.push(centeredParagraph(`ISBN: ${assembly.isbn}`, 20));
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Dedication
  if (assembly.frontMatter.includeDedication && assembly.frontMatter.dedication) {
    children.push(emptyParagraph(3000, 0));
    children.push(centeredParagraph(assembly.frontMatter.dedication, 26));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Epigraph
  if (assembly.frontMatter.includeEpigraph && assembly.frontMatter.epigraph) {
    children.push(emptyParagraph(3000, 0));
    children.push(centeredParagraph(assembly.frontMatter.epigraph, 24));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Foreword
  if (assembly.frontMatter.includeForeword && assembly.frontMatter.foreword) {
    children.push(headingParagraph('Foreword'));
    for (const p of formatParagraphs(assembly.frontMatter.foreword)) {
      children.push(bodyParagraph(p));
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Preface
  if (assembly.frontMatter.includePreface && assembly.frontMatter.preface) {
    children.push(headingParagraph('Preface'));
    for (const p of formatParagraphs(assembly.frontMatter.preface)) {
      children.push(bodyParagraph(p));
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Acknowledgments
  if (assembly.frontMatter.includeAcknowledgments && assembly.frontMatter.acknowledgments) {
    children.push(headingParagraph('Acknowledgments'));
    for (const p of formatParagraphs(assembly.frontMatter.acknowledgments)) {
      children.push(bodyParagraph(p));
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // TOC
  if (assembly.frontMatter.includeTableOfContents) {
    children.push(headingParagraph('Table of Contents'));
    children.push(emptyParagraph(400, 200));
    for (const ch of assembly.chapters) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `Chapter ${ch.chapterNumber}: ${ch.title}`, size: 24, font: 'Georgia' })],
        spacing: { before: 100, after: 100 },
      }));
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Chapters
  for (const ch of assembly.chapters) {
    children.push(headingParagraph(`Chapter ${ch.chapterNumber}: ${ch.title}`));

    for (const p of formatParagraphs(ch.content)) {
      children.push(bodyParagraph(p));
    }

    if (includeScenes && ch.scenes && ch.scenes.length > 0) {
      for (const scene of ch.scenes) {
        if (!scene.content) continue;
        children.push(emptyParagraph(300, 100));
        children.push(new Paragraph({
          children: [new TextRun({ text: scene.title, size: 24, font: 'Georgia', bold: true })],
        }));
        for (const p of formatParagraphs(scene.content)) {
          children.push(bodyParagraph(p));
        }
      }
    }

    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Back matter
  const bm = assembly.backMatter;

  if (bm.includeAboutAuthor && bm.aboutAuthor) {
    children.push(headingParagraph('About the Author'));
    for (const p of formatParagraphs(bm.aboutAuthor)) {
      children.push(bodyParagraph(p));
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  if (bm.includeAuthorWebsite && bm.authorWebsite) {
    children.push(centeredParagraph(`Author website: ${bm.authorWebsite}`, 24));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  if (bm.includeReviewRequest && bm.reviewRequest) {
    for (const p of formatParagraphs(bm.reviewRequest)) {
      children.push(bodyParagraph(p));
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  if (bm.includeNewsletterSignup && bm.newsletterSignup) {
    for (const p of formatParagraphs(bm.newsletterSignup)) {
      children.push(bodyParagraph(p));
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  if (bm.includeThankYou && bm.thankYouNote) {
    children.push(centeredParagraph(bm.thankYouNote, 24));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  if (bm.includeNextBookTeaser && bm.nextBookTeaser) {
    children.push(headingParagraph('Coming Soon'));
    for (const p of formatParagraphs(bm.nextBookTeaser)) {
      children.push(bodyParagraph(p));
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  if (bm.includeAlsoByAuthor && bm.alsoByAuthor) {
    children.push(new Paragraph({
      children: [new TextRun({ text: `Also by ${assembly.author}`, size: 28, font: 'Georgia', bold: true })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }));
    children.push(centeredParagraph(bm.alsoByAuthor, 24));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Georgia', size: 24 },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
          },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: assembly.title, size: 18, font: 'Georgia', italics: true })],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [new TextRun({ text: assembly.author, size: 18, font: 'Georgia', italics: true })],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
