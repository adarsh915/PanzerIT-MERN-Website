import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/session';

// ─── Magic Byte Signatures ────────────────────────────────────────────────────
// Used to validate that the actual file content matches the claimed extension.
// An attacker cannot bypass this by simply renaming a file.
const MAGIC_BYTES: Record<string, { offset: number; bytes: number[] }[]> = {
  '.jpg':  [{ offset: 0, bytes: [0xFF, 0xD8, 0xFF] }],
  '.jpeg': [{ offset: 0, bytes: [0xFF, 0xD8, 0xFF] }],
  '.png':  [{ offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47] }],
  '.gif':  [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }],
  '.webp': [{ offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }], // RIFF header
  '.pdf':  [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  '.mp4':  [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }], // ftyp box
  '.webm': [{ offset: 0, bytes: [0x1A, 0x45, 0xDF, 0xA3] }],
}

function validateMagicBytes(buf: Buffer, ext: string): boolean {
  const signatures = MAGIC_BYTES[ext]
  // No magic bytes defined for this extension (doc, docx, txt, etc.) — skip check
  if (!signatures) return true
  return signatures.some(({ offset, bytes }) =>
    bytes.every((b, i) => buf[offset + i] === b)
  )
}

// ─── Allowed Extensions ───────────────────────────────────────────────────────
// SVG is intentionally excluded: SVG files can contain embedded <script> tags
// and execute JavaScript when opened in a browser from your domain.
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt',
  '.mp4', '.webm', '.mov', '.avi',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  // Auth guard — must be a logged-in admin
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'misc';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // File size cap
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds the 10 MB limit' }, { status: 400 });
    }

    // Sanitize folder name to prevent path traversal
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'misc'

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = (file as any).name || 'uploaded_file';
    let extension = path.extname(originalName).toLowerCase();

    // If no extension found in name, try to guess from MIME type
    if (!extension && file.type) {
      const mimeToExt: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'application/pdf': '.pdf',
        'text/plain': '.txt',
      };
      extension = mimeToExt[file.type] || '';
    }

    // 1. Extension allowlist check
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // 2. Magic byte validation — confirms actual file content matches the extension.
    // Catches files where an attacker renames e.g. evil.php → image.jpg.
    if (!validateMagicBytes(buffer, extension)) {
      return NextResponse.json({ error: 'File content does not match its extension' }, { status: 400 });
    }

    // Format readable filename while preserving original name
    const rawBaseName = path.basename(originalName, path.extname(originalName));
    const sanitizedBaseName = rawBaseName
      .trim()
      .replace(/[^a-zA-Z0-9_ -]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 100) || 'file';

    // Define the path to save the file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Check if filename already exists; if so, append timestamp to keep unique
    let targetFilename = `${sanitizedBaseName}${extension}`;
    try {
      await fs.access(path.join(uploadDir, targetFilename));
      targetFilename = `${sanitizedBaseName}_${Date.now()}${extension}`;
    } catch {
      // File does not exist yet — use exact original name
    }

    // Save the file
    const filePath = path.join(uploadDir, targetFilename);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFolder}/${targetFilename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: originalName,
      fileType: file.type,
      size: file.size,
    });

  } catch (error) {
    console.error('[UPLOAD] Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error during file upload' }, { status: 500 });
  }
}

