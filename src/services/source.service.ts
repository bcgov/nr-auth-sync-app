import { RoleMemberConfig } from '../types.js';

export interface SourceUser {
  guid: string;
  domain: string;
  name?: string;
  email?: string;
  alias?: {
    github: string;
  };
}

/**
 * Service for getting role data based on the implementing service.
 */
export interface SourceService {
  /**
   * Returns an array of users.
   */
  getUsers(roleConfig: RoleMemberConfig): Promise<SourceUser[]>;
}
