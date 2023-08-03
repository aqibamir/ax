import Path from 'node:path';

import { FileSystem } from '../../src/loaders/file-system';

async function fromAsync<T>(it: AsyncIterable<T>) {
  const items: T[] = [];

  for await (const item of it) {
    items.push(item);
  }

  return items;
}

describe('files', () => {
  it('can read from the file system', async () => {
    const path = Path.resolve(__dirname, '..', 'example_files/**/*');
    const fsLoader = new FileSystem({ path: path });
    const documents = await fromAsync(fsLoader.iterable());

    expect(documents.length).toBe(3);

    expect(documents).toEqual(
      expect.arrayContaining([
        {
          url: expect.stringContaining('test/example_files/test.csv'),
          text: 'id,description\n1,row 1\n2,row 2',
          metadata: {},
        },
        {
          url: expect.stringContaining('test/example_files/test.pdf'),
          text: expect.stringContaining('PDF Heading'),
          metadata: {},
        },
        {
          url: expect.stringContaining('test/example_files/test.txt'),
          text: 'text file',
          metadata: {},
        },
      ]),
    );
  });
});
