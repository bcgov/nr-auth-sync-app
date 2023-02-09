import {inject, injectable, multiInject} from 'inversify';
import fs from 'fs';
import path from 'path';
import {TYPES} from '../inversify.types';
import {CssAdminApi} from './css-admin.api';
import {SourceService} from '../services/source.service';

interface OutletMap {
  [key: string]: Set<string>;
}

interface IntegrationOutletMap {
  [key: string]: OutletMap;
}

interface IntegrationRoles {
  [key: string]: IntegrationConfig;
}

interface RoleMemberConfig {
  copy?: string[];
  exclude?: string[];
  jira?: {
    project: string;
    groups: string[];
  }
  static?: string[];
  [key: string]: unknown;
}

interface RoleConfig {
  group: string;
  name: string;
  members: RoleMemberConfig;
}

interface IntegrationConfig {
  roles: RoleConfig[]
}

@injectable()
/**
 * Css sync controller
 */
export class CssAdminSyncController {
  private readonly integrationRoles: IntegrationRoles;

  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.IntegrationRolesPath) private readonly integrationRolesPath: string,
    @inject(TYPES.CssAdminApi) private cssAdminApi: CssAdminApi,
    @multiInject(TYPES.SourceService) private sourceServices: SourceService[],
  ) {
    this.integrationRoles =
      JSON.parse(fs.readFileSync(path.join(integrationRolesPath, 'integration-roles.json'), 'utf8'));
  }

  /**
   *
   * @returns
   */
  public async roleSync(): Promise<void> {
    const parsedIntegrationRoles: any = {};
    for (const integrationName of Object.keys(this.integrationRoles)) {
      const parsedRoles: string[] = [];
      const roleConfigs = this.integrationRoles[integrationName].roles;
      for (const roleConfig of roleConfigs) {
        parsedRoles.push(this.roleFromConfig(roleConfig));
      }
      parsedIntegrationRoles[integrationName] = parsedRoles;
    }
    return this.cssAdminApi.syncRoles(parsedIntegrationRoles);
  }

  public async memberSync() {
    const userMap: IntegrationOutletMap = {};
    for (const integrationName of Object.keys(this.integrationRoles)) {
      console.log(`>>> ${integrationName} : Get users`);
      userMap[integrationName] = await this.integrationMemberSync(this.integrationRoles[integrationName].roles);
    }
    return this.cssAdminApi.syncRoleUsers(userMap);
  }

  private async integrationMemberSync(roleConfigs: any) {
    const outletMap: OutletMap = {};
    const roleConfigNames = roleConfigs.map((roleConfig: any) => this.roleFromConfig(roleConfig));

    await this.addUserToRoleWithServices(roleConfigs, outletMap);
    // Copy members from other roles (does not recursively copy)
    this.manipulateUsersInOutlet(
      roleConfigs,
      roleConfigNames,
      outletMap,
      'copy',
      (role: string, outletMap: OutletMap, targetSet: Set<string>) => {
        if (!outletMap[role]) {
          outletMap[role] = new Set<string>();
        }
        for (const user of targetSet.values()) {
          outletMap[role].add(user);
        }
      });

    // Exclude members if in other roles -- useful if being in both is a problem
    this.manipulateUsersInOutlet(
      roleConfigs,
      roleConfigNames,
      outletMap,
      'exclude',
      (role: string, outletMap: OutletMap, targetSet: Set<string>) => {
        if (!outletMap[role]) {
          return;
        }
        for (const user of targetSet.values()) {
          outletMap[role].delete(user);
        }
      });
    return outletMap;
  }

  private manipulateUsersInOutlet(
    roleConfigs: RoleConfig[], roleConfigNames: string[], outletMap: OutletMap, key: string, callback: any) {
    for (const roleConfig of roleConfigs) {
      if (!roleConfig.members?.[key]) {
        continue;
      }
      const targetVal: any = roleConfig.members[key];
      const targetArr = new Set<string>();

      for (const target of targetVal) {
        if (target.startsWith('/') && target.endsWith('/')) {
          const re = new RegExp(target.slice(1, -1));
          roleConfigNames
            .filter((roleName: string) => re.test(roleName))
            .forEach((roleName: string) => targetArr.add(roleName));
        } else {
          targetArr.add(target);
        }
      }
      console.log(targetArr);

      for (const target of targetArr.values()) {
        if (!outletMap[target]) {
          continue;
        }
        callback(this.roleFromConfig(roleConfig), outletMap, outletMap[target]);
      }
    }
  }

  private async addUserToRoleWithServices(roleConfigs: RoleConfig[], outletMap: OutletMap) {
    for (const roleConfig of roleConfigs) {
      const role = this.roleFromConfig(roleConfig);
      const users = await this.getUserSetFromServices(roleConfig);
      if (users.size > 0) {
        outletMap[role] = users;
      }
    }
    return outletMap;
  }

  private async getUserSetFromServices(roleConfig: RoleConfig) {
    const userSet = new Set<string>();
    for (const sourceService of this.sourceServices) {
      const users = await sourceService.getUsers(roleConfig);
      users.forEach((user) => userSet.add(user));
    }
    return userSet;
  }

  private roleFromConfig(roleConfig: RoleConfig) {
    if (roleConfig.group) {
      return `${roleConfig.group}_${roleConfig.name}`;
    } else {
      return roleConfig.name;
    }
  }
}
