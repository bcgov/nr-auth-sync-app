import { inject, injectable, multiInject } from 'inversify';

import { TYPES } from '../inversify.types';
import { SourceService, SourceUser } from '../services/source.service';
import { IntegrationConfig, RoleConfig } from '../types';
import { TargetService } from '../services/target.service';

type OutletMap = Map<string, Map<string, SourceUser>>;

@injectable()
/**
 * Css sync controller
 */
export class AuthMemberSyncController {
  /**
   * Constructor
   */
  constructor(
    @multiInject(TYPES.SourceService) private sourceServices: SourceService[],
    @inject(TYPES.TargetService) private targetService: TargetService,
  ) {}

  public async sync(integrationConfigs: IntegrationConfig[]) {
    const userMap: { [key in string]: OutletMap } = {};
    for (const integrationConfig of integrationConfigs) {
      const idp = integrationConfig.idp ?? 'idir';
      console.log(`>>> ${integrationConfig.name} : Get users`);
      userMap[integrationConfig.name] = await this.integrationMemberSync(
        idp,
        integrationConfig.roles,
      );

      // console.log(userMap);

      // const idp = integrationConfig.idp ?? 'idir';
      for (const environment of integrationConfig.environments) {
        await this.syncIntegrationRoleUsers(
          integrationConfig,
          environment,
          userMap[integrationConfig.name],
          idp,
        );
      }
    }
  }

  private async syncIntegrationRoleUsers(
    integrationConfig: IntegrationConfig,
    environment: string,
    userRoles: OutletMap,
    idp: string,
  ) {
    for (const [roleName, roleUserGuidMap] of userRoles.entries()) {
      console.log(`${integrationConfig.id} ${environment} ${roleName}`);
      const existingUserGuidMap = await this.targetService.getRoleUsers(
        integrationConfig.id,
        environment,
        idp,
        roleName,
      );

      const usersToRemove = [...existingUserGuidMap.keys()]
        .filter((guid) => !roleUserGuidMap.has(guid))
        .map((guid) => existingUserGuidMap.get(guid))
        .filter((user) => !!user);
      const usersToAdd = [...roleUserGuidMap.keys()]
        .filter((guid) => !existingUserGuidMap.has(guid))
        .map((guid) => roleUserGuidMap.get(guid))
        .filter((user) => !!user);
      // console.log(`remove:`);
      // console.log(usersToRemove);
      // console.log(`add:`);
      // console.log(usersToAdd);
      await Promise.all([
        this.targetService.alterIntegrationRoleUser(
          integrationConfig.id,
          environment,
          roleName,
          'add',
          usersToAdd,
        ),
        this.targetService.alterIntegrationRoleUser(
          integrationConfig.id,
          environment,
          roleName,
          'del',
          usersToRemove,
        ),
      ]);
    }
  }

  private async integrationMemberSync(idp: string, roleConfigs: RoleConfig[]) {
    const roleConfigNames = roleConfigs.map((roleConfig) =>
      this.roleFromConfig(roleConfig),
    );

    const outletMap = await this.addUserToRoleWithServices(roleConfigs);
    // Copy members from other roles (does not recursively copy)
    this.manipulateUsersInOutlet(
      roleConfigs,
      roleConfigNames,
      outletMap,
      'copy',
      (
        role: string,
        outletMap: OutletMap,
        targetSet: Map<string, SourceUser>,
      ) => {
        if (!outletMap.has(role)) {
          outletMap.set(role, new Map<string, SourceUser>());
        }
        for (const user of targetSet.entries()) {
          outletMap.get(role)?.set(...user);
        }
      },
    );

    // Exclude members if in other roles -- useful if being in both is a problem
    this.manipulateUsersInOutlet(
      roleConfigs,
      roleConfigNames,
      outletMap,
      'exclude',
      (
        role: string,
        outletMap: OutletMap,
        targetSet: Map<string, SourceUser>,
      ) => {
        if (!outletMap.has(role)) {
          return;
        }
        for (const user of targetSet.keys()) {
          outletMap.get(role)?.delete(user);
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
        if (!outletMap.has(target)) {
          continue;
        }
        callback(
          this.roleFromConfig(roleConfig),
          outletMap,
          outletMap.get(target),
        );
      }
    }
  }

  private async addUserToRoleWithServices(roleConfigs: RoleConfig[]) {
    const outletMap = new Map<string, Map<string, SourceUser>>();
    for (const roleConfig of roleConfigs) {
      const role = this.roleFromConfig(roleConfig);
      const users = await this.getUserMapFromServices(roleConfig);
      if (users.size > 0) {
        outletMap.set(role, users);
      }
    }
    return outletMap;
  }

  private async getUserMapFromServices(roleConfig: RoleConfig) {
    const userMap = new Map<string, SourceUser>();
    for (const sourceService of this.sourceServices) {
      const users = await sourceService.getUsers(roleConfig.members);
      users.forEach((user) => userMap.set(user.guid, user));
    }
    return userMap;
  }

  private roleFromConfig(roleConfig: RoleConfig) {
    if (roleConfig.group) {
      return `${roleConfig.group}_${roleConfig.name}`;
    } else {
      return roleConfig.name;
    }
  }
}
