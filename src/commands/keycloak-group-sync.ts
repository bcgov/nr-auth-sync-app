import {Command} from '@oclif/command';
import 'reflect-metadata';
import {help, keycloakAddr, keycloakUsername, keycloakPassword} from '../flags';
import {KeycloakSyncController} from '../keycloak/keycloak-sync.controller';
import {bindKeycloak, vsContainer} from '../inversify.config';
import {TYPES} from '../inversify.types';

/**
 * Vault and Keycloak user group sync command
 */
export default class KeycloakGroupSync extends Command {
  static description = 'Given sync group to Keycloak from sources of truth.'

  static flags = {
    ...help,
    ...keycloakAddr,
    ...keycloakUsername,
    ...keycloakPassword,
  }

  static args = [{name: 'groupname'}]
  /**
   * Run the command
   */
  async run() {
    const {args, flags} = this.parse(KeycloakGroupSync);

    this.log(`Creating group '${args.groupname}' in Keycloak.`);

    await bindKeycloak(flags['keycloak-addr'], flags['keycloak-username'], flags['keycloak-password']);

    await vsContainer.get<KeycloakSyncController>(TYPES.KeycloakSyncController).syncSources(args.groupname);
  }
}
