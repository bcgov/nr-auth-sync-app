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

const vsContainer = new Container();
// Services
vsContainer.bind<ProjectSourceService>(TYPES.ProjectSourceService).to(ProjectSourceJiraService);

// Controllers
vsContainer.bind<KeycloakSyncController>(TYPES.KeycloakSyncController).to(KeycloakSyncController);

// Util
vsContainer.bind<EnvironmentUtil>(TYPES.EnvironmentUtil).to(EnvironmentUtil);

// Logging
vsContainer.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger);

export {vsContainer};

/**
 * Bind keycloak api to the vs container
 * @param addr The keycloak address
 * @param username The keycloak sername
 * @param password The keycloak password
 */
export async function bindKeycloak(addr: string, username: string, password: string) {
  const client = await keycloakFactory(addr, username, password);

  vsContainer.bind<KeycloakAdminClient>(TYPES.KeycloakAdminClient).toConstantValue(client);
}
