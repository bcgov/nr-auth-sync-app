import {Container} from 'inversify';
import {TYPES} from './inversify.types';
import EnvironmentUtil from './util/environment.util';
import {SourceJiraService} from './services/impl/source-jira.service';
import {SourceService} from './services/source.service';
import JiraApi from 'jira-client';
import {jiraFactory} from './jira/jira.factory';
import {ldapFactory} from './ldap/ldap.factory';
import {Client} from 'ldapjs';
import {LdapApi} from './ldap/ldap.api';
import {CssAdminSyncController} from './css/css-admin-sync.controller';
import {CssAdminApi} from './css/css-admin.api';
import {cssAdminApiFactory} from './css/css.factory';
import {SourceStaticService} from './services/impl/source-static.service';

const vsContainer = new Container();
// Services
vsContainer.bind<SourceService>(TYPES.SourceService).to(SourceJiraService);
vsContainer.bind<SourceService>(TYPES.SourceService).to(SourceStaticService);

// Controllers
vsContainer.bind<LdapApi>(TYPES.LdapApi).to(LdapApi);
vsContainer.bind<CssAdminSyncController>(TYPES.CssAdminSyncController).to(CssAdminSyncController);

// Util
vsContainer.bind<EnvironmentUtil>(TYPES.EnvironmentUtil).to(EnvironmentUtil);

export {vsContainer};

<<<<<<< HEAD
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

=======
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

>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
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

/**
 * The LDAP factory
 * @param url The LDAP address
 * @param username The LDAP username
 * @param password The LDAP password
 */
export async function bindLdap(url: string, username: string, password: string): Promise<void> {
  const client = await ldapFactory(url, username, password);

  vsContainer.bind<Client>(TYPES.LdapClient).toConstantValue(client);
}
