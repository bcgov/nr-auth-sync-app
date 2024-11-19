import 'reflect-metadata';
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
import { GenerateController } from '../controller/generate.contoller.js';

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
    ...sourceBrokerIdp,
    ...targetFlags,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(Generate);

    bindConstants(flags['config-path'], flags['source-broker-idp']);
    bindBroker(flags['broker-api-url'], flags['broker-token']);
    await bindTarget(flags);
    await vsContainer
      .get<GenerateController>(TYPES.GenerateController)
      .generate();
  }
}
