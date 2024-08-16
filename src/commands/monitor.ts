import 'reflect-metadata';
import { Command } from '@oclif/core';
import {
  brokerApiUrl,
  brokerToken,
  configPath,
  cssClientId,
  cssClientSecret,
  cssTokenUrl,
  help,
} from '../flags';
import {
  bindBroker,
  bindConfigPath,
  bindTarget,
  vsContainer,
} from '../inversify.config';
import { TYPES } from '../inversify.types';
import { AuthMonitorController } from '../controller/auth-monitor.controller';

/**
 * Monitor and sync on demand
 */
export default class Monitor extends Command {
  static description = 'Monitor for auth changes to sync';

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
    const { flags } = await this.parse(Monitor);

    this.log('Auth Monitor Sync');

    bindConfigPath(flags['config-path']);
    bindBroker(flags['broker-api-url'], flags['broker-token']);
    await bindTarget(
      flags['css-token-url'],
      flags['css-client-id'],
      flags['css-client-secret'],
    );

    await vsContainer
      .get<AuthMonitorController>(TYPES.AuthMonitorController)
      .monitor();
  }
}
