import {Container} from 'inversify';
import {TYPES} from './inversify.types';
import EnvironmentUtil from './util/environment.util';
import {SourceService} from './services/source.service';
import JiraApi from 'jira-client';
import {jiraFactory} from './jira/jira.factory';
import {CssAdminSyncController} from './css/css-admin-sync.controller';
import {CssAdminApi} from './css/css-admin.api';
import {cssAdminApiFactory} from './css/css.factory';
import {SourceJiraService} from './services/impl/source-jira.service';
import {SourceBrokerService} from './services/impl/source-broker.service';
import {SourceStaticService} from './services/impl/source-static.service';
import {GenerateController} from './css/generate.contoller';

const vsContainer = new Container();
// Services
vsContainer.bind<SourceService>(TYPES.SourceService).to(SourceJiraService);
vsContainer.bind<SourceService>(TYPES.SourceService).to(SourceBrokerService);
vsContainer.bind<SourceService>(TYPES.SourceService).to(SourceStaticService);

// Controllers
vsContainer.bind<CssAdminSyncController>(TYPES.CssAdminSyncController).to(CssAdminSyncController);
vsContainer.bind<GenerateController>(TYPES.GenerateController).to(GenerateController);

// Util
vsContainer.bind<EnvironmentUtil>(TYPES.EnvironmentUtil).to(EnvironmentUtil);

export {vsContainer};

/**
 * Bind Broker api to the vs container
 * @param basePath The base api url
 * @param token The Jira username
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
  cssClientSecret: string): Promise<void> {
  const client = await cssAdminApiFactory(cssTokenUrl, cssClientId, cssClientSecret);

  vsContainer.bind<CssAdminApi>(TYPES.CssAdminApi).toConstantValue(client);
}

/**
 * Bind Jira api to the vs container
 * @param host The Jira address
 * @param basePath The base url
 * @param username The Jira username
 * @param password The Jira password
 */
export function bindJira(host: string, basePath: string, username: string, password: string): void {
  const client = jiraFactory(host, basePath, username, password);

  vsContainer.bind<JiraApi>(TYPES.JiraClient).toConstantValue(client);

  vsContainer.bind<string>(TYPES.JiraHost).toConstantValue(host);
  vsContainer.bind<string>(TYPES.JiraBasePath).toConstantValue(basePath);
  vsContainer.bind<string>(TYPES.JiraUsername).toConstantValue(username);
  vsContainer.bind<string>(TYPES.JiraPassword).toConstantValue(password);
}
