import {Container} from 'inversify';
import {logger} from './logger';
import {TYPES} from './inversify.types';
import winston from 'winston';
import KeycloakAdminClient from 'keycloak-admin';
import {keycloakFactory} from './keycloak/keycloak.factory';
import {KeycloakSyncController} from './keycloak/keycloak-sync.controller';
import EnvironmentUtil from './util/environment.util';
import {ProjectSourceJiraService} from './services/impl/project-source-jira.service';
import {ProjectSourceService} from './services/project-source.service';
import JiraApi from 'jira-client';
import {jiraFactory} from './jira/jira.factory';
import {OutletService} from './services/outlet.service';
import {OutletJenkinsService} from './services/impl/outlet-jenkins.service';
import {OutletVaultService} from './services/impl/outlet-vault.service';
import {KeycloakApi} from './keycloak/keycloak.api';

const vsContainer = new Container();
// Services
vsContainer.bind<ProjectSourceService>(TYPES.ProjectSourceService).to(ProjectSourceJiraService);
vsContainer.bind<OutletService>(TYPES.OutletService).to(OutletJenkinsService);
vsContainer.bind<OutletService>(TYPES.OutletService).to(OutletVaultService);

// Controllers
vsContainer.bind<KeycloakApi>(TYPES.KeycloakApi).to(KeycloakApi);
vsContainer.bind<KeycloakSyncController>(TYPES.KeycloakSyncController).to(KeycloakSyncController);

// Util
vsContainer.bind<EnvironmentUtil>(TYPES.EnvironmentUtil).to(EnvironmentUtil);

// Logging
vsContainer.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger);

export {vsContainer};

/**
 * Bind keycloak api to the vs container
 * @param keycloakAddr The keycloak address
 * @param keycloakRealm The keycloak realm
 * @param keycloakClientId The keycloak client ID
 * @param keycloakClientSecret The keycloak client secret
 */
export async function bindKeycloak(keycloakAddr: string,
  keycloakRealm: string,
  keycloakClientId: string,
  keycloakClientSecret: string) {
  const client = await keycloakFactory(keycloakAddr, keycloakRealm, keycloakClientId, keycloakClientSecret);

  vsContainer.bind<KeycloakAdminClient>(TYPES.KeycloakAdminClient).toConstantValue(client);
}

/**
 * Bind Jira api to the vs container
 * @param host The Jira address
 * @param basePath The base url
 * @param username The Jira username
 * @param password The Jira password
 */
export function bindJira(host: string, basePath: string, username: string, password: string) {
  const client = jiraFactory(host, basePath, username, password);

  vsContainer.bind<JiraApi>(TYPES.JiraClient).toConstantValue(client);
}

