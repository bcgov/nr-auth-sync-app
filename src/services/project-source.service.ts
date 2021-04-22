/**
 * Project group details
 */
export interface ProjectGroup {
  archetype: 'developer' | 'developer-lead'
  name: string;
  projectName: string;
  users: string[];
}


export interface Project {
  name: string;
}

/**
 * Service for getting group data based on a project in the implementing service.
 */
export interface ProjectSourceService {
  /**
   * Returns a project
   * @param projectName
   */
  getProject(projectName: string): Promise<Project>;

  /**
   * Returns an array of projects.
   */
  getProjects(): Promise<Project[]>;

  /**
   * Returns an array of Scopes/Groups.
   */
  getGroups(project: Project): Promise<ProjectGroup[]>;
}
