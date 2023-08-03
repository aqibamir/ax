import { readFile } from 'fs/promises';
import pdfParse from 'pdf-parse';
import type { IDocument } from '../types';

export { toDocument };

type OptionsType = {
  url?: string;
  metadata?: Record<string, any>;
};

async function toDocument(file: Buffer, options?: OptionsType): Promise<IDocument>;
async function toDocument(path: string, options?: OptionsType): Promise<IDocument>;
async function toDocument(file: Buffer | string, options?: OptionsType): Promise<IDocument> {
  let buffer: Buffer;
  let url: string;

  if (typeof file === 'string') {
    buffer = await readFile(file);
    url = options?.url || file;
  } else {
    buffer = file;
    url = options?.url || 'file.pdf';
  }

  const pdf = await pdfParse(buffer);

  return {
    url: url,
    text: pdf.text,
    metadata: options?.metadata || {},
  };
}
