import Path from 'node:path';

import { toDocument } from '../src/files';

describe('files', () => {
  describe('toDocument', () => {
    it('throws an error when the given filePath is not a path to a valid file', async () => {
      const pathToADirectory = Path.resolve(__dirname, 'example_files');
      await expect(toDocument(pathToADirectory)).rejects.toThrowError(/invalid path/i);
    });

    it('can create a document from a file path', async () => {
      const csvFilePath = Path.resolve(__dirname, 'example_files', 'test.csv');
      const pdfFilePath = Path.resolve(__dirname, 'example_files', 'test.pdf');
      const textFilePath = Path.resolve(__dirname, 'example_files', 'test.txt');

      const [csvDocument, pdfDocument, textDocument] = await Promise.all([
        toDocument(csvFilePath),
        toDocument(pdfFilePath),
        toDocument(textFilePath),
      ]);

      expect(csvDocument).toMatchObject({
        url: expect.stringContaining('test/example_files/test.csv'),
        text: 'id,description\n1,row 1\n2,row 2',
        metadata: {},
      });

      expect(pdfDocument).toMatchObject({
        url: expect.stringContaining('test/example_files/test.pdf'),
        text: expect.stringContaining('PDF Heading'),
        metadata: {},
      });

      expect(textDocument).toMatchObject({
        url: expect.stringContaining('test/example_files/test.txt'),
        text: 'text file',
        metadata: {},
      });
    });

    it('can override the document url and metadata', async () => {
      const pdfFilePath = Path.resolve(__dirname, 'example_files', 'test.pdf');
      const textFilePath = Path.resolve(__dirname, 'example_files', 'test.txt');

      const [pdfDocument, textDocument] = await Promise.all([
        toDocument(pdfFilePath, { url: 'test.pdf', metadata: { type: 'pdf' } }),
        toDocument(textFilePath, { url: 'test.txt', metadata: { type: 'text' } }),
      ]);

      expect(pdfDocument).toMatchObject({
        url: 'test.pdf',
        text: expect.stringContaining('PDF Heading'),
        metadata: { type: 'pdf' },
      });

      expect(textDocument).toMatchObject({
        url: 'test.txt',
        text: 'text file',
        metadata: { type: 'text' },
      });
    });
  });
});
