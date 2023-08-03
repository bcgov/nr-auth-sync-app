import {
  BrokerRoleMemberConfig,
  JiraRoleMemberConfig,
  RoleMemberConfig,
  StaticRoleMemberConfig,
} from '../css/css.types';

export function isBrokerRoleMemberConfig(
  config: RoleMemberConfig | undefined,
): config is BrokerRoleMemberConfig {
  return !!config && (config as BrokerRoleMemberConfig).broker !== undefined;
}

export function isJiraRoleMemberConfig(
  config: RoleMemberConfig | undefined,
): config is JiraRoleMemberConfig {
  return !!config && (config as JiraRoleMemberConfig).jira !== undefined;
}

export function isStaticRoleMemberConfig(
  config: RoleMemberConfig | undefined,
): config is StaticRoleMemberConfig {
  return !!config && (config as StaticRoleMemberConfig).static !== undefined;
}
