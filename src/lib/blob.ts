import { put } from '@vercel/blob';

const BLOB_ENABLED = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function uploadCoverImage(
  base64Data: string,
  projectId: string
): Promise<string> {
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const filename = `covers/${projectId}-${Date.now()}.png`;

  if (BLOB_ENABLED) {
    const blob = await put(filename, buffer, {
      contentType: 'image/png',
      access: 'public',
    });
    return blob.url;
  }

  return `data:image/png;base64,${base64}`;
}

export async function uploadCoverFile(
  file: File,
  projectId: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const filename = `covers/${projectId}-${Date.now()}.${ext}`;
  const contentType = file.type || `image/${ext}`;

  if (BLOB_ENABLED) {
    const blob = await put(filename, file, {
      contentType,
      access: 'public',
    });
    return blob.url;
  }

  // Fallback: convert to base64 data URL
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  return `data:${contentType};base64,${base64}`;
}
