import axios, {AxiosRequestConfig} from 'axios';
import {injectable} from 'inversify';

const CSS_SSO_API_URL = 'https://api.loginproxy.gov.bc.ca/api/v1';
const EMAIL_IGNORE = new Set(['nrids.tier2@gov.bc.ca', 'nrcda001@gov.bc.ca']);
<<<<<<< HEAD
=======
const ROLE_USER_MAX = 50;
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
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
   * @param userMap
   */
  public async syncRoleUsers(userMap: any) {
    const integrations = await this.getIntegrations();

    for (const integration of integrations) {
      if (!userMap[integration.projectName]) {
        console.log(`>>> ${integration.projectName} : Skip`);
        continue;
      }
      console.log(`>>> ${integration.projectName} : Sync`);
      for (const environment of integration.environments) {
        await this.syncIntegrationRoleUsers(integration, environment, userMap[integration.projectName]);
      }
    }
  }

  private async syncIntegrationRoleUsers(integration: any, environment: any, userRoles: any) {
    for (const roleName of Object.keys(userRoles)) {
      const roleSet: Set<string> = userRoles[roleName];
      console.log(`${integration.id} ${environment} ${roleName}`);
<<<<<<< HEAD
      const existingUsers = (await axios.get(
        `/integrations/${integration.id}/${environment}/user-role-mappings`, {
          params: {
            roleName,
          },
          ...this.axiosOptions})).data.users;
      const existingUsernames = new Set<string>();
      for (const user of existingUsers) {
        existingUsernames.add(user.email);
      }
=======
      const existingUsernames = await this.getRoleUsernameSet(integration.id, environment, roleName);
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d

      const usersToRemove = [...existingUsernames].filter((email) => !roleSet.has(email));
      const usersToAdd = [...roleSet].filter((email) =>
        !existingUsernames.has(email) && email.length > 0 && !EMAIL_IGNORE.has(email));
      await this.postIntegrationRoleUserChanges(integration.id, environment, roleName, 'add', usersToAdd);
      await this.postIntegrationRoleUserChanges(integration.id, environment, roleName, 'del', usersToRemove);
    }
  }

<<<<<<< HEAD
=======
  private async getRoleUsernameSet(integrationId: string, environment: string, roleName: string) {
    const usernameSet = new Set<string>();
    for (let page = 1; true; page++) {
      const fetchedUsers = (await axios.get(
        `/integrations/${integrationId}/${environment}/roles/${roleName}/users`, {
          params: {
            page,
            max: ROLE_USER_MAX,
          },
          ...this.axiosOptions,
        })).data.data;
      for (const user of fetchedUsers) {
        usernameSet.add(user.email);
      }
      if (fetchedUsers.length < ROLE_USER_MAX) {
        break;
      }
    }
    return usernameSet;
  }

>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
  private async postIntegrationRoleUserChanges(
    integrationId: string, environment: string, roleName: string, operation: 'add' | 'del', users: string[],
  ) {
    if (users.length === 0) {
      console.log(`No users to ${operation}`);
    }
    for (const email of users) {
      const userData = await this.getEnvUser(environment, email);
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
<<<<<<< HEAD
      await axios.post(
        `/integrations/${integrationId}/${environment}/user-role-mappings`,
        {
          roleName,
          username,
          operation,
        },
        this.axiosOptions);
=======
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
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
    }
  }

  private async getIntegrations(): Promise<any> {
    return (await axios.get('integrations', this.axiosOptions)).data.data;
  }

  private async getEnvUser(environment: string, email: string) {
    return (await axios.get(
      `/${environment}/idir/users`, {
        params: {
          email,
        },
        ...this.axiosOptions})).data;
  }
}
