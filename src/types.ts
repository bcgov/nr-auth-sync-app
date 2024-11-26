import { Type } from 'class-transformer';
import { SourceUser } from './services/source.service.js';

export interface OutletMap {
  [key: string]: Set<string>;
}

export interface IntegrationOutletMap {
  [key: string]: OutletMap;
}

// export type RoleMemberConfig = BrokerRoleMemberConfig & StaticRoleMemberConfig;

export class RoleMemberConfig {
  copy?: string[];
  exclude?: string[];
  broker?: string;
  brokerUpstreamEdge?: string[];
  static?: SourceUser[];
}

export class NotificationConfig {
  environments!: string[];
  templateText!: string;
  templateHtml!: string;
}

export class RoleConfig {
  group?: string;
  name!: string;
  @Type(() => RoleMemberConfig)
  members!: RoleMemberConfig;
  @Type(() => NotificationConfig)
  onAdd?: NotificationConfig;
  @Type(() => NotificationConfig)
  onRemove?: NotificationConfig;
  parentName?: string;
  description?: string;
}

export class RoleSpec {
  constructor(
    public name: string,
    public parentName?: string,
    public description?: string,
  ) {}
}

export class TargetConfig {
  type!: string;
  idp!: string;
}

export class CssTargetConfig extends TargetConfig {
  type!: 'css';
  name!: string;
  id!: number | string;
}

export class GitHubTargetConfig extends TargetConfig {
  type!: 'github';
  org!: string;
  parentSlug!: string;
  allowRegex!: string;
}

export class IntegrationConfig {
  // environments: string[];
  @Type(() => String)
  notifyEnvironments!: string[];
  @Type(() => RoleConfig)
  roles!: RoleConfig[];
  @Type(() => TargetConfig, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: CssTargetConfig, name: 'css' },
        { value: GitHubTargetConfig, name: 'github' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  target!: CssTargetConfig | GitHubTargetConfig;
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
