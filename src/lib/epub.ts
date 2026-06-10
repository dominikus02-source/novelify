import JSZip from 'jszip';
import crypto from 'crypto';
import { ManuscriptAssembly, escapeXml as escapeXmlMs, formatParagraphs } from '@/lib/manuscript';

function uuid(): string {
  return crypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface Chapter {
  chapterNumber: number;
  title: string;
  contentOriginal: string;
  contentTranslated: string | null;
}

interface EpubOptions {
  title: string;
  author: string;
  language: string;
  genre?: string | null;
  chapters: Chapter[];
  includeOriginal: boolean;
  includeTranslation: boolean;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function htmlContent(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => `      <p>${escapeXml(line)}</p>`)
    .join('\n');
}

function makeXhtml(title: string, bodyContent: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXmlMs(title)}</title>
<link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

function wrapSection(label: string, content: string): string {
  return `<div class="${label}">${content}</div>`;
}

function chapterContentHtml(content: string, scenes: { title: string; content: string }[] | undefined, includeScenes: boolean): string {
  const paras = formatParagraphs(content);
  let html = paras.map(p => `<p>${escapeXmlMs(p)}</p>`).join('\n');
  if (includeScenes && scenes && scenes.length > 0) {
    const sceneHtml = scenes.filter(s => s.content).map(s =>
      `<div class="scene"><h3>${escapeXmlMs(s.title)}</h3>${formatParagraphs(s.content).map(p => `<p>${escapeXmlMs(p)}</p>`).join('\n')}</div>`
    ).join('\n');
    if (sceneHtml) html += '\n' + sceneHtml;
  }
  return html || '<p class="empty">This chapter has no content yet.</p>';
}

export async function generateEpub(options: EpubOptions): Promise<Buffer> {
  const {
    title, author, language, genre, chapters,
    includeOriginal, includeTranslation,
  } = options;

  const zip = new JSZip();

  // mimetype — must be first, stored uncompressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF/container.xml
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  // OEBPS/styles.css
  const css = `@page { margin: 5pt; }
body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.8; color: #333; margin: 0; padding: 0; }
h1 { text-align: center; font-size: 1.8em; margin-top: 2em; margin-bottom: 0.5em; font-weight: 700; }
h2 { font-size: 1.4em; margin-top: 2em; margin-bottom: 1em; text-align: center; font-weight: 600; }
h3 { font-size: 1em; margin-top: 1.5em; margin-bottom: 0.75em; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
p { margin: 0 0 0.8em 0; text-indent: 1.5em; text-align: justify; }
.title-page { text-align: center; padding-top: 20%; }
.title-page h1 { font-size: 2.2em; margin-bottom: 0.3em; }
.title-page .author { font-size: 1.1em; color: #666; font-style: italic; margin-bottom: 1em; }
.title-page .genre { font-size: 0.8em; color: #999; text-transform: uppercase; letter-spacing: 0.1em; }
.chapter { page-break-before: always; padding-top: 1em; }
.front-matter { page-break-before: always; padding-top: 1em; }
.back-matter { page-break-before: always; padding-top: 1em; }
.scene { margin: 1.5em 0; padding-left: 1em; border-left: 2px solid #ddd; }
.empty { color: #999; font-style: italic; text-indent: 0; }
blockquote { font-style: italic; color: #555; border-left: 3px solid #ccc; padding-left: 1em; margin: 1em 0; }
.copyright-page { font-size: 0.85em; color: #666; text-align: center; padding: 3rem 0; }
.dedication, .epigraph { font-style: italic; text-align: center; padding: 2rem 0; font-size: 1.05em; }
#toc { margin: 2rem 0; padding: 1.5rem; }
#toc h2 { font-size: 1.2em; margin-bottom: 1rem; text-align: center; }
#toc ol { list-style: none; counter-reset: toc; }
#toc li { padding: 0.3rem 0; counter-increment: toc; }
#toc li::before { content: counter(toc) ". "; font-weight: 600; }
#toc a { color: #2a5a8a; text-decoration: none; }
.cover-page { page-break-after: always; text-align: center; padding: 0; }
.cover-page img { max-width: 100%; height: auto; }
`;

  zip.file('OEBPS/styles.css', css);

  // Generate XHTML for each chapter
  const chapterFiles: { id: string; href: string; label: string }[] = [];

  // Title page
  let titleXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXml(title)}</title>
<link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
<div class="title-page">
<h1>${escapeXml(title)}</h1>
<div class="author">by ${escapeXml(author)}</div>
${genre ? `<div class="genre">${escapeXml(genre)}</div>` : ''}
</div>
</body>
</html>`;
  zip.file('OEBPS/title.xhtml', titleXhtml);
  chapterFiles.push({ id: 'title', href: 'title.xhtml', label: 'Title Page' });

  chapters.forEach((ch, i) => {
    let bodyContent = `<h2>Chapter ${ch.chapterNumber}: ${escapeXml(ch.title)}</h2>\n`;

    if (includeOriginal && ch.contentOriginal) {
      if (includeTranslation && ch.contentTranslated) {
        bodyContent += `<h3>Original</h3>\n${htmlContent(ch.contentOriginal)}\n`;
        bodyContent += `<h3>Translation</h3>\n${htmlContent(ch.contentTranslated)}\n`;
      } else {
        bodyContent += htmlContent(ch.contentOriginal);
      }
    } else if (includeTranslation && ch.contentTranslated) {
      bodyContent += htmlContent(ch.contentTranslated);
    } else {
      bodyContent += `<p style="color:#999;font-style:italic">This chapter has no content yet.</p>`;
    }

    const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXml(ch.title)}</title>
<link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
<div class="chapter">
${bodyContent}
</div>
</body>
</html>`;

    const filename = `chapter-${ch.chapterNumber}.xhtml`;
    zip.file(`OEBPS/${filename}`, xhtml);
    chapterFiles.push({ id: `chapter-${ch.chapterNumber}`, href: filename, label: ch.title });
  });

  // content.opf
  const manifest = chapterFiles.map((f) =>
    `    <item id="${f.id}" href="${f.href}" media-type="application/xhtml+xml"/>`
  ).join('\n');

  const spine = chapterFiles.map((f) =>
    `    <itemref idref="${f.id}"/>`
  ).join('\n');

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="bookid">urn:uuid:${uuid()}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>${language}</dc:language>
    ${genre ? `<dc:subject>${escapeXml(genre)}</dc:subject>` : ''}
  </metadata>
  <manifest>
    <item id="css" href="styles.css" media-type="text/css"/>
