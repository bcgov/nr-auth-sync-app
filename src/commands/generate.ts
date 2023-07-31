import 'reflect-metadata';
import {Command} from '@oclif/command';
import {help, configPath, brokerApiUrl, brokerToken} from '../flags';
import {TYPES} from '../inversify.types';
import {bindBroker, vsContainer} from '../inversify.config';
import {GenerateController} from '../css/generate.contoller';

/**
 * Generate role file command
 */
export default class Generate extends Command {
  static description = 'Syncs roles to CSS';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static flags = {
    ...help,
    ...brokerApiUrl,
    ...brokerToken,
    ...configPath,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const {flags} = this.parse(Generate);

    bindBroker(
      flags['broker-api-url'],
      flags['broker-token']);

    this.log(`Generate integration file`);

    await vsContainer.get<GenerateController>(TYPES.GenerateController)
      .generate();
  }
}
