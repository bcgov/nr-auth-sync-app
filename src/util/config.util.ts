import path from 'path';
import fs from 'fs';
import {
  BrokerRoleMemberConfig, JiraRoleMemberConfig, RoleMemberConfig, StaticRoleMemberConfig
} from '../css/css.types';

const integrationRolesPath = path.join(__dirname, '../../config', 'integration-roles.json');
const integrationRoles = JSON.parse(fs.readFileSync(integrationRolesPath, 'utf8'));

export function isBrokerRoleMemberConfig(config: RoleMemberConfig): config is BrokerRoleMemberConfig {
  return (config as BrokerRoleMemberConfig).broker !== undefined;
}

export function isJiraRoleMemberConfig(config: RoleMemberConfig): config is JiraRoleMemberConfig {
  return (config as JiraRoleMemberConfig).jira !== undefined;
}

export function isStaticRoleMemberConfig(config: RoleMemberConfig): config is StaticRoleMemberConfig {
  return (config as StaticRoleMemberConfig).static !== undefined;
}

export {integrationRoles};
