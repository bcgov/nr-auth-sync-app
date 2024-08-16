import { SourceUser } from './services/source.service';

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
}

export interface StaticRoleMemberConfig extends BaseRoleMemberConfig {
  static: SourceUser[];
}

export interface RoleConfig {
  group?: string;
  name: string;
  members: RoleMemberConfig;
}

export interface IntegrationConfig {
  name: string;
  idp: string;
  id: number | string;
  environments: string[];
  roles: RoleConfig[];
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
