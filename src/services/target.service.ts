import { SourceUser } from './source.service';

export interface Integration {
  id: number | string;
  name: string;
  environments: string[];
}

/**
 * Service for interfacing with target
 */
export interface TargetService {
  getIntegrations(): Promise<Integration[]>;
  getIntegrationEnvironmentRoles(
    id: string | number,
    environment: string,
  ): Promise<string[]>;
  addIntegrationEnvironmentRole(
    id: string | number,
    environment: string,
    role: string,
  ): Promise<void>;
  deleteIntegrationEnvironmentRole(
    id: string | number,
    environment: string,
    role: string,
  ): Promise<void>;
  alterIntegrationRoleUser(
    integrationId: string | number,
    environment: string,
    roleName: string,
    operation: 'add' | 'del',
    users: SourceUser[],
  ): Promise<void>;
  getRoleUsers(
    id: string | number,
    environment: string,
    idp: string,
    roleName: string,
  ): Promise<Map<string, SourceUser>>;
  /**
   * Returns an array of users.
   */
  // getUsers(roleConfig: RoleMemberConfig): Promise<string[]>;
}
