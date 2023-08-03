import { extname } from 'node:path';
import { stat as fsStat } from 'node:fs/promises';

import { IDocument } from '../types';

export async function toDocument(
  filePath: string,
  options?: { url?: string; metadata?: Record<string, any> },
): Promise<IDocument> {
  const stat = await fsStat(filePath);

  if (!stat.isFile()) {
    throw new Error(`Invalid path: ${filePath} is not a file`);
  }

  const ext = extname(filePath).slice(1).toLowerCase();

  switch (ext) {
    case 'pdf':
      const pdf = await import('./pdf');
      return pdf.toDocument(filePath, options);
    default:
      const text = await import('./text');
      return text.toDocument(filePath, options);
  }
}
