import { inject, injectable } from 'inversify';
import { getLogger } from '@oclif/core';

import { IntegrationConfig } from '../types';
import { TYPES } from '../inversify.types';
import { TargetService } from '../services/target.service';
import { roleFromConfig } from '../util/role.util';

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
  public async sync(integrationConfigs: IntegrationConfig[]): Promise<void> {
    const sdate = new Date();
    if (integrationConfigs) {
      for (const integration of integrationConfigs) {
        const roles = integration.roles.map((roleConfig) =>
          roleFromConfig(roleConfig),
        );
        await Promise.all(
          integration.environments.map((environment) =>
            this.syncIntegrationRoles(integration, environment, roles),
          ),
        );
      }
    }
    const edate = new Date();

    this.console.info(`Done - ${edate.getTime() - sdate.getTime()} ms`);
  }

  private async syncIntegrationRoles(
    integration: IntegrationConfig,
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
