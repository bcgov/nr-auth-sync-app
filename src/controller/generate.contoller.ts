import { inject, injectable, multiInject } from 'inversify';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getLogger } from '@oclif/core';

import { TYPES } from '../inversify.types.js';
import { BrokerApi } from '../broker/broker.api.js';
import { VertexSearchDto } from '../broker/dto/vertex-rest.dto.js';
import {
  isBrokerRoleMemberConfig,
  isStaticRoleMemberConfig,
} from '../util/config.util.js';
import { TargetService } from '../services/target.service.js';
import {
  BrokerVertexRoleGenerator,
  IntegrationConfig,
  IntegrationConfigTemplate,
  RoleConfig,
} from '../types.js';
import { plainToInstance } from 'class-transformer';

function nameToGitHubSlug(name: string) {
  return name
    .toLowerCase() // Convert to lowercase
    .trim() // Trim whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
}

@injectable()
/**
 * Generate controller
 */
export class GenerateController {
  private readonly console = getLogger('GenerateController');
  private readonly integrationTpl: IntegrationConfigTemplate | null = null;

  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.IntegrationRolesPath)
    private readonly integrationRolesPath: string,
    @inject(TYPES.BrokerApi) private readonly brokerApi: BrokerApi,
    @multiInject(TYPES.TargetService) private targetServices: TargetService[],
  ) {
    const configPath = path.join(
      integrationRolesPath,
      'integration-roles.tpl.json',
    );

    if (fs.existsSync(configPath)) {
      this.integrationTpl = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      this.integrationTpl = null;
    }
  }

  /**
   *
   * @returns
   */
  public async generate(): Promise<IntegrationConfig | null> {
    if (!this.integrationTpl) {
      this.console.info('Skipping: No template');
      return null;
    }
    this.console.info(`Generate integration file`);
    const sdate = new Date();

    const rval = {
      notifyEnvironments: this.integrationTpl.notifyEnvironments,
      roles: await this.generateRoles(this.integrationTpl),
      target: this.integrationTpl.target,
    };
    fs.writeFileSync(
      path.join(this.integrationRolesPath, 'integration-roles.json'),
      JSON.stringify(rval, null, 2),
    );

    const edate = new Date();

    this.console.info(`Done - ${edate.getTime() - sdate.getTime()} ms`);
    return plainToInstance(IntegrationConfig, rval);
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
    const brokerRender = ejs.compile(roleConfig.broker as string);
    const parentNameRender = gen.roleMap.parentName
      ? ejs.compile(gen.roleMap.parentName)
      : undefined;

    return vertices.map((vertex) => {
      let staticMembers = {};
      if (isStaticRoleMemberConfig(roleConfig)) {
        staticMembers = {
          static: roleConfig.static,
        };
      }

      return {
        ...(parentNameRender
          ? { parentName: parentNameRender({ vertex, nameToGitHubSlug }) }
          : {}),
        name: nameRender({ vertex, nameToGitHubSlug }),
        members: {
          broker: brokerRender({ vertex }),
          ...(roleConfig.brokerUpstreamEdge
            ? { brokerUpstreamEdge: roleConfig.brokerUpstreamEdge }
            : {}),
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
