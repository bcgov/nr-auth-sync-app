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

export const sourceBrokerIdp = {
  'source-broker-idp': Flags.string({
    default: '',
    description: 'The idp to filter users to',
    env: 'SOURCE_BROKER_DOMAIN',
  }),
};

export const notificationSmtpHost = {
  'notification-smtp-host': Flags.string({
    required: false,
    description: 'The SMTP Host',
    env: 'NOTIFICATION_SMTP_HOST',
  }),
};

export const notificationSmtpPort = {
  'notification-smtp-port': Flags.integer({
    required: false,
    description: 'The SMTP port',
    env: 'NOTIFICATION_SMTP_PORT',
  }),
};

export const notificationSmtpSecure = {
  'notification-smtp-secure': Flags.boolean({
    default: true,
    description: 'The SMTP secure flag',
    env: 'NOTIFICATION_SMTP_SECURE',
  }),
};

export const notificationOptionFrom = {
  'notification-option-from': Flags.string({
    required: false,
    description: 'The notification from address',
    env: 'NOTIFICATION_OPTION_FROM',
  }),
};

export const notificationOptionSubject = {
  'notification-option-subject': Flags.string({
    default: 'Your Access Report (<%= config.name %>)',
    description: 'The notification subject',
    env: 'NOTIFICATION_OPTION_SUBJECT',
  }),
};

export const notificationOptionTemplateText = {
  'notification-option-template-text': Flags.string({
    default: `Hi <%= summary.user.name %>,

This report shows changes to your account access to <%= config.name %>. The following account changes have occurred.
<% summary.addRoles.forEach(function(role) { %>
Add: <%= role %><% if (addRoleMap[role]) { %>

<%- addRoleMap[role] %>
<% }}); %>

<% summary.delRoles.forEach(function(role) { %>
Remove: <%= role %>
<% }); %>

This service uses your connections in Broker's graph to enable (and disable) access by altering your roles in Common Hosted Single Sign-On (CSS).`,
    description: 'The notification template in text',
    env: 'NOTIFICATION_OPTION_TEMPLATE_TEXT',
  }),
};

export const notificationOptionTemplateHtml = {
  'notification-option-template-html': Flags.string({
    default: `<html><body><p>Hi <%= summary.user.name %>,</p>

<p>This report shows changes to your account access to <%= config.name %>. The following account changes have occurred.</p>
<% summary.addRoles.forEach(function(role) { %>
<p>Add: <%= role %></p><% if (addRoleMap[role]) { %>

<%- addRoleMap[role] %>
<% }}); %>

<% summary.delRoles.forEach(function(role) { %>
<p>Remove: <%= role %></p>
<% }); %>

<p>This service uses your connections in Broker's graph to enable (and disable) access by altering your roles in Common Hosted Single Sign-On (CSS).</p>
</body>
</html>`,
    description: 'The notification template in html',
    env: 'NOTIFICATION_OPTION_TEMPLATE_HTML',
  }),
};
