import {Command} from '@oclif/command';
import 'reflect-metadata';
import {help, keycloakAddr, keycloakRealm, keycloakClientId, keycloakClientSecret,
  jiraHost, jiraBaseUrl, jiraUsername, jiraPassword, ldapPassword, ldapUrl, ldapUsername} from '../flags';
import {TYPES} from '../inversify.types';
import {KeycloakSyncController} from '../keycloak/keycloak-sync.controller';
import {bindJira, bindKeycloak, bindLdap, vsContainer} from '../inversify.config';

/**
 * Syncs project to Keycloak command
 */
export default class KeycloakSync extends Command {
  static description = 'Syncs projects and gorups to Keycloak';

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
    ...ldapUrl,
    ...ldapUsername,
    ...ldapPassword,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const {flags} = this.parse(KeycloakSync);

    await bindKeycloak(
      flags['keycloak-addr'],
      flags['keycloak-realm'],
      flags['keycloak-client-id'],
      flags['keycloak-client-secret']);

    bindJira(
      flags['jira-host'],
      flags['jira-base-url'],
      flags['jira-username'],
      flags['jira-password']);

    await bindLdap(
      flags['ldap-url'],
      flags['ldap-username'],
      flags['ldap-password']);

    this.log(`Syncing to Keycloak.`);

    await vsContainer.get<KeycloakSyncController>(TYPES.KeycloakSyncController)
      .syncSources();
  }
}
