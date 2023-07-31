import {inject, injectable} from 'inversify';
import fs from 'fs';
import path from 'path';
import {TYPES} from '../inversify.types';
import {CssAdminApi} from './css-admin.api';
import {BrokerVertexRoleGenerator, IntegrationRoles, RoleConfig} from './css.types';

@injectable()
/**
 * Generate controller
 */
export class GenerateController {
  private readonly integrationRolesTpl: IntegrationRoles[];

  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.IntegrationRolesPath) private readonly integrationRolesPath: string,
    @inject(TYPES.CssAdminApi) private cssAdminApi: CssAdminApi,
  ) {
    this.integrationRolesTpl =
      JSON.parse(fs.readFileSync(path.join(integrationRolesPath, 'integration-roles.tpl.json'), 'utf8'));
  }

  /**
   *
   * @returns
   */
  public async generate(): Promise<void> {
    for (const tmpl of this.integrationRolesTpl) {
      if (!tmpl.roleGenerators) {
        continue;
      }
      for (const gen of tmpl.roleGenerators) {
        if (gen.name === 'broker-vertex') {
          const roleConfigs = await this.generateBrokerVertexRoles(gen);
          tmpl.roles = [...tmpl.roles, ...roleConfigs];
        }
      }
    }
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async generateBrokerVertexRoles(gen: BrokerVertexRoleGenerator): Promise<RoleConfig[]> {
    console.log(gen);
    return [];
  }
}
