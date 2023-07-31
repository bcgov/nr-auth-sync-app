import { inject, injectable, multiInject } from 'inversify';
import fs from 'fs';
import path from 'path';
import { TYPES } from '../inversify.types';
import { CssAdminApi } from './css-admin.api';
import { SourceService } from '../services/source.service';
import {
  IntegrationOutletMap,
  IntegrationRoles,
  OutletMap,
  RoleConfig,
} from './css.types';

@injectable()
/**
 * Css sync controller
 */
export class CssAdminSyncController {
  private readonly integrationRoles: IntegrationRoles[];

  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.IntegrationRolesPath)
    private readonly integrationRolesPath: string,
    @inject(TYPES.CssAdminApi) private cssAdminApi: CssAdminApi,
    @multiInject(TYPES.SourceService) private sourceServices: SourceService[],
  ) {
    const configPath = path.join(
      integrationRolesPath,
      'integration-roles.json',
    );
    if (fs.existsSync(configPath)) {
      this.integrationRoles = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      this.integrationRoles = [];
    }
  }

  /**
   *
   * @returns
   */
  public async roleSync(): Promise<void> {
    const parsedIntegrationRoles: any = {};
    for (const integration of this.integrationRoles) {
      const parsedRoles: string[] =
        parsedIntegrationRoles[integration.name] ?? [];
      const roleConfigs = integration.roles;
      for (const roleConfig of roleConfigs) {
        parsedRoles.push(this.roleFromConfig(roleConfig));
      }
      parsedIntegrationRoles[integration.name] = parsedRoles;
    }
    return this.cssAdminApi.syncRoles(parsedIntegrationRoles);
  }

  public async memberSync() {
    const userMap: IntegrationOutletMap = {};
    for (const integration of this.integrationRoles) {
      console.log(`>>> ${integration.name} : Get users`);
      userMap[integration.name] = await this.integrationMemberSync(
        integration.roles,
      );
    }
    const integrationDtos = await this.cssAdminApi.getIntegrations();
    for (const integrationDto of integrationDtos) {
      if (!userMap[integrationDto.projectName]) {
        console.log(`>>> ${integrationDto.projectName} : Skip`);
        continue;
      }
      const integrations = this.integrationRoles.filter((role) => {
        return role.name === integrationDto.projectName;
      });
      for (const integration of integrations) {
        const idp = integration.idp ?? 'idir';
        return this.cssAdminApi.syncRoleUsers(
          integrationDto,
          userMap[integrationDto.projectName],
          idp,
        );
      }
    }
  }

  private async integrationMemberSync(roleConfigs: any) {
    const outletMap: OutletMap = {};
    const roleConfigNames = roleConfigs.map((roleConfig: any) =>
      this.roleFromConfig(roleConfig),
    );

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
      },
    );

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
      },
    );
    return outletMap;
  }

  private manipulateUsersInOutlet(
    roleConfigs: RoleConfig[],
    roleConfigNames: string[],
    outletMap: OutletMap,
    key: string,
    callback: any,
  ) {
    for (const roleConfig of roleConfigs) {
      if (!(roleConfig as any).members?.[key]) {
        continue;
      }
      const targetVal: any = (roleConfig as any).members[key];
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

      for (const target of targetArr.values()) {
        if (!outletMap[target]) {
          continue;
        }
        callback(this.roleFromConfig(roleConfig), outletMap, outletMap[target]);
      }
    }
  }

  private async addUserToRoleWithServices(
    roleConfigs: RoleConfig[],
    outletMap: OutletMap,
  ) {
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
      const users = await sourceService.getUsers(roleConfig.members);
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
