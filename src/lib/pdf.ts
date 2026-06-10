import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ManuscriptAssembly } from '@/lib/manuscript';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 72;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FONT_SIZE = 11;
const LINE_HEIGHT = 14;

function wordWrap(text: string, fontWidth: (s: string, size: number) => number, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const prev = lines[lines.length - 1] || '';
    const test = prev ? `${prev} ${word}` : word;
    if (fontWidth(test, fontSize) > maxWidth && prev) {
      lines.push(word);
    } else {
      if (lines.length > 0) lines[lines.length - 1] = test;
      else lines.push(test);
    }
  }
  return lines;
}

function formatParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
}

export async function generatePdfFromAssembly(
  assembly: ManuscriptAssembly,
  options?: { includeScenes?: boolean }
): Promise<Buffer> {
  const includeScenes = options?.includeScenes ?? false;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  function measure(s: string, sz: number) { return font.widthOfTextAtSize(s, sz); }
  function measureBold(s: string, sz: number) { return boldFont.widthOfTextAtSize(s, sz); }

  function drawBody(page: any, text: string, x: number, y: number, bold?: boolean): number {
    const f = bold ? boldFont : font;
    const m = bold ? measureBold : measure;
    const lines = wordWrap(text, m, FONT_SIZE, CONTENT_WIDTH);
    let cy = y;
    for (const line of lines) {
      if (cy < MARGIN) break;
      page.drawText(line, { x: x + 20, y: cy, size: FONT_SIZE, font: f, color: rgb(0, 0, 0) });
      cy -= LINE_HEIGHT;
    }
    return cy;
  }

  function drawCentered(page: any, text: string, bold: boolean, size: number, y: number) {
    const f = bold ? boldFont : font;
    const w = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (PAGE_WIDTH - w) / 2, y, size, font: f, color: rgb(0, 0, 0) });
  }

  function drawHeading(page: any, text: string, y: number): number {
    drawCentered(page, text, true, 16, y);
    return y - 24;
  }

  function newPage(): any {
    return doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  }

  let page = newPage();
  drawCentered(page, assembly.title, true, 24, PAGE_HEIGHT / 2 + 40);
  drawCentered(page, `by ${assembly.author}`, false, 14, PAGE_HEIGHT / 2 + 10);
  if (assembly.genre) drawCentered(page, assembly.genre, false, 10, PAGE_HEIGHT / 2 - 10);

  // Copyright
  page = newPage();
  let y = PAGE_HEIGHT - MARGIN;
  const year = assembly.copyrightYear || new Date().getFullYear();
  const holder = assembly.copyrightHolder || assembly.author;
  page.drawText(`Copyright \u00A9 ${year} ${holder}`, { x: MARGIN, y, size: 9, font, color: rgb(0, 0, 0) });
  y -= LINE_HEIGHT;
  page.drawText('All rights reserved.', { x: MARGIN, y, size: 9, font, color: rgb(0, 0, 0) });
  if (assembly.frontMatter.copyrightNotice) {
    y -= LINE_HEIGHT;
    page.drawText(assembly.frontMatter.copyrightNotice, { x: MARGIN, y, size: 9, font, color: rgb(0, 0, 0) });
  }
  if (assembly.isbn) {
    y -= LINE_HEIGHT;
    page.drawText(`ISBN: ${assembly.isbn}`, { x: MARGIN, y, size: 9, font, color: rgb(0, 0, 0) });
  }

  // Dedication
  if (assembly.frontMatter.includeDedication && assembly.frontMatter.dedication) {
    page = newPage();
    drawCentered(page, assembly.frontMatter.dedication, false, 12, PAGE_HEIGHT / 2);
  }

  // Epigraph
  if (assembly.frontMatter.includeEpigraph && assembly.frontMatter.epigraph) {
    page = newPage();
    drawCentered(page, assembly.frontMatter.epigraph, false, 11, PAGE_HEIGHT / 2);
  }

  // Foreword
  if (assembly.frontMatter.includeForeword && assembly.frontMatter.foreword) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    y = drawHeading(page, 'Foreword', y);
    for (const p of formatParagraphs(assembly.frontMatter.foreword)) {
      y = drawBody(page, p, MARGIN, y);
      y -= LINE_HEIGHT;
      if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
    }
  }

  // Preface
  if (assembly.frontMatter.includePreface && assembly.frontMatter.preface) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    y = drawHeading(page, 'Preface', y);
    for (const p of formatParagraphs(assembly.frontMatter.preface)) {
      y = drawBody(page, p, MARGIN, y);
      y -= LINE_HEIGHT;
      if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
    }
  }

  // Acknowledgments
  if (assembly.frontMatter.includeAcknowledgments && assembly.frontMatter.acknowledgments) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    y = drawHeading(page, 'Acknowledgments', y);
    for (const p of formatParagraphs(assembly.frontMatter.acknowledgments)) {
      y = drawBody(page, p, MARGIN, y);
      y -= LINE_HEIGHT;
      if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
    }
  }

  // TOC
  if (assembly.frontMatter.includeTableOfContents) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    y = drawHeading(page, 'Table of Contents', y);
    y -= 6;
    for (const ch of assembly.chapters) {
      page.drawText(`Chapter ${ch.chapterNumber}: ${ch.title}`, { x: MARGIN + 20, y, size: FONT_SIZE, font, color: rgb(0, 0, 0) });
      y -= LINE_HEIGHT;
      if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
    }
  }

  // Chapters
  for (const ch of assembly.chapters) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    drawCentered(page, `Chapter ${ch.chapterNumber}: ${ch.title}`, true, 16, y);
    y -= 30;
    for (const p of formatParagraphs(ch.content)) {
      y = drawBody(page, p, MARGIN, y);
      y -= Math.round(LINE_HEIGHT / 2);
      if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
    }
    if (includeScenes && ch.scenes) {
      for (const scene of ch.scenes) {
        if (!scene.content) continue;
        y -= 8;
        if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
        page.drawText(scene.title, { x: MARGIN, y, size: FONT_SIZE, font: boldFont, color: rgb(0, 0, 0) });
        y -= LINE_HEIGHT;
        for (const p of formatParagraphs(scene.content)) {
          y = drawBody(page, p, MARGIN, y);
          y -= Math.round(LINE_HEIGHT / 2);
          if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
        }
      }
    }
  }

  // Back matter
  const bm = assembly.backMatter;

  if (bm.includeAboutAuthor && bm.aboutAuthor) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    drawCentered(page, 'About the Author', true, 16, y);
    y -= 30;
    for (const p of formatParagraphs(bm.aboutAuthor)) {
      y = drawBody(page, p, MARGIN, y);
      y -= LINE_HEIGHT;
      if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
    }
  }

  if (bm.includeAuthorWebsite && bm.authorWebsite) {
    page = newPage();
    drawCentered(page, `Author website: ${bm.authorWebsite}`, false, 11, PAGE_HEIGHT - MARGIN);
  }

  if (bm.includeReviewRequest && bm.reviewRequest) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    for (const p of formatParagraphs(bm.reviewRequest)) {
      y = drawBody(page, p, MARGIN, y);
      y -= LINE_HEIGHT;
      if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
    }
  }

  if (bm.includeNewsletterSignup && bm.newsletterSignup) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    for (const p of formatParagraphs(bm.newsletterSignup)) {
      y = drawBody(page, p, MARGIN, y);
      y -= LINE_HEIGHT;
      if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
    }
  }

  if (bm.includeThankYou && bm.thankYouNote) {
    page = newPage();
    drawCentered(page, bm.thankYouNote, false, 12, PAGE_HEIGHT / 2);
  }

  if (bm.includeNextBookTeaser && bm.nextBookTeaser) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    drawCentered(page, 'Coming Soon', true, 16, y);
    y -= 30;
    for (const p of formatParagraphs(bm.nextBookTeaser)) {
      y = drawBody(page, p, MARGIN, y);
      y -= LINE_HEIGHT;
      if (y < MARGIN) { page = newPage(); y = PAGE_HEIGHT - MARGIN; }
    }
  }

  if (bm.includeAlsoByAuthor && bm.alsoByAuthor) {
    page = newPage();
    y = PAGE_HEIGHT - MARGIN;
    drawCentered(page, `Also by ${assembly.author}`, true, 16, y);
    y -= 30;
    y = drawBody(page, bm.alsoByAuthor, MARGIN, y, false);
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
