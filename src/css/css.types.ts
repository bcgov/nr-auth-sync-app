

export interface OutletMap {
  [key: string]: Set<string>;
}

export interface IntegrationOutletMap {
  [key: string]: OutletMap;
}

export type RoleMemberConfig = BrokerRoleMemberConfig | JiraRoleMemberConfig | StaticRoleMemberConfig;

interface BaseRoleMemberConfig {
  copy?: string[];
  exclude?: string[];
}

export interface BrokerRoleMemberConfig extends BaseRoleMemberConfig {
  broker: string;
}

export interface JiraRoleMemberConfig extends BaseRoleMemberConfig {
  jira: {
    project: string;
    groups: string[];
  }
}

export interface StaticRoleMemberConfig extends BaseRoleMemberConfig {
  static: string[];
}

export interface RoleConfig {
  group?: string;
  name: string;
  members: RoleMemberConfig;
}

export interface IntegrationRoles {
  name: string;
  idp: string;
  roleGenerators?: RoleGenerator[];
  roles: RoleConfig[];
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
  }
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
