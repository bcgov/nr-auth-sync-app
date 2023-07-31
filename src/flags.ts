import { flags } from '@oclif/command';

export const help = {
  help: flags.help({ char: 'h' }),
};

export const configPath = {
  'config-path': flags.string({
    default: './config',
    description: 'The path to the config directory',
    env: 'AUTH_SYNC_CONFIG_PATH',
  }),
};

export const brokerApiUrl = {
  'broker-api-url': flags.string({
    default: 'https://nr-broker.apps.silver.devops.gov.bc.ca/',
    description: 'The broker api base url',
    env: 'BROKER_API_URL',
  }),
};

export const brokerToken = {
  'broker-token': flags.string({
    required: false,
    description: 'The broker JWT',
    env: 'BROKER_TOKEN',
  }),
};

export const cssTokenUrl = {
  'css-token-url': flags.string({
    default: 'url',
    description: 'The css token url',
    env: 'CSS_TOKEN_URL',
  }),
};

export const cssClientId = {
  'css-client-id': flags.string({
    default: 'id',
    description: 'The css keycloak client id',
    env: 'CSS_CLIENT_ID',
  }),
};

export const cssClientSecret = {
  'css-client-secret': flags.string({
    default: 'password',
    description: 'The css keycloak client secret',
    env: 'CSS_CLIENT_SECRET',
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
