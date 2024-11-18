import { SourceUser } from './services/source.service.js';

export interface OutletMap {
  [key: string]: Set<string>;
}

export interface IntegrationOutletMap {
  [key: string]: OutletMap;
}

export type RoleMemberConfig = BrokerRoleMemberConfig | StaticRoleMemberConfig;

interface BaseRoleMemberConfig {
  copy?: string[];
  exclude?: string[];
}

export interface BrokerRoleMemberConfig extends BaseRoleMemberConfig {
  broker: string;
  brokerEdges?: string;
}

export interface StaticRoleMemberConfig extends BaseRoleMemberConfig {
  static: SourceUser[];
}

export interface RoleConfig {
  group?: string;
  name: string;
  members: RoleMemberConfig;
  onAdd?: NotificationConfig;
  onRemove?: NotificationConfig;
}

export interface NotificationConfig {
  environments: string[];
  templateText: string;
  templateHtml: string;
}

export interface TargetConfig {
  type: string;
  idp: string;
}

export interface CssTargetConfig extends TargetConfig {
  type: 'css';
  name: string;
  id: number | string;
}

export interface GitHubTargetConfig extends TargetConfig {
  type: 'github';
}

export interface IntegrationConfig {
  // environments: string[];
  notifyEnvironments: string[];
  roles: RoleConfig[];
  target: CssTargetConfig | GitHubTargetConfig;
}

export interface IntegrationConfigTemplate
  extends Omit<IntegrationConfig, 'id' | 'environments'> {
  roleGenerators?: RoleGenerator[];
}

export type RoleGenerator = BrokerVertexRoleGenerator | SomethingRoleGenerator;

interface BaseRoleGenerator {
  roleMap: RoleConfig;
}

export interface BrokerVertexRoleGenerator extends BaseRoleGenerator {
  name: 'broker-vertex';
  collection: string;
  edge?: {
    name: string;
    target: string;
    property?: string;
  };
}

export interface SomethingRoleGenerator extends BaseRoleGenerator {
  name: 'something';
}

export interface IntegrationEnvironmentRoleUsersDataDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  attributes: any;
}

export interface IntegrationEnvironmentRoleUsersDto {
  page: number;
  data: IntegrationEnvironmentRoleUsersDataDto[];
}

export class UserSummary {
  constructor(public user: SourceUser) {}
  public addRoles: string[] = [];
  public delRoles: string[] = [];
}
