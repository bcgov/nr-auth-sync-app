import { RoleMemberConfig } from '../css/css.types';

/**
 * Service for getting role data based on the implementing service.
 */
export interface SourceService {
  /**
   * Returns an array of users.
   */
  getUsers(roleConfig: RoleMemberConfig): Promise<string[]>;
}
