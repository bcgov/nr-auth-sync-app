/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'inversify';
import { getLogger } from '@oclif/core';
import { Octokit } from '@octokit/core';
import { Integration, TargetService } from '../target.service.js';
import { GitHubTargetConfig, IntegrationConfig } from '../../types.js';
import { SourceUser } from '../source.service.js';

@injectable()
export class TargetGitHubService implements TargetService {
  private readonly console = getLogger('TargetGitHubService');

  constructor(private octokit: Octokit) {}

  getIntegration(config: IntegrationConfig): Promise<Integration> {
    return this.getIntegrations().then((integrations) => {
      return integrations[0] ?? undefined;
    });
  }

  getIntegrations(): Promise<Integration[]> {
    throw new Error('Method not implemented.');
  }

  getIntegrationEnvironmentRoles(
    id: string | number,
    environment: string,
  ): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  addIntegrationEnvironmentRole(
    id: string | number,
    environment: string,
    role: string,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteIntegrationEnvironmentRole(
    id: string | number,
    environment: string,
    role: string,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  alterIntegrationRoleUser(
    integrationConfig: IntegrationConfig,
    targetId: string,
    environment: string,
    roleName: string,
    operation: 'add' | 'del',
    users: SourceUser[],
  ): Promise<SourceUser[]> {
    throw new Error('Method not implemented.');
  }
  getRoleUsers(
    id: string | number,
    environment: string,
    idp: string,
    roleName: string,
  ): Promise<Map<string, SourceUser>> {
    throw new Error('Method not implemented.');
  }
  resetUserCache(all: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
