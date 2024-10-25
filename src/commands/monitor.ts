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
  notificationOptionFrom,
  notificationOptionSubject,
  notificationOptionTemplateHtml,
  notificationOptionTemplateText,
  notificationSmtpHost,
  notificationSmtpPort,
  notificationSmtpSecure,
  sourceBrokerIdp,
} from '../flags';
import {
  bindBroker,
  bindConstants,
  bindNotification,
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
    ...notificationSmtpHost,
    ...notificationSmtpPort,
    ...notificationSmtpSecure,
    ...notificationOptionFrom,
    ...notificationOptionSubject,
    ...notificationOptionTemplateText,
    ...notificationOptionTemplateHtml,
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
    bindNotification(
      {
        host: flags['notification-smtp-host'],
        port: flags['notification-smtp-port'],
        secure: flags['notification-smtp-secure'],
      },
      {
        from: flags['notification-option-from'],
        subject: flags['notification-option-subject'],
        text: flags['notification-option-template-text'],
        html: flags['notification-option-template-html'],
      },
    );
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
