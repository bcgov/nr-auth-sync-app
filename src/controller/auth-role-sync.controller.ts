import { inject, injectable } from 'inversify';
import { getLogger } from '@oclif/core';

import { IntegrationConfig } from '../types.js';
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
      const roles = config.roles.map((roleConfig) =>
        roleFromConfig(roleConfig),
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
    roles: string[],
  ) {
    const sdate = new Date();
    const existingRoles =
      await this.targetService.getIntegrationEnvironmentRoles(
        integration.id,
        environment,
      );
    const delRoles = existingRoles.filter(
      (existingRole: string) => roles.indexOf(existingRole) === -1,
    );
    const addRoles = roles.filter(
      (role: string) => existingRoles.indexOf(role) === -1,
    );

    if (delRoles.length === 0) {
      this.console.debug(
        `Sync: ${integration.name} - ${environment}: No roles to del`,
      );
    }
    for (const role of delRoles) {
      await this.targetService.deleteIntegrationEnvironmentRole(
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
