/**
 * Application details
 */
export interface ProjectGroup {
  archetype: 'developer' | 'developer-lead'
  name: string;
  users: string[];
}

/**
 * Service for getting group data based on
 */
export interface ProjectSourceService {
  /**
   * Returns an array of projects.
   */
  getProjects(): Promise<string[]>;

  /**
   * Returns an array of Scopes/Groups.
   */
  getGroups(projectName: string): Promise<ProjectGroup[]>;
}
