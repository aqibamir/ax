export interface IDocument {
  url: string;
  text: string;
  metadata: Record<string, any>;
}

export interface IDocumentSource {
  iterable(): AsyncIterable<IDocument>;
}
