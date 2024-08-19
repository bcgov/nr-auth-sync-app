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
  brokerToken,
  brokerApiUrl,
} from '../flags';
import { TYPES } from '../inversify.types';
import {
  bindBroker,
  bindConstants,
  bindTarget,
  vsContainer,
} from '../inversify.config';
import { AuthMemberSyncController } from '../controller/auth-member-sync.controller';

/**
 * Syncs roles to css command
 */
export default class MemberSync extends Command {
  static description = 'Syncs user and role configuration to CSS';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    ...help,
    ...brokerApiUrl,
    ...brokerToken,
    ...configPath,
    ...cssTokenUrl,
    ...cssClientId,
    ...cssClientSecret,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(MemberSync);

    bindConstants(flags['config-path'], flags['source-broker-idp']);
    bindBroker(flags['broker-api-url'], flags['broker-token']);
    await bindTarget(
      flags['css-token-url'],
      flags['css-client-id'],
      flags['css-client-secret'],
    );

    this.log(`Syncing member roles`);

    const configPath = path.join(
      flags['config-path'],
      'integration-roles.json',
    );
    if (fs.existsSync(configPath)) {
      const integrationConfigs = JSON.parse(
        fs.readFileSync(configPath, 'utf8'),
      );

      await vsContainer
        .get<AuthMemberSyncController>(TYPES.AuthMemberSyncController)
        .sync(integrationConfigs);
    } else {
      console.log(`Could not find config: ${configPath}`);
    }
  }
}
