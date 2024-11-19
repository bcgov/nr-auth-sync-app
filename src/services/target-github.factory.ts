import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';

import { TargetGitHubService } from './impl/target-github.service.js';

let GITHUB_API_INSTANCE: TargetGitHubService | null = null;

export async function githubServiceFactory(
  clientType: 'github-app' | 'pat' | undefined,
  appId: string,
  clientId: string,
  clientSecret: string,
  privateKey: string,
  token: string,
): Promise<TargetGitHubService | null> {
  if (GITHUB_API_INSTANCE) {
    return GITHUB_API_INSTANCE;
  }

  if (clientType === 'pat') {
    const octokit = new Octokit({ auth: token });
    GITHUB_API_INSTANCE = new TargetGitHubService(octokit);
  } else if (clientType === 'github-app') {
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        clientId,
        clientSecret,
        privateKey,
      },
    });
    GITHUB_API_INSTANCE = new TargetGitHubService(octokit);
  }

  return GITHUB_API_INSTANCE;
}
