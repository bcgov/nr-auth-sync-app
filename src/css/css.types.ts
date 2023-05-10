

export interface OutletMap {
  [key: string]: Set<string>;
}

export interface IntegrationOutletMap {
  [key: string]: OutletMap;
}

export interface RoleMemberConfig {
  copy?: string[];
  exclude?: string[];
  jira?: {
    project: string;
    groups: string[];
  }
  static?: string[];
  [key: string]: unknown;
}

export interface RoleConfig {
  group: string;
  name: string;
  members: RoleMemberConfig;
}

export interface IntegrationRoles {
  name: string;
  idp: string;
  roles: RoleConfig[];
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
