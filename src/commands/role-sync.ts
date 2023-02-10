import 'reflect-metadata';
import {Command} from '@oclif/command';
<<<<<<< HEAD
import {help, cssTokenUrl, cssClientId, cssClientSecret} from '../flags';
import {TYPES} from '../inversify.types';
import {bindCss, vsContainer} from '../inversify.config';
=======
import {help, cssTokenUrl, cssClientId, cssClientSecret, configPath} from '../flags';
import {TYPES} from '../inversify.types';
import {bindConfigPath, bindCss, vsContainer} from '../inversify.config';
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
import {CssAdminSyncController} from '../css/css-admin-sync.controller';

/**
 * Syncs roles to css command
 */
export default class RoleSync extends Command {
  static description = 'Syncs roles to Css';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static flags = {
    ...help,
<<<<<<< HEAD
=======
    ...configPath,
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
    ...cssTokenUrl,
    ...cssClientId,
    ...cssClientSecret,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const {flags} = this.parse(RoleSync);

<<<<<<< HEAD
=======
    bindConfigPath(flags['config-path']);

>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
    await bindCss(
      flags['css-token-url'],
      flags['css-client-id'],
      flags['css-client-secret']);

    this.log(`Syncing roles to CSS`);

    await vsContainer.get<CssAdminSyncController>(TYPES.CssAdminSyncController)
      .roleSync();
  }
}
