import JSZip from 'jszip';
import crypto from 'crypto';

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
