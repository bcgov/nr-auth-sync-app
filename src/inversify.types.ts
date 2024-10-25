// file types.ts

const TYPES = {
  AuthMemberSyncController: Symbol.for('AuthMemberSyncController'),
  AuthMonitorController: Symbol.for('AuthMonitorController'),
  AuthRoleSyncController: Symbol.for('AuthRoleSyncController'),
  BrokerApi: Symbol.for('BrokerApi'),
  BrokerApiUrl: Symbol.for('BrokerApiUrl'),
  BrokerToken: Symbol.for('BrokerToken'),
  ConfigService: Symbol.for('ConfigService'),
  CssAdminClient: Symbol.for('CssAdminClient'),
  CssAdminApi: Symbol.for('CssAdminApi'),
  EnvironmentUtil: Symbol.for('EnvironmentUtil'),
  GenerateController: Symbol.for('GenerateController'),
  IntegrationRolesPath: Symbol.for('IntegrationRolesPath'),
  SmtpNotificationService: Symbol.for('SmtpNotificationService'),
  NotificationSmtp: Symbol.for('NotificationSmtp'),
  NotificationOption: Symbol.for('NotificationOption'),
  Logger: Symbol.for('Logger'),
  SourceService: Symbol.for('SourceService'),
  SourceBrokerIdp: Symbol.for('SourceBrokerIdp'),
  TargetService: Symbol.for('TargetService'),
};

export { TYPES };
