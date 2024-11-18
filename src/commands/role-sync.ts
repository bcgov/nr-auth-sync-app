import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { Command } from '@oclif/core';
import {
  help,
  configPath,
  brokerApiUrl,
  brokerToken,
  sourceBrokerIdp,
  targetFlags,
} from '../flags.js';
import { TYPES } from '../inversify.types.js';
import {
  bindBroker,
  bindConstants,
  bindTarget,
  vsContainer,
} from '../inversify.config.js';
import { AuthRoleSyncController } from '../controller/auth-role-sync.controller.js';

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
    ...sourceBrokerIdp,
    ...targetFlags,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(RoleSync);

    bindConstants(flags['config-path'], flags['source-broker-idp']);
    bindBroker(flags['broker-api-url'], flags['broker-token']);
    await bindTarget(flags);

    this.log(`Syncing roles to CSS`);

    const configPath = path.join(
      flags['config-path'],
      'integration-roles.json',
    );
    if (fs.existsSync(configPath)) {
      const integrationConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      await vsContainer
        .get<AuthRoleSyncController>(TYPES.AuthRoleSyncController)
        .sync(integrationConfig);
    } else {
      console.log(`Could not find config: ${configPath}`);
    }
  }
}
