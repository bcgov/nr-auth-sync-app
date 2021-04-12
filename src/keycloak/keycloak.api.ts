import {inject, injectable} from 'inversify';
import {TYPES} from '../inversify.types';
import winston from 'winston';
import KeycloakAdminClient from 'keycloak-admin';

@injectable()
/**
 * Keycloak Api
 */
export class KeycloakApi {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.KeycloakAdminClient) private keycloak: KeycloakAdminClient,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * Get the client by name if it exists.
   * @param name
   */
  public async getClientByName(name: string) {
    return (await this.keycloak.clients.find())
      .find((client) => client.clientId === name);
  }

  /**
   * Get user id by name
   * @param username
   */
  public async getUser(username: string) {
    // build UserQuery (required for API)
    const userQuery = {
      username: `${username}@idir`,
    };

    return (await this.keycloak.users.find(userQuery))[0];
  }

  /**
   * Get group by name
   * @param name
   */
  public async getGroupByName(name: string) {
    return (await this.keycloak.groups.find())
      .find((group) => group.name === name);
  }

  /**
   * Get subgroup by name
   * @param name
   * @param subName
   */
  public async getSubgroupByName(name: string, subName: string) {
    const group = await this.getGroupByName(name);
    if (!group || !group.subGroups) {
      return undefined;
    }
    return group.subGroups.find((element) => element.name === subName);
  }

  /**
   * Make or return existing groups
   * @param name The name of the root group
   * @param subName The optional name of the subgroup
   * @returns
   */
  public async makeGroups(name: string, subName: string | undefined = undefined) {
    if (!name) {
      throw new Error('Name cannot be empty');
    }

    // add group
    let projectGroup = await this.getGroupByName(name);
    if (!projectGroup) {
      projectGroup = await this.keycloak.groups.create({name});
    }

    if (!subName || projectGroup === undefined) {
      return projectGroup;
    }

    if (projectGroup.id === undefined) {
      throw new Error('ProjectGroup id cannot be undefined');
    }

    // add new sub group
    let devGroupNew = await this.getSubgroupByName(name, subName);
    if (!devGroupNew) {
      devGroupNew = await this.keycloak.groups.setOrCreateChild(
        {id: projectGroup.id},
        {name: subName},
      );
    }

    return devGroupNew;
  }

  /**
   * Sync group users
   * @param groupId
   * @param users
   */
  public async syncGroupUsers(groupId: string, users: string[]) {
    const members = await this.keycloak.groups.listMembers({id: groupId});

    // delete existing keycloak group members
    for (const member of members) {
      if (member.id) {
        await this.keycloak.users.delFromGroup({id: member.id, groupId});
      }
    }

    // add current devs
    for (const user of users) {
      try {
        const kcUser = await this.getUser(user);
        if (kcUser && kcUser.id) {
          await this.keycloak.users.addToGroup({id: kcUser.id, groupId});
        } else {
          this.logger.debug(`Unknown user: ${user} (skipped)`);
        }
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  /**
   * Sync client roles and the groups with them
   * @param groupId
   * @param clientName
   * @param roles
   */
  public async syncGroupClientRoles(groupId: string, clientName: string, roles: string[]) {
    const client = await this.getClientByName(clientName);
    if (!client || !client.id) {
      throw new Error('Client not found!');
    }

    for (const roleName of roles) {
      // add client role for dev group
      let kcRole = await this.keycloak.clients.findRole({
        id: client.id,
        roleName,
      });
      if (!kcRole) {
        await this.keycloak.clients.createRole({id: client.id, name: roleName});
        kcRole = await this.keycloak.clients.findRole({
          id: client.id,
          roleName,
        });
      }

      if (!kcRole.id || !kcRole.name) {
        return;
      }

      // map client role to group
      await this.keycloak.groups.addClientRoleMappings({
        id: groupId,
        clientUniqueId: client.id,
        roles: [
          {
            id: kcRole.id,
            name: kcRole.name,
          },
        ],
      });
    }
  }
}
