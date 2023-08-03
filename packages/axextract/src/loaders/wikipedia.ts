import { getJSON, toQueryString } from '../utils';

import { IDocument, IDocumentSource } from '../types';

export type WikipediaOptions = {
  term: string;
};

export class Wikipedia implements IDocumentSource {
  private options: WikipediaOptions;

  constructor(options: WikipediaOptions) {
    this.options = options;
  }

  async *iterable(): AsyncIterable<IDocument> {
    const term = this.options.term;

    const doc = await this.fetchDocForTerm(term);

    yield {
      url: `https://en.wikipedia.org/?curid=${doc.id}`,
      text: doc.text,
      metadata: {},
    };
  }

  private async fetchDocForTerm(term: string) {
    const queryString = toQueryString({
      action: 'query',
      format: 'json',
      titles: term,
      prop: 'extracts',
      explaintext: 'true',
    });

    const { ok, status, data } = await getJSON(`https://en.wikipedia.org/w/api.php${queryString}`);

    if (!ok) {
      throw new Error(
        `Request failed with HTTP status ${status} while fetching the wikipedia page for ${term}.`,
      );
    }

    const pages = data.query?.pages;
    if (!pages || pages['-1']) {
      throw new Error(`No Wikipedia page found for term "${term}"`);
    }

    const firstKey = Object.keys(pages)[0];

    return {
      id: firstKey,
      text: pages[firstKey].extract,
    };
  }
}
