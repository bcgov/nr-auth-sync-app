import { inject, injectable } from 'inversify';
import { getLogger } from '@oclif/core';

import { IntegrationConfig, RoleSpec } from '../types.js';
import { TYPES } from '../inversify.types.js';
import { Integration, TargetService } from '../services/target.service.js';
import { roleFromConfig } from '../util/role.util.js';

@injectable()
/**
 * Auth role sync controller
 */
export class AuthRoleSyncController {
  private readonly console = getLogger('AuthRoleSyncController');
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.TargetService) private targetService: TargetService,
  ) {}

  /**
   *
   * @returns
   */
  public async sync(config: IntegrationConfig): Promise<void> {
    const sdate = new Date();
    if (config) {
      const roles = config.roles.map<RoleSpec>(
        (roleConfig) =>
          new RoleSpec(
            roleFromConfig(roleConfig),
            roleConfig.parentName,
            roleConfig.description,
          ),
      );
      const integration = await this.targetService.getIntegration(config);

      if (integration) {
        await Promise.all(
          integration.environments.map((environment) =>
            this.syncIntegrationRoles(config, integration, environment, roles),
          ),
        );
      }
    }
    const edate = new Date();

    this.console.info(`Done - ${edate.getTime() - sdate.getTime()} ms`);
  }

  private async syncIntegrationRoles(
    config: IntegrationConfig,
    integration: Integration,
    environment: string,
    roles: RoleSpec[],
  ) {
    const sdate = new Date();
    // const roleNames = roles.map((spec) => spec.name);
    const existingRoles =
      await this.targetService.getIntegrationEnvironmentRoles(
        config,
        integration.id,
        environment,
      );
    const delRoles = existingRoles.filter(
      (existingRole) =>
        roles.findIndex((role) => role.name === existingRole.name) === -1,
    );
    const addRoles = roles.filter(
      (role) =>
        existingRoles.findIndex(
          (existingRole) => existingRole.name === role.name,
        ) === -1,
    );
    // console.log(addRoles);
    // console.log(delRoles);

    if (delRoles.length === 0) {
      this.console.debug(
        `Sync: ${integration.name} - ${environment}: No roles to del`,
      );
    }
    for (const role of delRoles) {
      await this.targetService.deleteIntegrationEnvironmentRole(
        config,
        integration.id,
        environment,
        role,
      );
      this.console.debug(
        `Sync: ${integration.name} - ${environment}: Delete: ${role}`,
      );
    }

    if (addRoles.length === 0) {
      this.console.debug(
        `Sync: ${integration.name} - ${environment}: No roles to add`,
      );
    }
    for (const role of addRoles) {
      await this.targetService.addIntegrationEnvironmentRole(
        config,
        integration.id,
        environment,
        role,
      );
      this.console.debug(
        `Sync: ${integration.name} - ${environment}: Add: ${role}`,
      );
    }
    const edate = new Date();
    this.console.info(
      `Sync: ${integration.name} - ${environment}: ${edate.getTime() - sdate.getTime()} ms`,
    );
  }
}
