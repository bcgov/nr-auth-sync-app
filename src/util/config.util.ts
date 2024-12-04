import { RoleMemberConfig } from '../types.js';

export function isBrokerRoleMemberConfig(
  config: RoleMemberConfig | undefined,
): boolean {
  return !!config && config.broker !== undefined;
}

export function isStaticRoleMemberConfig(
  config: RoleMemberConfig | undefined,
): boolean {
  return !!config && config.static !== undefined;
}
