import 'reflect-metadata';
import { Command } from '@oclif/core';
import {
  help,
  configPath,
  brokerApiUrl,
  brokerToken,
  cssClientId,
  cssClientSecret,
  cssTokenUrl,
  sourceBrokerIdp,
} from '../flags';
import { TYPES } from '../inversify.types';
import {
  bindBroker,
  bindConstants,
  bindTarget,
  vsContainer,
} from '../inversify.config';
import { GenerateController } from '../controller/generate.contoller';

/**
 * Generate configuration file command
 */
export default class Generate extends Command {
  static description = 'Generates configuration file from template.';

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
    const { flags } = await this.parse(Generate);

    bindConstants(flags['config-path'], flags['source-broker-idp']);
    bindBroker(flags['broker-api-url'], flags['broker-token']);
    await bindTarget(
      flags['css-token-url'],
      flags['css-client-id'],
      flags['css-client-secret'],
    );

    await vsContainer
      .get<GenerateController>(TYPES.GenerateController)
      .generate();
  }
}
