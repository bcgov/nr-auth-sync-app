import {flags} from '@oclif/command';

export const help = {
  help: flags.help({char: 'h'}),
};

export const keycloakAddr = {
  'keycloak-addr': flags.string({
    default: 'http://127.0.0.1:8080/auth',
    description: 'The keycloak address',
    env: 'KEYCLOAK_ADDR',
  })};

export const keycloakUsername = {
  'keycloak-username': flags.string({
    default: 'admin',
    description: 'The keycloak username',
    env: 'KEYCLOAK_USER',
  }),
};

export const keycloakPassword = {
  'keycloak-password': flags.string({
    default: 'password',
    description: 'The keycloak password',
    env: 'KEYCLOAK_PASS',
  }),
};
