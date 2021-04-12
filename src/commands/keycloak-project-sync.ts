import {Command} from '@oclif/command';
import 'reflect-metadata';
import {help, keycloakAddr, keycloakRealm, keycloakClientId, keycloakClientSecret,
  jiraHost, jiraBaseUrl, jiraUsername, jiraPassword} from '../flags';
import {TYPES} from '../inversify.types';
import {KeycloakSyncController} from '../keycloak/keycloak-sync.controller';
import {bindJira, bindKeycloak, vsContainer} from '../inversify.config';

/**
 * Syncs project to Keycloak command
 */
export default class KeycloakProjectSync extends Command {
  static description = 'Syncs project to Keycloak';

  static flags = {
    ...help,
    ...keycloakAddr,
    ...keycloakRealm,
    ...keycloakClientId,
    ...keycloakClientSecret,
    ...jiraHost,
    ...jiraBaseUrl,
    ...jiraUsername,
    ...jiraPassword,
  };

  static args = [
    {name: 'projectname'},
  ];

  /**
   * Run the command
   */
  async run() {
    const {args, flags} = this.parse(KeycloakProjectSync);

    await bindKeycloak(
      flags['keycloak-addr'],
      flags['keycloak-realm'],
      flags['keycloak-client-id'],
      flags['keycloak-client-secret']);

    await bindJira(
      flags['jira-host'],
      flags['jira-base-url'],
      flags['jira-username'],
      flags['jira-password']);

    if (!args.projectname) {
      // TODO: print help
      return;
    };

    this.log(`Syncing project \'${args.projectname}\' in Keycloak.`);

    await vsContainer.get<KeycloakSyncController>(TYPES.KeycloakSyncController).syncProjectSources(args.projectname);
  }
}
