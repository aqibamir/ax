import { getJSON, toQueryString } from '../utils';
import type { Document, IDataSource } from '../types';

export const NAME = 'gh-issues' as const;

type GhPaginationKey = 'prev' | 'next' | 'first' | 'last';
type GhPaginationMap = Partial<{ [k in GhPaginationKey]: string }>;

export type GhRepoIssuesOptions = {
  // Github owner, e.g., axill-io
  owner: string;

  // Github repo, e.g., ax
  repo: string;

  // This can be a personal access token or classic access token.
  // Authenticates requests for private repos or used to avoid rate limiting.
  token?: string;

  // See available query params here https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28
  params?: Record<string, any>;

  // API Version
  version?: string;

  // Ignore PRs. Defaults to true.
  includePullRequests?: boolean;
};

export class GhRepoIssues implements IDataSource {
  private options: GhRepoIssuesOptions;

  constructor(options: GhRepoIssuesOptions) {
    this.options = Object.assign({ includePullRequests: true }, options);
  }

  async *iterable(): AsyncIterable<Document> {
    const { owner, repo, token, params, version, includePullRequests } = this.options;

    let url = this.listIssuesUrl(owner, repo, params);

    while (true) {
      const { pagination, issues } = await this.fetchIssues(url, version, token);

      for (const issue of issues) {
        if (!includePullRequests && issue.pull_request) {
          continue;
        }

        yield {
          url: issue.url,
          text: issue.title,
          metadata: {},
        };
      }

      if (pagination.next) {
        url = pagination.next;
      } else {
        break;
      }
    }
  }

  private listIssuesUrl(owner: string, repo: string, params?: Record<string, any>) {
    return `https://api.github.com/repos/${owner}/${repo}/issues${toQueryString(params || {})}`;
  }

  private async fetchIssues(url: string, version?: string, token?: string) {
    const requestHeaders: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };

    if (typeof version === 'string') {
      requestHeaders['X-GitHub-Api-Version'] = version;
    }

    if (typeof token === 'string') {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const { headers, status, data } = await getJSON<any[]>(url, requestHeaders);

    if (status === 404) {
      throw new Error('GitHub repo not found');
    } else if (status !== 200) {
      throw new Error(`Request failed with HTTP status code ${status}`);
    }

    return {
      issues: data,
      pagination: this.linkHeaderToPaginationMap(headers.link),
    };
  }

  private linkHeaderToPaginationMap(header?: string): GhPaginationMap {
    if (typeof header !== 'string') {
      return {};
    }

    const links: GhPaginationMap = {};

    for (const linkHeader of header.split(',')) {
      const match = linkHeader.match(/^\s?<([^>]+)>; rel="(\w+)"/);

      if (match) {
        const url = match[1];
        const rel = match[2] as GhPaginationKey;
        links[rel] = url;
      }
    }

    return links;
  }
}
