import 'reflect-metadata';
import {Command} from '@oclif/command';
// eslint-disable-next-line max-len
<<<<<<< HEAD
import {help, cssTokenUrl, cssClientId, cssClientSecret, jiraHost, jiraBaseUrl, jiraUsername, jiraPassword} from '../flags';
import {TYPES} from '../inversify.types';
import {bindCss, bindJira, vsContainer} from '../inversify.config';
=======
import {help, cssTokenUrl, cssClientId, cssClientSecret, jiraHost, jiraBaseUrl, jiraUsername, jiraPassword, configPath} from '../flags';
import {TYPES} from '../inversify.types';
import {bindConfigPath, bindCss, bindJira, vsContainer} from '../inversify.config';
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
import {CssAdminSyncController} from '../css/css-admin-sync.controller';

/**
 * Syncs roles to css command
 */
export default class MemberSync extends Command {
  static description = 'Syncs Developers from Jira projects to Css';

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
    ...jiraHost,
    ...jiraBaseUrl,
    ...jiraUsername,
    ...jiraPassword,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const {flags} = this.parse(MemberSync);

<<<<<<< HEAD
=======
    bindConfigPath(flags['config-path']);

>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
    await bindCss(
      flags['css-token-url'],
      flags['css-client-id'],
      flags['css-client-secret']);

    bindJira(
      flags['jira-host'],
      flags['jira-base-url'],
      flags['jira-username'],
      flags['jira-password']);

    this.log(`Syncing project devs to CSS`);

    await vsContainer.get<CssAdminSyncController>(TYPES.CssAdminSyncController)
      .memberSync();
  }
}
