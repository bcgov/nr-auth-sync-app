import { inject, injectable } from 'inversify';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getLogger } from '@oclif/core';

import { TYPES } from '../inversify.types';
import { BrokerApi } from '../broker/broker.api';
import { VertexSearchDto } from '../broker/dto/vertex-rest.dto';
import {
  isBrokerRoleMemberConfig,
  isStaticRoleMemberConfig,
} from '../util/config.util';
import { TargetService } from '../services/target.service';
import {
  BrokerVertexRoleGenerator,
  IntegrationConfig,
  IntegrationConfigTemplate,
  RoleConfig,
} from '../types';

@injectable()
/**
 * Generate controller
 */
export class GenerateController {
  private readonly console = getLogger('GenerateController');
  private readonly integrationTplArr: IntegrationConfigTemplate[] | null = null;

  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.IntegrationRolesPath)
    private readonly integrationRolesPath: string,
    @inject(TYPES.BrokerApi) private readonly brokerApi: BrokerApi,
    @inject(TYPES.TargetService) private targetService: TargetService,
  ) {
    const configPath = path.join(
      integrationRolesPath,
      'integration-roles.tpl.json',
    );

    if (fs.existsSync(configPath)) {
      this.integrationTplArr = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      this.integrationTplArr = null;
    }
  }

  /**
   *
   * @returns
   */
  public async generate(): Promise<IntegrationConfig[] | null> {
    const rval: IntegrationConfig[] = [];
    if (!this.integrationTplArr) {
      this.console.info('Skipping: No template');
      return null;
    }
    this.console.info(`Generate integration file`);
    const sdate = new Date();
    const integrations = await this.targetService.getIntegrations();

    for (const integrationTpl of this.integrationTplArr) {
      const integration = integrations.find(
        (i) => i.name === integrationTpl.name,
      );
      if (!integration) {
        this.console.info(`Skip: ${integrationTpl.name} (not found)`);
        continue;
      }

      rval.push({
        name: integrationTpl.name,
        idp: integrationTpl.idp,
        id: integration.id,
        environments: integration.environments,
        notifyEnvironments: integrationTpl.notifyEnvironments,
        roles: await this.generateRoles(integrationTpl),
      });
    }
    fs.writeFileSync(
      path.join(this.integrationRolesPath, 'integration-roles.json'),
      JSON.stringify(rval, null, 2),
    );

    const edate = new Date();

    this.console.info(`Done - ${edate.getTime() - sdate.getTime()} ms`);
    return rval;
  }

  private async generateRoles(
    integrationTpl: IntegrationConfigTemplate,
  ): Promise<RoleConfig[]> {
    let roleConfigs = integrationTpl.roles ?? [];
    if (integrationTpl.roleGenerators) {
      for (const gen of integrationTpl.roleGenerators) {
        if (gen.name === 'broker-vertex') {
          const genRoleConfigs = await this.generateBrokerVertexRoles(gen);
          roleConfigs = [...roleConfigs, ...genRoleConfigs];
        }
      }
    }
    return roleConfigs;
  }

  private async generateBrokerVertexRoles(
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
    const nameRender = ejs.compile(gen.roleMap.name);
    const brokerRender = ejs.compile(roleConfig.broker);

    return vertices.map((vertex) => {
      let staticMembers = {};
      if (isStaticRoleMemberConfig(roleConfig)) {
        staticMembers = {
          static: roleConfig.static,
        };
      }

      return {
        name: nameRender({ vertex }),
        members: {
          broker: brokerRender({ vertex }),
          copy: gen.roleMap.members.copy ? gen.roleMap.members.copy : [],
          exclude: gen.roleMap.members.exclude
            ? gen.roleMap.members.exclude
            : [],
          ...staticMembers,
        },
        ...(gen.roleMap.onAdd
          ? {
              onAdd: {
                environments: gen.roleMap.onAdd.environments,
                templateText: ejs.render(gen.roleMap.onAdd.templateText, {
                  vertex,
                }),
                templateHtml: ejs.render(gen.roleMap.onAdd.templateHtml, {
                  vertex,
                }),
              },
            }
          : {}),
        ...(gen.roleMap.onRemove
          ? {
              onRemove: {
                environments: gen.roleMap.onRemove.environments,
                templateText: ejs.render(gen.roleMap.onRemove.templateText, {
                  vertex,
                }),
                templateHtml: ejs.render(gen.roleMap.onRemove.templateHtml, {
                  vertex,
                }),
              },
            }
          : {}),
      };
    });
  }
}
