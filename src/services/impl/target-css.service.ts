import axios, { AxiosRequestConfig } from 'axios';
import { injectable } from 'inversify';
import { getLogger } from '@oclif/core';

import { Integration, TargetService } from '../target.service.js';
import {
  CssTargetConfig,
  IntegrationConfig,
  IntegrationEnvironmentRoleUsersDto,
  RoleSpec,
} from '../../types.js';
import { SourceUser } from '../source.service.js';

const CSS_SSO_API_URL = 'https://api.loginproxy.gov.bc.ca/api/v1';
const ROLE_USER_MAX = 50;
const idpToPath: { [key in string]: string } = {
  azureidir: 'azure-idir',
  idir: 'idir',
};

@injectable()
/**
 *
 */
export class TargetCssService implements TargetService {
  private readonly console = getLogger('TargetCssService');
  private axiosOptions!: AxiosRequestConfig;
  private token!: string;
  private ignoreEnvGuids: { [key in string]: Map<string, boolean> } = {};

  public setToken(token: string) {
    this.token = token;
    this.axiosOptions = {
      baseURL: CSS_SSO_API_URL,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };
  }

  async getIntegration(
    config: IntegrationConfig,
  ): Promise<Integration | undefined> {
    const target = this.narrowTargetConfig(config);
    return (await this.getIntegrations()).find((i) => i.name === target.name);
  }

  public async getIntegrations(): Promise<Integration[]> {
    const cssIntArr = (await axios.get('integrations', this.axiosOptions)).data
      .data;
    return cssIntArr.map((cssInt: any) => ({
      id: cssInt.id,
      name: cssInt.projectName,
      environments: cssInt.environments,
    }));
  }

  public async getIntegrationEnvironmentRoles(
    config: IntegrationConfig,
    id: string | number,
    environment: string,
  ): Promise<RoleSpec[]> {
    return (
      await axios.get(
        `/integrations/${id}/${environment}/roles`,
        this.axiosOptions,
      )
    ).data.data.map((roleObj: any) => new RoleSpec(roleObj.name));
  }
  public async addIntegrationEnvironmentRole(
    config: IntegrationConfig,
    id: string | number,
    environment: string,
    role: RoleSpec,
  ): Promise<void> {
    return axios.post(
      `/integrations/${id}/${environment}/roles`,
      {
        name: role.name,
      },
      this.axiosOptions,
    );
  }
  public async deleteIntegrationEnvironmentRole(
    config: IntegrationConfig,
    id: string | number,
    environment: string,
    role: RoleSpec,
  ): Promise<void> {
    return axios.delete(
      `/integrations/${id}/${environment}/roles/${role.name}`,
      this.axiosOptions,
    );
  }

  public async getRoleUsers(
    id: string | number,
    environment: string,
    idp: string,
    roleName: string,
  ): Promise<Map<string, SourceUser>> {
    const userSet = new Map<string, SourceUser>();
    let pageUserCount = ROLE_USER_MAX;
    for (let page = 1; pageUserCount === ROLE_USER_MAX; page++) {
      const fetchedUsers = (
        await axios.get<IntegrationEnvironmentRoleUsersDto>(
          `/integrations/${id}/${environment}/roles/${roleName}/users`,
          {
            params: {
              page,
              max: ROLE_USER_MAX,
            },
            ...this.axiosOptions,
          },
        )
      ).data.data;
      for (const user of fetchedUsers) {
        if (
          user.username.endsWith('@' + idp) ||
          user.username.endsWith('@' + idp.replace('-', ''))
        ) {
          userSet.set(user.attributes.idir_user_guid[0], {
            guid: user.attributes.idir_user_guid[0],
            domain: idp,
          });
        }
      }
      pageUserCount = fetchedUsers.length;
    }
    return userSet;
  }

  public async alterIntegrationRoleUser(
    integrationConfig: IntegrationConfig,
    targetId: string,
    environment: string,
    roleName: string,
    operation: 'add' | 'del',
    users: SourceUser[],
  ) {
    const finalized: SourceUser[] = [];
    if (users.length === 0) {
      this.console.debug(`No users to ${operation}`);
    }
    for (const user of users) {
      const username = `${user.guid.toLowerCase()}@${integrationConfig.target.idp}`;
      if (
        await this.testIgnoreUser(
          integrationConfig.target.idp,
          environment,
          user.guid,
        )
      ) {
        this.console.debug(`${operation}: ${username} (skip)`);
        continue;
      }
      this.console.debug(`${operation}: ${username}`);
      if (operation === 'add') {
        await axios.post(
          `/integrations/${targetId}/${environment}/users/${username}/roles`,
          [
            {
              name: roleName,
            },
          ],
          this.axiosOptions,
        );
      } else if (operation === 'del') {
        await axios.delete(
          `/integrations/${targetId}/${environment}/users/${username}/roles/${roleName}`,
          this.axiosOptions,
        );
      }
      finalized.push(user);
    }
    return finalized;
  }

  public async resetUserCache(all: boolean) {
    if (all) {
      this.ignoreEnvGuids = {};
    } else {
      for (const key of Object.keys(this.ignoreEnvGuids)) {
        const envUserCache = this.ignoreEnvGuids[key];
        for (const [guid, ignoreUser] of envUserCache)
          if (ignoreUser) {
            envUserCache.delete(guid);
          }
      }
    }
  }

  private async testIgnoreUser(idp: string, environment: string, guid: string) {
    if (this.ignoreEnvGuids[environment]?.has(guid)) {
      // this.console.info(`use cache: guid`);
      return this.ignoreEnvGuids[environment].get(guid);
    }
    const data = (
      await axios.get(
        `/${environment}/${idpToPath[idp]}/users?guid=${guid}`,
        this.axiosOptions,
      )
    ).data.data;

    if (!this.ignoreEnvGuids[environment]) {
      this.ignoreEnvGuids[environment] = new Map();
    }
    if (data.length === 0) {
      this.ignoreEnvGuids[environment].set(guid, true);
      return true;
    }

    this.ignoreEnvGuids[environment].set(guid, false);
    return false;
  }

  private narrowTargetConfig(config: IntegrationConfig): CssTargetConfig {
    const target = config.target;
    if (target.type !== 'css') {
      // Should not happen
      throw new Error('Wrong type');
    }
    return target;
  }
}
