import { inject, injectable } from 'inversify';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { TYPES } from '../inversify.types';
import {
  BrokerVertexRoleGenerator,
  IntegrationRoles,
  RoleConfig,
} from '../css/css.types';
import { BrokerApi } from './broker.api';
import { VertexSearchDto } from './dto/vertex-rest.dto';
import {
  isBrokerRoleMemberConfig,
  isStaticRoleMemberConfig,
} from '../util/config.util';

@injectable()
/**
 * Generate controller
 */
export class GenerateController {
  private readonly integrationRolesTpl: IntegrationRoles[] | null;

  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.IntegrationRolesPath)
    private readonly integrationRolesPath: string,
    @inject(TYPES.BrokerApi) private brokerApi: BrokerApi,
  ) {
    const configPath = path.join(
      integrationRolesPath,
      'integration-roles.tpl.json',
    );

    if (fs.existsSync(configPath)) {
      this.integrationRolesTpl = JSON.parse(
        fs.readFileSync(configPath, 'utf8'),
      );
    } else {
      this.integrationRolesTpl = null;
    }
  }

  /**
   *
   * @returns
   */
  public async generate(): Promise<void> {
    if (!this.integrationRolesTpl) {
      console.log('Skipping: No template');
      return;
    }
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
    fs.writeFileSync(
      path.join(this.integrationRolesPath, 'integration-roles.json'),
      JSON.stringify(this.integrationRolesTpl, null, 2),
    );
    return Promise.resolve();
  }

  async generateBrokerVertexRoles(
    gen: BrokerVertexRoleGenerator,
  ): Promise<RoleConfig[]> {
    const roleConfig = gen.roleMap.members;
    if (!isBrokerRoleMemberConfig(roleConfig)) {
      return [];
    }
    const vertices: VertexSearchDto[] = (
      await this.brokerApi.searchVertices(
        gen.collection,
        gen.edge?.name,
        gen.edge?.target,
      )
    ).filter((vertex) => {
      if (!gen.edge?.property) {
        return true;
      }
      return (
        vertex.edge.prop !== undefined &&
        vertex.edge.prop[gen.edge.property] !== undefined
      );
    });
    return vertices.map((vertex) => {
      let staticMembers = {};
      if (isStaticRoleMemberConfig(roleConfig)) {
        staticMembers = {
          static: roleConfig.static,
        };
      }

      return {
        name: ejs.render(gen.roleMap.name, { vertex }),
        members: {
          broker: ejs.render(roleConfig.broker, { vertex }),
          copy: gen.roleMap.members.copy ? gen.roleMap.members.copy : [],
          exclude: gen.roleMap.members.exclude
            ? gen.roleMap.members.exclude
            : [],
          ...staticMembers,
        },
      };
    });
  }
}
