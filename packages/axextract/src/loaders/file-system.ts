import { resolve } from 'node:path';
import { glob } from 'glob';

import { toDocument } from '../files';
import type { IDocument, IDocumentSource } from '../types';

export type FileSystemOptionsType = {
  path: string;
  toDocument?: (filePath: string) => Promise<IDocument>;
};

export class FileSystem implements IDocumentSource {
  private readonly path: string;
  private readonly toDocument: (filePath: string) => Promise<IDocument>;

  constructor(options: FileSystemOptionsType) {
    this.path = options.path;
    this.toDocument = options.toDocument || toDocument;
  }

  async *iterable(): AsyncIterable<IDocument> {
    const path = resolve(process.cwd(), this.path);

    for (const filePath of await glob(path)) {
      yield this.toDocument(filePath);
    }
  }
}
