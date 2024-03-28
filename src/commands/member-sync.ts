import 'reflect-metadata';
import { Command } from '@oclif/core';
// eslint-disable-next-line max-len
import {
  help,
  cssTokenUrl,
  cssClientId,
  cssClientSecret,
  jiraHost,
  jiraBaseUrl,
  jiraUsername,
  jiraPassword,
  configPath,
  brokerToken,
  brokerApiUrl,
} from '../flags';
import { TYPES } from '../inversify.types';
import {
  bindBroker,
  bindConfigPath,
  bindCss,
  bindJira,
  vsContainer,
} from '../inversify.config';
import { CssAdminSyncController } from '../css/css-admin-sync.controller';

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
    ...jiraHost,
    ...jiraBaseUrl,
    ...jiraUsername,
    ...jiraPassword,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(MemberSync);

    bindConfigPath(flags['config-path']);

    await bindCss(
      flags['css-token-url'],
      flags['css-client-id'],
      flags['css-client-secret'],
    );

    bindJira(
      flags['jira-host'],
      flags['jira-base-url'],
      flags['jira-username'],
      flags['jira-password'],
    );

    bindBroker(flags['broker-api-url'], flags['broker-token']);

    this.log(`Syncing project devs to CSS`);

    await vsContainer
      .get<CssAdminSyncController>(TYPES.CssAdminSyncController)
      .memberSync();
  }
}
