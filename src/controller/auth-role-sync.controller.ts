import { inject, injectable } from 'inversify';

import { IntegrationConfig, RoleConfig } from '../types';
import { TYPES } from '../inversify.types';
import { TargetService } from '../services/target.service';

@injectable()
/**
 * Auth role sync controller
 */
export class AuthRoleSyncController {
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
          this.roleFromConfig(roleConfig),
        );
        await Promise.all(
          integration.environments.map((environment) =>
            this.syncIntegrationRoles(integration, environment, roles),
          ),
        );
      }
    }
    const edate = new Date();

    console.log(`Done - ${edate.getTime() - sdate.getTime()} ms`);
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
      console.log(
        `Sync: ${integration.name} - ${environment}: No roles to del`,
      );
    }
    for (const role of delRoles) {
      await this.targetService.deleteIntegrationEnvironmentRole(
        integration.id,
        environment,
        role,
      );
      console.log(
        `Sync: ${integration.name} - ${environment}: Delete: ${role}`,
      );
    }

    if (addRoles.length === 0) {
      console.log(
        `Sync: ${integration.name} - ${environment}: No roles to add`,
      );
    }
    for (const role of addRoles) {
      await this.targetService.addIntegrationEnvironmentRole(
        integration.id,
        environment,
        role,
      );
      console.log(`Sync: ${integration.name} - ${environment}: Add: ${role}`);
    }
    const edate = new Date();
    console.log(
      `Sync: ${integration.name} - ${environment}: ${edate.getTime() - sdate.getTime()} ms`,
    );
  }

  private roleFromConfig(roleConfig: RoleConfig) {
    if (roleConfig.group) {
      return `${roleConfig.group}_${roleConfig.name}`;
    } else {
      return roleConfig.name;
    }
  }
}
