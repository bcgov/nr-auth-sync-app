/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'inversify';
import { getLogger } from '@oclif/core';
import { Octokit } from '@octokit/core';
import { Integration, TargetService } from '../target.service.js';
import {
  GitHubTargetConfig,
  IntegrationConfig,
  RoleSpec,
} from '../../types.js';
import { SourceUser } from '../source.service.js';
import {
  Api,
  RestEndpointMethodTypes,
} from '@octokit/plugin-rest-endpoint-methods';
import { PaginateInterface } from '@octokit/plugin-paginate-rest';

@injectable()
export class TargetGitHubService implements TargetService {
  private readonly console = getLogger('TargetGitHubService');

  constructor(
    private octokit: Octokit &
      Api & {
        paginate: PaginateInterface;
      },
  ) {}

  getIntegration(config: IntegrationConfig): Promise<Integration> {
    return this.getIntegrations(config).then((integrations) => {
      return integrations[0] ?? undefined;
    });
  }

  public async getIntegrations(
    config: IntegrationConfig,
  ): Promise<Integration[]> {
    const target = this.narrowTargetConfig(config);

    return [
      {
        id: target.org,
        name: target.org,
        environments: ['production'],
      },
    ];
  }

  public async getIntegrationEnvironmentRoles(
    config: IntegrationConfig,
    id: string | number,
    environment: string,
  ): Promise<RoleSpec[]> {
    const teams = await this.getChildAndDescendantTeams(config, id.toString());
    const slugs = teams.map(
      (team) => new RoleSpec(team.slug, team.parent?.slug),
    );
    // console.log(slugs);
    return slugs;
  }

  /**
   * Fetches all child and descendant teams of a parent team by slug.
   */
  private async getChildAndDescendantTeams(
    config: IntegrationConfig,
    org: string,
  ) {
    const target = this.narrowTargetConfig(config);
    try {
      // Fetch all teams in the organization
      const allTeams = await this.octokit.paginate(
        this.octokit.rest.teams.list,
        {
          org,
          per_page: 100,
        },
      );

      // Find the parent team by slug
      const parentTeam = allTeams.find(
        (team) => team.slug === target.parentSlug,
      );
      if (!parentTeam) {
        this.console.error(
          `Parent team '${target.parentSlug}' not found in organization '${org}'.`,
        );
        throw new Error(
          `Parent team '${target.parentSlug}' not found in organization '${org}'.`,
        );
      }

      // Filter for child teams (immediate descendants)
      const childTeams = allTeams.filter(
        (team) => team.parent?.id === parentTeam.id,
      );

      // Recursive function to get all descendants
      const getDescendants = (
        parentId: number,
        teams: RestEndpointMethodTypes['teams']['list']['response']['data'],
      ): RestEndpointMethodTypes['teams']['list']['response']['data'] => {
        const children = teams.filter((team) => team.parent?.id === parentId);
        return children.reduce(
          (descendants, child) => [
            ...descendants,
            child,
            ...getDescendants(child.id, teams),
          ],
          [] as RestEndpointMethodTypes['teams']['list']['response']['data'],
        );
      };

      // Get all descendant teams
      const descendantTeams = getDescendants(parentTeam.id, allTeams);

      // Output the results
      this.console.info(`Child teams of '${target.parentSlug}':`, childTeams);
      this.console.info(
        `All descendant teams of '${target.parentSlug}':`,
        descendantTeams,
      );
      return descendantTeams;
    } catch (error) {
      this.console.error('Error fetching teams:', error);
      throw new Error('Error fetching teams');
    }
  }

  async addIntegrationEnvironmentRole(
    config: IntegrationConfig,
    id: string | number,
    environment: string,
    role: RoleSpec,
  ): Promise<void> {
    const target = this.narrowTargetConfig(config);
    // console.log(id);
    // console.log(environment);
    // console.log(role);
    const parentSlug = role.parentName ?? target.parentSlug;
    const parentId = await this.slugToId(id.toString(), parentSlug);

    if (!this.checkSlugAllowed(target, role.name)) {
      this.console.error(
        `Skip team creation. Slug '${role.name}' is not allowed.`,
      );
      return;
    }

    await this.octokit.rest.teams.create({
      org: id.toString(),
      name: role.name,
      description: role.description ?? 'Auth Sync Team',
      maintainers: [],
      notification_setting: 'notifications_disabled',
      parent_team_id: parentId,
    });
  }

  private async slugToId(org: string, slug: string) {
    const { data: team } = await this.octokit.rest.teams.getByName({
      org,
      team_slug: slug,
    });
    return team.id;
  }

  async deleteIntegrationEnvironmentRole(
    config: IntegrationConfig,
    id: string | number,
    environment: string,
    role: RoleSpec,
  ): Promise<void> {
    const target = this.narrowTargetConfig(config);

    if (!this.checkSlugAllowed(target, role.name)) {
      this.console.error(
        `Could not delete because '${role.name}' is not allowed.`,
      );
      return;
    }

    await this.octokit.rest.teams.deleteInOrg({
      org: id.toString(),
      team_slug: role.name,
    });
  }

  async alterIntegrationRoleUser(
    integrationConfig: IntegrationConfig,
    targetId: string,
    environment: string,
    roleName: string,
    operation: 'add' | 'del',
    users: SourceUser[],
  ): Promise<SourceUser[]> {
    const finalized: SourceUser[] = [];

    if (users.length === 0) {
      this.console.debug(`No users to ${operation}`);
    }

    for (const user of users) {
      if (!user.alias?.github) {
        continue;
      }
      if (operation === 'add') {
        await this.octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
          org: targetId.toString(),
          team_slug: roleName,
          username: user.alias.github,
        });
      } else if (operation === 'del') {
        await this.octokit.rest.teams.removeMembershipForUserInOrg({
          org: targetId.toString(),
          team_slug: roleName,
          username: user.alias.github,
        });
      }
      finalized.push(user);
    }
    return finalized;
  }
  async getRoleUsers(
    id: string | number,
    environment: string,
    idp: string,
    roleName: string,
  ): Promise<Map<string, SourceUser>> {
    const userSet = new Map<string, SourceUser>();
    const { data: members } = await this.octokit.rest.teams.listMembersInOrg({
      org: id.toString(),
      team_slug: roleName,
    });

    for (const member of members) {
      userSet.set(member.login, {
        guid: member.login,
        domain: 'github',
      });
    }
    return userSet;
  }
  async resetUserCache(all: boolean): Promise<void> {
    // throw new Error('resetUserCache: Method not implemented.');
  }

  private checkSlugAllowed(target: GitHubTargetConfig, slug: string) {
    const reg = new RegExp(target.allowRegex);
    return reg.test(slug);
  }

  private narrowTargetConfig(config: IntegrationConfig): GitHubTargetConfig {
    const target = config.target;
    if (target.type !== 'github') {
      // Should not happen
      throw new Error('Wrong type');
    }
    return target;
  }
}