${manifest}
  </manifest>
  <spine toc="ncx">
${spine}
  </spine>
</package>`;
  zip.file('OEBPS/content.opf', opf);

  // toc.ncx
  const navPoints = chapterFiles.map((f, i) =>
    `    <navPoint id="${f.id}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(f.label)}</text></navLabel>
      <content src="${f.href}"/>
    </navPoint>`
  ).join('\n');

  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${uuid()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(title)}</text></docTitle>
  <docAuthor><text>${escapeXml(author)}</text></docAuthor>
  <navMap>
${navPoints}
  </navMap>
</ncx>`;
  zip.file('OEBPS/toc.ncx', ncx);

  const blob = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return Buffer.from(blob);
}

export async function generateEpubFromAssembly(
  assembly: ManuscriptAssembly,
  options?: { includeScenes?: boolean }
): Promise<Buffer> {
  const includeScenes = options?.includeScenes ?? false;
  const zip = new JSZip();

  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  const css = `@page { margin: 5pt; }
body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.8; color: #333; margin: 0; padding: 0; }
h1 { text-align: center; font-size: 1.8em; margin-top: 2em; margin-bottom: 0.5em; font-weight: 700; }
h2 { font-size: 1.4em; margin-top: 2em; margin-bottom: 1em; text-align: center; font-weight: 600; }
h3 { font-size: 1em; margin-top: 1.5em; margin-bottom: 0.75em; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
p { margin: 0 0 0.8em 0; text-indent: 1.5em; text-align: justify; }
.title-page { text-align: center; padding-top: 20%; }
.title-page h1 { font-size: 2.2em; margin-bottom: 0.3em; }
.title-page .author { font-size: 1.1em; color: #666; font-style: italic; margin-bottom: 1em; }
.title-page .genre { font-size: 0.8em; color: #999; text-transform: uppercase; letter-spacing: 0.1em; }
.chapter { page-break-before: always; padding-top: 1em; }
.front-matter { page-break-before: always; padding-top: 1em; }
.back-matter { page-break-before: always; padding-top: 1em; }
.scene { margin: 1.5em 0; padding-left: 1em; border-left: 2px solid #ddd; }
.empty { color: #999; font-style: italic; text-indent: 0; }
blockquote { font-style: italic; color: #555; border-left: 3px solid #ccc; padding-left: 1em; margin: 1em 0; }
.copyright-page { font-size: 0.85em; color: #666; text-align: center; padding: 3rem 0; }
.dedication, .epigraph { font-style: italic; text-align: center; padding: 2rem 0; font-size: 1.05em; }
#toc { margin: 2rem 0; padding: 1.5rem; }
#toc h2 { font-size: 1.2em; margin-bottom: 1rem; text-align: center; }
#toc ol { list-style: none; counter-reset: toc; }
#toc li { padding: 0.3rem 0; counter-increment: toc; }
#toc li::before { content: counter(toc) ". "; font-weight: 600; }
#toc a { color: #2a5a8a; text-decoration: none; }
.cover-page { page-break-after: always; text-align: center; padding: 0; }
.cover-page img { max-width: 100%; height: auto; }
`;

  zip.file('OEBPS/styles.css', css);

  const items: { id: string; href: string; label: string; file: string }[] = [];
  let playOrder = 0;

  function addItem(id: string, filename: string, label: string, content: string) {
    zip.file(`OEBPS/${filename}`, content);
    items.push({ id, href: filename, label, file: filename });
  }

  // --- Cover ---
  if (assembly.coverImageUrl) {
    let coverImageData: Buffer | null = null;
    let coverMime = 'image/jpeg';
    try {
      const resp = await fetch(assembly.coverImageUrl);
      if (resp.ok) {
        const arrayBuf = await resp.arrayBuffer();
        coverImageData = Buffer.from(arrayBuf);
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.startsWith('image/png')) coverMime = 'image/png';
        else if (contentType.startsWith('image/gif')) coverMime = 'image/gif';
        else if (contentType.startsWith('image/webp')) coverMime = 'image/webp';
        else if (contentType.startsWith('image/svg')) coverMime = 'image/svg+xml';
      }
    } catch {
      // ignore fetch error
    }

    if (coverImageData) {
      const ext = coverMime === 'image/png' ? 'png' : coverMime === 'image/gif' ? 'gif' : 'jpg';
      zip.file(`OEBPS/cover.${ext}`, coverImageData);
      items.push({ id: 'cover-image', href: `cover.${ext}`, label: 'Cover', file: `cover.${ext}` });

      const coverXhtml = makeXhtml(assembly.title, `<div class="cover-page"><img src="cover.${ext}" alt="Cover" /></div>`);
      addItem('cover', 'cover.xhtml', 'Cover', coverXhtml);
    } else {
      const coverXhtml = makeXhtml(assembly.title, `<div class="cover-page"><img src="${escapeXmlMs(assembly.coverImageUrl)}" alt="Cover" /></div>`);
      addItem('cover', 'cover.xhtml', 'Cover', coverXhtml);
    }
  }

  // --- Front matter ---
  const fm = assembly.frontMatter;

  if (fm.includeTitlePage) {
    const body = wrapSection('front-matter title-page',
      `<h1>${escapeXmlMs(assembly.title)}</h1>
<p class="author">by ${escapeXmlMs(assembly.author)}</p>
${assembly.genre ? `<p class="genre">${escapeXmlMs(assembly.genre)}</p>` : ''}`
    );
    addItem('title-page', 'title.xhtml', 'Title Page', makeXhtml(assembly.title, body));
  }

  if (fm.includeCopyrightPage) {
    const year = assembly.copyrightYear || new Date().getFullYear();
    const holder = assembly.copyrightHolder || assembly.author;
    let body = wrapSection('front-matter copyright-page',
      `<p>Copyright &copy; ${year} ${escapeXmlMs(holder)}</p>
<p>All rights reserved.</p>
${fm.copyrightNotice ? `<p>${escapeXmlMs(fm.copyrightNotice)}</p>` : ''}
${assembly.isbn ? `<p>ISBN: ${escapeXmlMs(assembly.isbn)}</p>` : ''}`
    );
    addItem('copyright', 'copyright.xhtml', 'Copyright', makeXhtml(assembly.title, body));
  }

  if (fm.includeDedication && fm.dedication) {
    const body = wrapSection('front-matter dedication', `<p>${escapeXmlMs(fm.dedication)}</p>`);
    addItem('dedication', 'dedication.xhtml', 'Dedication', makeXhtml(assembly.title, body));
  }

  if (fm.includeEpigraph && fm.epigraph) {
    const body = wrapSection('front-matter epigraph', `<blockquote>${escapeXmlMs(fm.epigraph)}</blockquote>`);
    addItem('epigraph', 'epigraph.xhtml', 'Epigraph', makeXhtml(assembly.title, body));
  }

  if (fm.includeForeword && fm.foreword) {
    const paras = formatParagraphs(fm.foreword).map(p => `<p>${escapeXmlMs(p)}</p>`).join('\n');
    const body = wrapSection('front-matter', `<h2>Foreword</h2>\n${paras}`);
    addItem('foreword', 'foreword.xhtml', 'Foreword', makeXhtml(assembly.title, body));
  }

  if (fm.includePreface && fm.preface) {
    const paras = formatParagraphs(fm.preface).map(p => `<p>${escapeXmlMs(p)}</p>`).join('\n');
    const body = wrapSection('front-matter', `<h2>Preface</h2>\n${paras}`);
    addItem('preface', 'preface.xhtml', 'Preface', makeXhtml(assembly.title, body));
  }

  if (fm.includeAcknowledgments && fm.acknowledgments) {
    const paras = formatParagraphs(fm.acknowledgments).map(p => `<p>${escapeXmlMs(p)}</p>`).join('\n');
    const body = wrapSection('front-matter', `<h2>Acknowledgments</h2>\n${paras}`);
    addItem('acknowledgments', 'acknowledgments.xhtml', 'Acknowledgments', makeXhtml(assembly.title, body));
  }

  if (fm.includeTableOfContents) {
    const tocItems = assembly.chapters.map(ch =>
      `<li><a href="chapter-${ch.chapterNumber}.xhtml">Chapter ${ch.chapterNumber}: ${escapeXmlMs(ch.title)}</a></li>`
    ).join('\n');
    const body = wrapSection('front-matter', `<nav id="toc"><h2>Table of Contents</h2><ol>${tocItems}</ol></nav>`);
    addItem('toc', 'toc.xhtml', 'Table of Contents', makeXhtml(assembly.title, body));
  }

  // --- Chapters ---
  for (const ch of assembly.chapters) {
    const contentHtml = chapterContentHtml(ch.content, ch.scenes, includeScenes);
    const body = wrapSection('chapter',
      `<h2 class="chapter-title">Chapter ${ch.chapterNumber}: ${escapeXmlMs(ch.title)}</h2>\n${contentHtml}`
    );
    const filename = `chapter-${ch.chapterNumber}.xhtml`;
    addItem(`chapter-${ch.chapterNumber}`, filename, ch.title, makeXhtml(ch.title, body));
  }

  // --- Back matter ---
  const bm = assembly.backMatter;

  if (bm.includeAboutAuthor && bm.aboutAuthor) {
    const paras = formatParagraphs(bm.aboutAuthor).map(p => `<p>${escapeXmlMs(p)}</p>`).join('\n');
    const body = wrapSection('back-matter', `<h2>About the Author</h2>\n${paras}`);
    addItem('about-author', 'about.xhtml', 'About the Author', makeXhtml(assembly.title, body));
  }

  if (bm.includeAuthorWebsite && bm.authorWebsite) {
    const body = wrapSection('back-matter', `<p>Author website: ${escapeXmlMs(bm.authorWebsite)}</p>`);
    addItem('author-website', 'website.xhtml', 'Author Website', makeXhtml(assembly.title, body));
  }

  if (bm.includeReviewRequest && bm.reviewRequest) {
    const paras = formatParagraphs(bm.reviewRequest).map(p => `<p>${escapeXmlMs(p)}</p>`).join('\n');
    const body = wrapSection('back-matter', paras);
    addItem('review-request', 'review.xhtml', 'Review Request', makeXhtml(assembly.title, body));
  }

  if (bm.includeNewsletterSignup && bm.newsletterSignup) {
    const paras = formatParagraphs(bm.newsletterSignup).map(p => `<p>${escapeXmlMs(p)}</p>`).join('\n');
    const body = wrapSection('back-matter', paras);
    addItem('newsletter', 'newsletter.xhtml', 'Newsletter', makeXhtml(assembly.title, body));
  }

  if (bm.includeThankYou && bm.thankYouNote) {
    const body = wrapSection('back-matter', `<p>${escapeXmlMs(bm.thankYouNote)}</p>`);
    addItem('thank-you', 'thanks.xhtml', 'Thank You', makeXhtml(assembly.title, body));
  }

  if (bm.includeNextBookTeaser && bm.nextBookTeaser) {
    const paras = formatParagraphs(bm.nextBookTeaser).map(p => `<p>${escapeXmlMs(p)}</p>`).join('\n');
    const body = wrapSection('back-matter', `<h2>Coming Soon</h2>\n${paras}`);
    addItem('next-book', 'nextbook.xhtml', 'Coming Soon', makeXhtml(assembly.title, body));
  }

  if (bm.includeAlsoByAuthor && bm.alsoByAuthor) {
    const body = wrapSection('back-matter', `<h2>Also by ${escapeXmlMs(assembly.author)}</h2><p>${escapeXmlMs(bm.alsoByAuthor)}</p>`);
    addItem('also-by', 'alsoby.xhtml', 'Also by Author', makeXhtml(assembly.title, body));
  }

  // --- content.opf ---
  const manifestLines = items.map(f =>
    `    <item id="${f.id}" href="${f.href}" media-type="application/xhtml+xml"/>`
  ).join('\n');

  const spineLines = items.map(f =>
    `    <itemref idref="${f.id}"/>`
  ).join('\n');

  // Add stylesheet to manifest
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="bookid">urn:uuid:${uuid()}</dc:identifier>
    <dc:title>${escapeXmlMs(assembly.title)}</dc:title>
    <dc:creator>${escapeXmlMs(assembly.author)}</dc:creator>
    <dc:language>${assembly.language}</dc:language>
    ${assembly.genre ? `<dc:subject>${escapeXmlMs(assembly.genre)}</dc:subject>` : ''}
  </metadata>
  <manifest>
    <item id="css" href="styles.css" media-type="text/css"/>
${manifestLines}
  </manifest>
  <spine toc="ncx">
${spineLines}
  </spine>
</package>`;
  zip.file('OEBPS/content.opf', opf);

  // --- toc.ncx ---
  const navPoints = items.map((f) => {
    playOrder++;
    return `    <navPoint id="${f.id}" playOrder="${playOrder}">
      <navLabel><text>${escapeXmlMs(f.label)}</text></navLabel>
      <content src="${f.href}"/>
    </navPoint>`;
  }).join('\n');

  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${uuid()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXmlMs(assembly.title)}</text></docTitle>
  <docAuthor><text>${escapeXmlMs(assembly.author)}</text></docAuthor>
  <navMap>
${navPoints}
  </navMap>
</ncx>`;
  zip.file('OEBPS/toc.ncx', ncx);

  const blob = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return Buffer.from(blob);
}
