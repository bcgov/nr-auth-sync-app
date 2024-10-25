import { RoleConfig } from '../types';

export function roleFromConfig(roleConfig: RoleConfig) {
  if (roleConfig.group) {
    return `${roleConfig.group}_${roleConfig.name}`;
  } else {
    return roleConfig.name;
  }
}
