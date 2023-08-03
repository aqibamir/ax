import { readFile } from 'fs/promises';
import type { IDocument } from '../types';

export { toDocument };

type OptionsType = {
  url?: string;
  metadata?: Record<string, any>;
};

async function toDocument(file: Buffer, options?: OptionsType): Promise<IDocument>;
async function toDocument(file: string, options?: OptionsType): Promise<IDocument>;
async function toDocument(file: Buffer | string, options?: OptionsType): Promise<IDocument> {
  let url: string;
  let buffer: Buffer;

  if (typeof file === 'string') {
    buffer = await readFile(file);
    url = options?.url || file;
  } else {
    buffer = file;
    url = options?.url || 'file.txt';
  }

  return {
    url: url,
    text: buffer.toString('utf8'),
    metadata: options?.metadata || {},
  };
}
