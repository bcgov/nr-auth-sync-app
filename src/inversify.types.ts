// file types.ts

const TYPES = {
  ConfigService: Symbol.for('ConfigService'),
  EnvironmentUtil: Symbol.for('EnvironmentUtil'),
  JiraClient: Symbol.for('JiraClient'),
  LdapApi: Symbol.for('LdapApi'),
  LdapClient: Symbol.for('LdapClient'),
  KeycloakAdminClient: Symbol.for('KeycloakAdminClient'),
  KeycloakApi: Symbol.for('KeycloakApi'),
  KeycloakSyncController: Symbol.for('KeycloakSyncController'),
  Logger: Symbol.for('Logger'),
  OutletService: Symbol.for('OutletService'),
  ProjectSourceService: Symbol.for('ProjectSourceService'),
};

export {TYPES};
