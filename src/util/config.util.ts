import {
  BrokerRoleMemberConfig,
  RoleMemberConfig,
  StaticRoleMemberConfig,
} from '../types.js';

export function isBrokerRoleMemberConfig(
  config: RoleMemberConfig | undefined,
): config is BrokerRoleMemberConfig {
  return !!config && (config as BrokerRoleMemberConfig).broker !== undefined;
}

export function isStaticRoleMemberConfig(
  config: RoleMemberConfig | undefined,
): config is StaticRoleMemberConfig {
  return !!config && (config as StaticRoleMemberConfig).static !== undefined;
}
