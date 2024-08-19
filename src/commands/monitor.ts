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
  sourceBrokerIdp,
} from '../flags';
import {
  bindBroker,
  bindConstants,
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
    ...sourceBrokerIdp,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(Monitor);

    this.log('Auth Monitor Sync');

    bindConstants(flags['config-path'], flags['source-broker-idp']);
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
