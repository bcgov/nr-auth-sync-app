import { Container } from 'inversify';
import { TYPES } from './inversify.types.js';
import EnvironmentUtil from './util/environment.util.js';
import { SourceService } from './services/source.service.js';

import { GenerateController } from './controller/generate.contoller.js';
import { AuthMemberSyncController } from './controller/auth-member-sync.controller.js';
import { AuthMonitorController } from './controller/auth-monitor.controller.js';
import { AuthRoleSyncController } from './controller/auth-role-sync.controller.js';

// import { CssAdminApi } from './css/css-admin.api';
import { cssServiceFactory } from './services/target-css.factory.js';
import { githubServiceFactory } from './services/target-github.factory.js';
import { SourceBrokerService } from './services/impl/source-broker.service.js';
import { SourceStaticService } from './services/impl/source-static.service.js';
import { BrokerApi } from './broker/broker.api.js';
import { TargetService } from './services/target.service.js';
import { SmtpNotificationService } from './notification/smtp-notification.service.js';
import { targetFlags } from './flags.js';

const vsContainer = new Container();
// Services
vsContainer.bind<SourceService>(TYPES.SourceService).to(SourceBrokerService);
vsContainer.bind<SourceService>(TYPES.SourceService).to(SourceStaticService);

// API
vsContainer.bind<BrokerApi>(TYPES.BrokerApi).to(BrokerApi);

// Controllers
vsContainer
  .bind<AuthMemberSyncController>(TYPES.AuthMemberSyncController)
  .to(AuthMemberSyncController);
vsContainer
  .bind<AuthMonitorController>(TYPES.AuthMonitorController)
  .to(AuthMonitorController);
vsContainer
  .bind<AuthRoleSyncController>(TYPES.AuthRoleSyncController)
  .to(AuthRoleSyncController);
vsContainer
  .bind<GenerateController>(TYPES.GenerateController)
  .to(GenerateController);
vsContainer
  .bind<SmtpNotificationService>(TYPES.SmtpNotificationService)
  .to(SmtpNotificationService);

// Util
vsContainer.bind<EnvironmentUtil>(TYPES.EnvironmentUtil).to(EnvironmentUtil);

export { vsContainer };

/**
 * Bind Broker api to the vs container
 * @param basePath The base api url
 * @param token The broker token
 */
export function bindBroker(apiUrl: string, token: string | undefined): void {
  vsContainer.bind<string>(TYPES.BrokerApiUrl).toConstantValue(apiUrl);
  if (token) {
    vsContainer.bind<string>(TYPES.BrokerToken).toConstantValue(token);
  }
}

export function bindNotification(smtp: any, option: any): void {
  vsContainer.bind<string>(TYPES.NotificationSmtp).toConstantValue(smtp);
  vsContainer.bind<string>(TYPES.NotificationOption).toConstantValue(option);
}

export function bindConstants(path: string, sourceBrokerIdp: string) {
  vsContainer.bind<string>(TYPES.IntegrationRolesPath).toConstantValue(path);
  vsContainer
    .bind<string>(TYPES.SourceBrokerIdp)
    .toConstantValue(sourceBrokerIdp);
}

/**
 *
 * @param cssTokenUrl
 * @param cssClientId
 * @param cssClientSecret
 */
export async function bindCssTarget(
  cssTokenUrl: string,
  cssClientId: string,
  cssClientSecret: string,
): Promise<void> {
  const client = await cssServiceFactory(
    cssTokenUrl,
    cssClientId,
    cssClientSecret,
  );
  if (!client) {
    return;
  }

  vsContainer.bind<TargetService>(TYPES.TargetService).toConstantValue(client);
}

export async function bindGithubTarget(
  clientType: 'github-app' | 'pat' | undefined,
  appId: string,
  clientId: string,
  clientSecret: string,
  privateKey: string,
  token: string,
): Promise<void> {
  const client = await githubServiceFactory(
    clientType,
    appId,
    clientId,
    clientSecret,
    privateKey,
    token,
  );
  if (!client) {
    return;
  }
  vsContainer.bind<TargetService>(TYPES.TargetService).toConstantValue(client);
}

export async function bindTarget(flags: {
  [key in keyof typeof targetFlags]: any;
}): Promise<void> {
  await bindCssTarget(
    flags['css-token-url'],
    flags['css-client-id'],
    flags['css-client-secret'],
  );

  await bindGithubTarget(
    flags['github-client-type'],
    flags['github-app-id'],
    flags['github-client-id'],
    flags['github-client-secret'],
    flags['github-private-key'],
    flags['github-token'],
  );
}
