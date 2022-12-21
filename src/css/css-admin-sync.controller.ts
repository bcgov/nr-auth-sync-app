import {inject, injectable, multiInject} from 'inversify';
import path from 'path';
import fs from 'fs';
import {TYPES} from '../inversify.types';
import {CssAdminApi} from './css-admin.api';
import {SourceService} from '../services/source.service';

@injectable()
/**
 * Css sync controller
 */
export class CssAdminSyncController {
  private static readonly integrationRolesPath
  = path.join(__dirname, '../../config', 'integration-roles.json');
  private static readonly integrationRoles
    = JSON.parse(fs.readFileSync(CssAdminSyncController.integrationRolesPath, 'utf8'));

  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.CssAdminApi) private cssAdminApi: CssAdminApi,
    @multiInject(TYPES.SourceService) private sourceServices: SourceService[],
  ) {}

  /**
   *
   * @returns
   */
  public async roleSync(): Promise<void> {
    const parsedIntegrationRoles: any = {};
    for (const integrationName of Object.keys(CssAdminSyncController.integrationRoles)) {
      const parsedRoles: string[] = [];
      const roleConfigs = CssAdminSyncController.integrationRoles[integrationName].roles;
      for (const roleConfig of roleConfigs) {
        parsedRoles.push(this.roleFromConfig(roleConfig));
      }
      parsedIntegrationRoles[integrationName] = parsedRoles;
    }
    return this.cssAdminApi.syncRoles(parsedIntegrationRoles);
  }

  public async memberSync() {
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
    }
    return this.cssAdminApi.syncRoleUsers(userMap);
  }

  private roleFromConfig(roleConfig: any) {
    if (roleConfig.group) {
      return `${roleConfig.group}_${roleConfig.name}`;
    } else {
      return roleConfig.name;
    }
  }
}
