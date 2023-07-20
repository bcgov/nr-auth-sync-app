import axios, {AxiosRequestConfig} from 'axios';
import {injectable} from 'inversify';
import {IntegrationEnvironmentRoleUsersDto} from './css.types';

const CSS_SSO_API_URL = 'https://api.loginproxy.gov.bc.ca/api/v1';
const EMAIL_IGNORE = new Set(['nrids.tier2@gov.bc.ca', 'nrcda001@gov.bc.ca']);
const ROLE_USER_MAX = 50;
const envUserCache: {
  [key: string]: any
} = {};

@injectable()
/**
 *
 */
export class CssAdminApi {
  private axiosOptions!: AxiosRequestConfig;
  private token!: string;

  public setToken(token: string) {
    this.token = token;
    this.axiosOptions = {
      baseURL: CSS_SSO_API_URL,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };
  }

  /**
   *
   * @param parsedClientRoles
   */
  public async syncRoles(parsedClientRoles: any) {
    const integrations = await this.getIntegrations();

    for (const integration of integrations) {
      if (!parsedClientRoles[integration.projectName]) {
        console.log(`>>> ${integration.projectName} : Skip`);
        continue;
      }
      console.log(`>>> ${integration.projectName} : Sync`);
      for (const environment of integration.environments) {
        await this.syncIntegrationRoles(integration, environment, parsedClientRoles[integration.projectName]);
      }
    }
  }

  private async syncIntegrationRoles(integration: any, environment: any, roles: string[]) {
    const existingRoles = (await axios.get(
      `/integrations/${integration.id}/${environment}/roles`,
      this.axiosOptions,
    )).data.data.map((roleObj: any) => roleObj.name);
    const delRoles = existingRoles.filter((existingRole: string) => roles.indexOf(existingRole) === -1);
    const addRoles = roles.filter((role: string) => existingRoles.indexOf(role) === -1);
    console.log(`Sync: ${integration.projectName} - ${environment}`);

    if (delRoles.length === 0) {
      console.log(`No roles to del`);
    }
    for (const role of delRoles) {
      await axios.delete(
        `/integrations/${integration.id}/${environment}/roles/${role}`,
        this.axiosOptions,
      );
      console.log(`Delete: ${role}`);
    }

    if (addRoles.length === 0) {
      console.log(`No roles to add`);
    }
    for (const role of addRoles) {
      await axios.post(
        `/integrations/${integration.id}/${environment}/roles`,
        {
          name: role,
        },
        this.axiosOptions,
      );
      console.log(`Add: ${role}`);
    }
  }

  /**
   *
   * @param integration
   * @param userRoles
   * @param idp
   */
  public async syncRoleUsers(integrationDto: any, userRoles: any, idp: string) {
    console.log(`>>> ${integrationDto.projectName} : Sync`);
    for (const environment of integrationDto.environments) {
      await this.syncIntegrationRoleUsers(integrationDto, environment, userRoles, idp);
    }
  }

  private async syncIntegrationRoleUsers(integrationDto: any, environment: string, userRoles: any, idp: string) {
    for (const roleName of Object.keys(userRoles)) {
      const roleSet: Set<string> = userRoles[roleName];
      console.log(`${integrationDto.id} ${environment} ${roleName}`);
      const existingUsernames = await this.getRoleUsernameSet(integrationDto.id, environment, idp, roleName);

      const usersToRemove = [...existingUsernames].filter((email) => !roleSet.has(email));
      const usersToAdd = [...roleSet].filter((email) =>
        !existingUsernames.has(email) && email.length > 0 && !EMAIL_IGNORE.has(email));
      await Promise.all([
        this.postIntegrationRoleUserChanges(integrationDto.id, environment, idp, roleName, 'add', usersToAdd),
        this.postIntegrationRoleUserChanges(integrationDto.id, environment, idp, roleName, 'del', usersToRemove),
      ]);
    }
  }

  private async getRoleUsernameSet(integrationId: string, environment: string, idp: string, roleName: string) {
    const usernameSet = new Set<string>();
    for (let page = 1; true; page++) {
      const fetchedUsers = (await axios.get<IntegrationEnvironmentRoleUsersDto>(
        `/integrations/${integrationId}/${environment}/roles/${roleName}/users`, {
          params: {
            page,
            max: ROLE_USER_MAX,
          },
          ...this.axiosOptions,
        })).data.data;
      for (const user of fetchedUsers) {
        if (user.username.endsWith('@' + idp) || user.username.endsWith('@' + idp.replace('-', ''))) {
          usernameSet.add(user.email);
        }
      }
      if (fetchedUsers.length < ROLE_USER_MAX) {
        break;
      }
    }
    return usernameSet;
  }

  private async postIntegrationRoleUserChanges(
    integrationId: string,
    environment: string,
    idp: string,
    roleName: string,
    operation: 'add' | 'del',
    users: string[],
  ) {
    if (users.length === 0) {
      console.log(`No users to ${operation}`);
    }
    for (const email of users) {
      const userData = await this.getEnvUser(environment, idp, email);
      if (userData.data.length === 0) {
        console.log(`skip: ${email} (not found)`);
        continue;
      }
      if (userData.data.length > 1) {
        console.log(`skip: ${email} (not unique)`);
        continue;
      }
      const username = userData.data[0].username;
      console.log(`${operation}: ${username} [${email}]`);
      if (operation === 'add') {
        await axios.post(
          `/integrations/${integrationId}/${environment}/users/${username}/roles`,
          [{
            name: roleName,
          }],
          this.axiosOptions);
      } else if (operation === 'del') {
        await axios.delete(
          `/integrations/${integrationId}/${environment}/users/${username}/roles/${roleName}`,
          this.axiosOptions);
      }
    }
  }

  public async getIntegrations(): Promise<any> {
    return (await axios.get('integrations', this.axiosOptions)).data.data;
  }

  private async getEnvUser(environment: string, idp: string, email: string) {
    const keyStr = `${environment}/${idp}/${email}`;
    if (!envUserCache[keyStr]) {
      const userData = (await axios.get(
        `/${environment}/${idp}/users`, {
          params: {
            email,
          },
          ...this.axiosOptions})).data;
      envUserCache[keyStr] = userData;
    }
    return envUserCache[keyStr];
  }
}
