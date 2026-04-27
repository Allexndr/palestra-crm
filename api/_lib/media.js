import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

const MB = 1024 * 1024;
const IMAGE_MAX_BYTES = 12 * MB;
const FILE_MAX_BYTES = 30 * MB;
const IMAGE_MAX_EDGE = 2200;

const ALLOWED_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const ALLOWED_FILES = new Set([
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export function safeFileName(name = 'upload') {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 120) || 'upload';
}

export async function readRequestBuffer(req, maxBytes = FILE_MAX_BYTES) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > maxBytes) {
      const error = new Error('File is too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

function normalizeMime(detectedMime, headerMime) {
  const cleanHeader = String(headerMime || '').split(';')[0].trim().toLowerCase();
  return detectedMime || cleanHeader || 'application/octet-stream';
}

function extensionForMime(mime) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/avif') return 'avif';
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'text/plain') return 'txt';
  if (mime === 'text/csv') return 'csv';
  if (mime === 'application/json') return 'json';
  if (mime === 'application/zip') return 'zip';
  return 'bin';
}

export async function prepareUpload({ buffer, fileName, headerMime, scope }) {
  const detected = await fileTypeFromBuffer(buffer);
  const mime = normalizeMime(detected?.mime, headerMime);
  const isImage = ALLOWED_IMAGES.has(mime);

  if (!isImage && !ALLOWED_FILES.has(mime)) {
    const error = new Error('File type is not allowed');
    error.statusCode = 415;
    throw error;
  }

  if (isImage && buffer.length > IMAGE_MAX_BYTES) {
    const error = new Error('Image is too large');
    error.statusCode = 413;
    throw error;
  }

  if (!isImage) {
    return {
      body: buffer,
      contentType: mime,
      fileName: safeFileName(fileName || `file.${extensionForMime(mime)}`),
      optimized: false,
      originalBytes: buffer.length,
      finalBytes: buffer.length,
    };
  }

  const image = sharp(buffer, { animated: mime === 'image/gif' }).rotate();
  const metadata = await image.metadata();
  const shouldResize = Math.max(metadata.width || 0, metadata.height || 0) > IMAGE_MAX_EDGE;
  const pipeline = shouldResize
    ? image.resize({ width: IMAGE_MAX_EDGE, height: IMAGE_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    : image;

  const wantsTransparency = Boolean(metadata.hasAlpha);
  const optimizedBuffer = wantsTransparency
    ? await pipeline.webp({ quality: 84, effort: 5 }).toBuffer()
    : await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();

  const contentType = wantsTransparency ? 'image/webp' : 'image/jpeg';
  const base = safeFileName(fileName || `image.${extensionForMime(mime)}`).replace(/\.[^.]+$/, '');
  const finalName = `${base}.${wantsTransparency ? 'webp' : 'jpg'}`;

  return {
    body: optimizedBuffer.length < buffer.length ? optimizedBuffer : buffer,
    contentType: optimizedBuffer.length < buffer.length ? contentType : mime,
    fileName: optimizedBuffer.length < buffer.length ? finalName : safeFileName(fileName),
    optimized: optimizedBuffer.length < buffer.length,
    originalBytes: buffer.length,
    finalBytes: Math.min(optimizedBuffer.length, buffer.length),
    width: metadata.width,
    height: metadata.height,
    scope,
  };
}

export const uploadLimits = {
  imageMaxBytes: IMAGE_MAX_BYTES,
  fileMaxBytes: FILE_MAX_BYTES,
};
