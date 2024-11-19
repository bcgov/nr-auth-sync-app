import { IntegrationConfig } from '../types.js';
import { SourceUser } from './source.service.js';

export interface Integration {
  id: number | string;
  name: string;
  environments: string[];
}

/**
 * Service for interfacing with target
 */
export interface TargetService {
  /**
   * Return the integrations (installations) that the target account has access to
   */
  getIntegrations(): Promise<Integration[]>;
  getIntegration(config: IntegrationConfig): Promise<Integration | undefined>;
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
    integrationConfig: IntegrationConfig,
    targetId: string | number,
    environment: string,
    roleName: string,
    operation: 'add' | 'del',
    users: SourceUser[],
  ): Promise<SourceUser[]>;
  getRoleUsers(
    id: string | number,
    environment: string,
    idp: string,
    roleName: string,
  ): Promise<Map<string, SourceUser>>;
  resetUserCache(all: boolean): Promise<void>;
}
