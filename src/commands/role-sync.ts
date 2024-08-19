import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { Command } from '@oclif/core';
import {
  help,
  cssTokenUrl,
  cssClientId,
  cssClientSecret,
  configPath,
  brokerApiUrl,
  brokerToken,
  sourceBrokerIdp,
} from '../flags';
import { TYPES } from '../inversify.types';
import {
  bindBroker,
  bindConstants,
  bindTarget,
  vsContainer,
} from '../inversify.config';
import { AuthRoleSyncController } from '../controller/auth-role-sync.controller';

/**
 * Syncs roles to css command
 */
export default class RoleSync extends Command {
  static description = 'Syncs roles to CSS';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    ...help,
    ...brokerApiUrl,
    ...brokerToken,
    ...configPath,
    ...cssTokenUrl,
    ...cssClientId,
    ...cssClientSecret,
    ...sourceBrokerIdp,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(RoleSync);

    bindConstants(flags['config-path'], flags['source-broker-idp']);
    bindBroker(flags['broker-api-url'], flags['broker-token']);
    await bindTarget(
      flags['css-token-url'],
      flags['css-client-id'],
      flags['css-client-secret'],
    );

    this.log(`Syncing roles to CSS`);

    const configPath = path.join(
      flags['config-path'],
      'integration-roles.json',
    );
    if (fs.existsSync(configPath)) {
      const integrationConfigs = JSON.parse(
        fs.readFileSync(configPath, 'utf8'),
      );
      await vsContainer
        .get<AuthRoleSyncController>(TYPES.AuthRoleSyncController)
        .sync(integrationConfigs);
    } else {
      console.log(`Could not find config: ${configPath}`);
    }
  }
}
