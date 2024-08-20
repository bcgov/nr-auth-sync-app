import axios, { AxiosRequestConfig } from 'axios';
import { injectable } from 'inversify';
import { Integration, TargetService } from '../target.service';
import {
  IntegrationConfig,
  IntegrationEnvironmentRoleUsersDto,
} from '../../types';
import { SourceUser } from '../source.service';

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
    id: string | number,
    environment: string,
  ): Promise<string[]> {
    return (
      await axios.get(
        `/integrations/${id}/${environment}/roles`,
        this.axiosOptions,
      )
    ).data.data.map((roleObj: any) => roleObj.name);
  }
  public async addIntegrationEnvironmentRole(
    id: string | number,
    environment: string,
    role: string,
  ): Promise<void> {
    return axios.post(
      `/integrations/${id}/${environment}/roles`,
      {
        name: role,
      },
      this.axiosOptions,
    );
  }
  public async deleteIntegrationEnvironmentRole(
    id: string | number,
    environment: string,
    role: string,
  ): Promise<void> {
    return axios.delete(
      `/integrations/${id}/${environment}/roles/${role}`,
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
    environment: string,
    roleName: string,
    operation: 'add' | 'del',
    users: SourceUser[],
  ) {
    if (users.length === 0) {
      console.log(`No users to ${operation}`);
    }
    for (const user of users) {
      const username = `${user.guid.toLowerCase()}@${integrationConfig.idp}`;
      if (
        await this.testIgnoreUser(integrationConfig.idp, environment, user.guid)
      ) {
        console.log(`${operation}: ${username} (skip)`);
        continue;
      }
      console.log(`${operation}: ${username}`);
      if (operation === 'add') {
        await axios.post(
          `/integrations/${integrationConfig.id}/${environment}/users/${username}/roles`,
          [
            {
              name: roleName,
            },
          ],
          this.axiosOptions,
        );
      } else if (operation === 'del') {
        await axios.delete(
          `/integrations/${integrationConfig.id}/${environment}/users/${username}/roles/${roleName}`,
          this.axiosOptions,
        );
      }
    }
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
      // console.log(`use cache: guid`);
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
}
