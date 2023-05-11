import 'reflect-metadata';
import {Command} from '@oclif/command';
import {help, cssTokenUrl, cssClientId, cssClientSecret, configPath} from '../flags';
import {TYPES} from '../inversify.types';
import {bindConfigPath, bindCss, vsContainer} from '../inversify.config';
import {CssAdminSyncController} from '../css/css-admin-sync.controller';

/**
 * Syncs roles to css command
 */
export default class RoleSync extends Command {
  static description = 'Syncs roles to CSS';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static flags = {
    ...help,
    ...configPath,
    ...cssTokenUrl,
    ...cssClientId,
    ...cssClientSecret,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const {flags} = this.parse(RoleSync);

    bindConfigPath(flags['config-path']);

    await bindCss(
      flags['css-token-url'],
      flags['css-client-id'],
      flags['css-client-secret']);

    this.log(`Syncing roles to CSS`);

    await vsContainer.get<CssAdminSyncController>(TYPES.CssAdminSyncController)
      .roleSync();
  }
}
