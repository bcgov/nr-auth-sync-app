import {inject, injectable, multiInject} from 'inversify';
<<<<<<< HEAD
import path from 'path';
import fs from 'fs';
=======
import fs from 'fs';
import path from 'path';
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
import {TYPES} from '../inversify.types';
import {CssAdminApi} from './css-admin.api';
import {SourceService} from '../services/source.service';

<<<<<<< HEAD
=======
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

>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
@injectable()
/**
 * Css sync controller
 */
export class CssAdminSyncController {
<<<<<<< HEAD
  private static readonly integrationRolesPath
  = path.join(__dirname, '../../config', 'integration-roles.json');
  private static readonly integrationRoles
    = JSON.parse(fs.readFileSync(CssAdminSyncController.integrationRolesPath, 'utf8'));
=======
  private readonly integrationRoles: IntegrationRoles;
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d

  /**
   * Constructor
   */
  constructor(
<<<<<<< HEAD
    @inject(TYPES.CssAdminApi) private cssAdminApi: CssAdminApi,
    @multiInject(TYPES.SourceService) private sourceServices: SourceService[],
  ) {}
=======
    @inject(TYPES.IntegrationRolesPath) private readonly integrationRolesPath: string,
    @inject(TYPES.CssAdminApi) private cssAdminApi: CssAdminApi,
    @multiInject(TYPES.SourceService) private sourceServices: SourceService[],
  ) {
    this.integrationRoles =
      JSON.parse(fs.readFileSync(path.join(integrationRolesPath, 'integration-roles.json'), 'utf8'));
  }
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d

  /**
   *
   * @returns
   */
  public async roleSync(): Promise<void> {
    const parsedIntegrationRoles: any = {};
<<<<<<< HEAD
    for (const integrationName of Object.keys(CssAdminSyncController.integrationRoles)) {
      const parsedRoles: string[] = [];
      const roleConfigs = CssAdminSyncController.integrationRoles[integrationName].roles;
=======
    for (const integrationName of Object.keys(this.integrationRoles)) {
      const parsedRoles: string[] = [];
      const roleConfigs = this.integrationRoles[integrationName].roles;
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
      for (const roleConfig of roleConfigs) {
        parsedRoles.push(this.roleFromConfig(roleConfig));
      }
      parsedIntegrationRoles[integrationName] = parsedRoles;
    }
    return this.cssAdminApi.syncRoles(parsedIntegrationRoles);
  }

  public async memberSync() {
<<<<<<< HEAD
    const userMap: any = {};
    for (const integrationName of Object.keys(CssAdminSyncController.integrationRoles)) {
      userMap[integrationName] = {};
      const roleConfigs = CssAdminSyncController.integrationRoles[integrationName].roles;
      for (const roleConfig of roleConfigs) {
        const role = this.roleFromConfig(roleConfig);
        for (const sourceService of this.sourceServices) {
          const users = await sourceService.getUsers(roleConfig);
          const outletMap = userMap[integrationName];
          if (users.length === 0) {
            continue;
          }

          if (!outletMap[role]) {
            outletMap[role] = new Set();
          }
          users.forEach(outletMap[role].add, outletMap[role]);
        }
      }
=======
    const userMap: IntegrationOutletMap = {};
    for (const integrationName of Object.keys(this.integrationRoles)) {
      console.log(`>>> ${integrationName} : Get users`);
      userMap[integrationName] = await this.integrationMemberSync(this.integrationRoles[integrationName].roles);
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
    }
    return this.cssAdminApi.syncRoleUsers(userMap);
  }

<<<<<<< HEAD
  private roleFromConfig(roleConfig: any) {
=======
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
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
    if (roleConfig.group) {
      return `${roleConfig.group}_${roleConfig.name}`;
    } else {
      return roleConfig.name;
    }
  }
}
