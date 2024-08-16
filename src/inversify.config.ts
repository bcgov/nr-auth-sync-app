import { Container } from 'inversify';
import { TYPES } from './inversify.types';
import EnvironmentUtil from './util/environment.util';
import { SourceService } from './services/source.service';

import { GenerateController } from './controller/generate.contoller';
import { AuthMemberSyncController } from './controller/auth-member-sync.controller';
import { AuthMonitorController } from './controller/auth-monitor.controller';
import { AuthRoleSyncController } from './controller/auth-role-sync.controller';

// import { CssAdminApi } from './css/css-admin.api';
import { cssAdminApiFactory } from './services/target.factory';
import { SourceBrokerService } from './services/impl/source-broker.service';
import { SourceStaticService } from './services/impl/source-static.service';
import { BrokerApi } from './broker/broker.api';
import { TargetService } from './services/target.service';

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

export function bindConfigPath(path: string) {
  vsContainer.bind<string>(TYPES.IntegrationRolesPath).toConstantValue(path);
}

/**
 *
 * @param cssTokenUrl
 * @param cssClientId
 * @param cssClientSecret
 */
export async function bindTarget(
  cssTokenUrl: string,
  cssClientId: string,
  cssClientSecret: string,
): Promise<void> {
  const client = await cssAdminApiFactory(
    cssTokenUrl,
    cssClientId,
    cssClientSecret,
  );

  // TODO: Bind based on inputs
  vsContainer.bind<TargetService>(TYPES.TargetService).toConstantValue(client);

  // vsContainer.bind<CssAdminApi>(TYPES.CssAdminApi).toConstantValue(client);
}
