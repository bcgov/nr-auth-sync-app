import {inject, injectable, multiInject} from 'inversify';
import {TYPES} from '../inversify.types';
import {ProjectGroup, ProjectSourceService} from '../services/project-source.service';
import winston from 'winston';
import {OutletService} from '../services/outlet.service';
import {KeycloakApi} from './keycloak.api';
import {ReplaySubject} from 'rxjs';
import {mergeMap, groupBy, reduce} from 'rxjs/operators';

interface GroupUsers {
  id: string; users: string[]
}

interface GroupClientRoles {
  id: string;
  name: string;
  roles: string[];
}
@injectable()
/**
 * Keycloak controller
 */
export class KeycloakSyncController {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.KeycloakApi) private keycloakApi: KeycloakApi,
    @inject(TYPES.Logger) private logger: winston.Logger,
    @multiInject(TYPES.OutletService) private outletServices: OutletService[],
    @multiInject(TYPES.ProjectSourceService) private projectSourceServices: ProjectSourceService[],
  ) {}

  /**
   * Sync project sources of truth to Keycloack
   * @param projectName The name of the Keycloak Role / Vault Group.
   */
  public async syncProjectSources(projectName: string) {
    this.logger.debug(`syncProjectSources: ${projectName}`);
    const groupUserSubject = new ReplaySubject<GroupUsers>();
    const groupClientRoleSubject = new ReplaySubject<GroupClientRoles>();

    for (const projectSourceService of this.projectSourceServices) {
      const project = await projectSourceService.getProject(projectName);

      if (!project) {
        throw new Error('Project does not exist');
      }
      const groups = await projectSourceService.getGroups(project);

      for (const group of groups) {
        await this.syncProjectGroup(group, groupUserSubject, groupClientRoleSubject);
      }
    }

    groupUserSubject.pipe(
      groupBy((p) => p.id),
      mergeMap((group$) => group$.pipe(reduce<GroupUsers, GroupUsers>((acc, cur) => ({
        id: cur.id,
        users: [...new Set([...acc.users, ...cur.users])],
      }), {id: 'null', users: []}),
      )),
      mergeMap(async (p) => {
        await this.keycloakApi.syncGroupUsers(p.id, p.users);
        return p;
      }, 3),
    ).subscribe();

    groupClientRoleSubject.pipe(
      groupBy((p) => `${p.id}//${p.name}`),
      mergeMap((group$) => group$.pipe(reduce<GroupClientRoles, GroupClientRoles>((acc, cur) => ({
        id: cur.id,
        name: cur.name,
        roles: [...new Set([...acc.roles, ...cur.roles])],
      }), {id: 'null', name: '', roles: []}),
      )),
      mergeMap(async (p) => {
        await this.keycloakApi.syncGroupClientRoles(p.id, p.name, p.roles);
        return p;
      }, 3),
    ).subscribe();

    groupUserSubject.complete();
    groupClientRoleSubject.complete();
  }

  /**
   * Sync project group to all outlet applications
   * @param group The group to sync
   */
  public async syncProjectGroup(group: ProjectGroup,
    groupUserSubject: ReplaySubject<{id: string; users: string[]}>,
    groupClientRoleSubject: ReplaySubject<{id: string; name: string; roles: string[];}>) {
    this.logger.debug(`syncProjectGroup: ${group.name}`);

    // does the group already exist?
    // if so, then delete the members and add the current members
    for (const outletService of this.outletServices) {
      const clientName = outletService.getClientName();
      for (const mappedGroupRole of outletService.getProjectMapping(group)) {
        const groupPath = mappedGroupRole.group.path;
        const devGroup = await this.keycloakApi.makeGroups(groupPath[0], groupPath[1]);

        if (devGroup.id) {
          groupUserSubject.next({id: devGroup.id, users: group.users});
          groupClientRoleSubject.next({id: devGroup.id, name: clientName, roles: mappedGroupRole.roles});
        }
      }
    }
  }
}
