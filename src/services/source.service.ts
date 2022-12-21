/**
 * Service for getting role data based on the implementing service.
 */
export interface SourceService {
  /**
   * Returns an array of users.
   */
  getUsers(roleConfig: any): Promise<string[]>;
}
