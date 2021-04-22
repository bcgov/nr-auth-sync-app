import {ProjectGroup} from './project-source.service';

interface OutletGroup {
  path: string[];
}

export interface OutletGroupRoles {
  group: OutletGroup;
  roles: string[];
}

/**
 * An outlet service informs what groups and roles to create for an application.
 */
export interface OutletService {
  /**
   * Returns the client name
   */
  getClientName(): string;

  /**
   * Maps a project group to a group and the application roles to associate with that group
   */
  getProjectMapping(projectGroup: ProjectGroup): OutletGroupRoles[];
}
