import { GhRepoIssues } from '../sources/gh-repo-issues';
import { getEnvOrThrow } from '../config';

async function main() {
  const source = new GhRepoIssues({
    repo: 'onnxruntime',
    owner: 'microsoft',
    token: getEnvOrThrow('GH_ISSUES_PAT'),
    params: {
      state: 'all',
      per_page: 75,
    },
  });

  for await (const _s of source.iterable()) {
    process.stdout.write('.');
  }
}

main();
