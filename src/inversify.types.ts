// file types.ts

const TYPES = {
  ConfigService: Symbol.for('ConfigService'),
  CssAdminClient: Symbol.for('CssAdminClient'),
  CssAdminApi: Symbol.for('CssAdminApi'),
  CssAdminSyncController: Symbol.for('CssAdminSyncController'),
  EnvironmentUtil: Symbol.for('EnvironmentUtil'),
  IntegrationRolesPath: Symbol.for('IntegrationRolesPath'),
  JiraBasePath: Symbol.for('JiraBasePath'),
  JiraClient: Symbol.for('JiraClient'),
  JiraHost: Symbol.for('JiraHost'),
  JiraUsername: Symbol.for('JiraUsername'),
  JiraPassword: Symbol.for('JiraPassword'),
  LdapApi: Symbol.for('LdapApi'),
  LdapClient: Symbol.for('LdapClient'),
  Logger: Symbol.for('Logger'),
  SourceService: Symbol.for('SourceService'),
};

export {TYPES};
