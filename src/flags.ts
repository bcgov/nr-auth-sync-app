import {flags} from '@oclif/command';

export const help = {
  help: flags.help({char: 'h'}),
};

export const keycloakAddr = {
  'keycloak-addr': flags.string({
    default: 'http://127.0.0.1:8080/auth',
    description: 'The keycloak address',
    env: 'KEYCLOAK_ADDR',
  }),
};

export const keycloakRealm = {
  'keycloak-realm': flags.string({
    default: 'master',
    description: 'The keycloak realm',
    env: 'KEYCLOAK_REALM',
  }),
};

export const keycloakClientId = {
  'keycloak-client-id': flags.string({
    default: 'admin',
    description: 'The keycloak client ID',
    env: 'KEYCLOAK_CLIENT_ID',
  }),
};

export const keycloakClientSecret = {
  'keycloak-client-secret': flags.string({
    default: 'password',
    description: 'The keycloak client secret',
    env: 'KEYCLOAK_CLIENT_SECRET',
  }),
};

export const jiraHost = {
  'jira-host': flags.string({
    default: 'bwa.nrs.gov.bc.ca',
    description: 'The Jira host',
    env: 'JIRA_HOST',
  }),
};

export const jiraBaseUrl = {
  'jira-base-url': flags.string({
    default: '/int/jira',
    description: 'The Jira Base URL',
    env: 'JIRA_BASE_URL',
  }),
};

export const jiraUsername = {
  'jira-username': flags.string({
    default: 'admin',
    description: 'The Jira user',
    env: 'JIRA_USERNAME',
  }),
};

export const jiraPassword = {
  'jira-password': flags.string({
    default: 'password',
    description: 'The Jira password',
    env: 'JIRA_PASSWORD',
  }),
};

export const ldapUrl = {
  'ldap-url': flags.string({
    default: 'ldaps://idir.bcgov',
    description: 'The LDAP URL',
    env: 'LDAP_URL',
  }),
};

export const ldapUsername = {
  'ldap-username': flags.string({
    default: 'admin',
    description: 'The ldap user',
    env: 'LDAP_USERNAME',
  }),
};

export const ldapPassword = {
  'ldap-password': flags.string({
    default: 'password',
    description: 'The ldap password',
    env: 'LDAP_PASSWORD',
  }),
};
