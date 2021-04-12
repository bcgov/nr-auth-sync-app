// file types.ts

const TYPES = {
  EnvironmentUtil: Symbol.for('EnvironmentUtil'),
  JiraClient: Symbol.for('JiraClient'),
  KeycloakAdminClient: Symbol.for('KeycloakAdminClient'),
  KeycloakApi: Symbol.for('KeycloakApi'),
  KeycloakSyncController: Symbol.for('KeycloakSyncController'),
  Logger: Symbol.for('Logger'),
  OutletService: Symbol.for('OutletService'),
  ProjectSourceService: Symbol.for('ProjectSourceService'),
};

export {TYPES};
