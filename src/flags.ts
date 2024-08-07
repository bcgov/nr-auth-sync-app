import { Flags } from '@oclif/core';

export const help = {
  help: Flags.help({ char: 'h' }),
};

export const configPath = {
  'config-path': Flags.string({
    default: './config',
    description: 'The path to the config directory',
    env: 'AUTH_SYNC_CONFIG_PATH',
  }),
};

export const brokerApiUrl = {
  'broker-api-url': Flags.string({
    default: 'https://nr-broker.apps.silver.devops.gov.bc.ca/',
    description: 'The broker api base url',
    env: 'BROKER_API_URL',
  }),
};

export const brokerToken = {
  'broker-token': Flags.string({
    required: false,
    description: 'The broker JWT',
    env: 'BROKER_TOKEN',
  }),
};

export const cssTokenUrl = {
  'css-token-url': Flags.string({
    default: 'url',
    description: 'The css token url',
    env: 'CSS_TOKEN_URL',
  }),
};

export const cssClientId = {
  'css-client-id': Flags.string({
    default: 'id',
    description: 'The css keycloak client id',
    env: 'CSS_CLIENT_ID',
  }),
};

export const cssClientSecret = {
  'css-client-secret': Flags.string({
    default: 'password',
    description: 'The css keycloak client secret',
    env: 'CSS_CLIENT_SECRET',
  }),
};
