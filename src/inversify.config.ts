import { Container } from 'inversify';
import { TYPES } from './inversify.types';
import EnvironmentUtil from './util/environment.util';
import { SourceService } from './services/source.service';
import { CssAdminSyncController } from './css/css-admin-sync.controller';
import { CssAdminApi } from './css/css-admin.api';
import { cssAdminApiFactory } from './css/css.factory';
import { SourceBrokerService } from './services/impl/source-broker.service';
import { SourceStaticService } from './services/impl/source-static.service';
import { GenerateController } from './broker/generate.contoller';
import { BrokerApi } from './broker/broker.api';

const vsContainer = new Container();
// Services
vsContainer.bind<SourceService>(TYPES.SourceService).to(SourceBrokerService);
vsContainer.bind<SourceService>(TYPES.SourceService).to(SourceStaticService);

// API
vsContainer.bind<BrokerApi>(TYPES.BrokerApi).to(BrokerApi);

// Controllers
vsContainer
  .bind<CssAdminSyncController>(TYPES.CssAdminSyncController)
  .to(CssAdminSyncController);
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
export async function bindCss(
  cssTokenUrl: string,
  cssClientId: string,
  cssClientSecret: string,
): Promise<void> {
  const client = await cssAdminApiFactory(
    cssTokenUrl,
    cssClientId,
    cssClientSecret,
  );

  vsContainer.bind<CssAdminApi>(TYPES.CssAdminApi).toConstantValue(client);
}
