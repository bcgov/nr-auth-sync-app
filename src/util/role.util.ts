import { RoleConfig } from '../types.js';

export function roleFromConfig(roleConfig: RoleConfig) {
  if (roleConfig.group) {
    return `${roleConfig.group}_${roleConfig.name}`;
  } else {
    return roleConfig.name;
  }
}
