import {injectable} from 'inversify';
import {OutletGroupRoles, OutletService} from '../outlet.service';
import {ProjectGroup} from '../project-source.service';

@injectable()
/**
 * The Vault outlet service informs what groups and roles to create for it.
 */
export class OutletVaultService implements OutletService {
  /**
   * Returns the client name
   */
  getClientName(): string {
    return 'vault';
  }

  /**
   * Maps a project group to a group and the application roles to associate with that group
   */
  getProjectMapping(projectGroup: ProjectGroup): OutletGroupRoles[] {
    switch (projectGroup.archetype) {
    case 'developer':
    case 'developer-lead':
      return [{
        group: {
          path: ['developers', `${projectGroup.projectName}-developers`],
        },
        roles: [`${projectGroup.projectName}-developer`],
      }];
    default:
      throw new Error('Archetype not implemented.');
    }
  }
}
