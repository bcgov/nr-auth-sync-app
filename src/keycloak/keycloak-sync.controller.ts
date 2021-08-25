import {inject, injectable, multiInject} from 'inversify';
import {TYPES} from '../inversify.types';
import {ProjectGroup, ProjectSourceService} from '../services/project-source.service';
import winston from 'winston';
import {OutletService} from '../services/outlet.service';
import {KeycloakApi} from './keycloak.api';
import {ReplaySubject} from 'rxjs';
import {mergeMap, groupBy, reduce} from 'rxjs/operators';
import {ConfigService} from '../services/config.service';
import {LdapApi} from '../ldap/ldap.api';

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
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.LdapApi) private ldapApi: LdapApi,
    @inject(TYPES.KeycloakApi) private keycloakApi: KeycloakApi,
    @inject(TYPES.Logger) private logger: winston.Logger,
    @multiInject(TYPES.OutletService) private outletServices: OutletService[],
    @multiInject(TYPES.ProjectSourceService) private projectSourceServices: ProjectSourceService[],
  ) {}

  /**
   * Sync sources of truth to Keycloak
   */
  public async syncSources(): Promise<void> {
    const groupUserSubject = new ReplaySubject<GroupUsers>();
    const groupClientRoleSubject = new ReplaySubject<GroupClientRoles>();

    for (const projectName of await this.config.getProjects()) {
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
    }

    await this.syncLdapGroups(groupUserSubject, groupClientRoleSubject);

    // Explicit unbind to disconnect from ldap
    this.ldapApi.unbind();

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
   * Sync project group to the subjects
   * @param group The group to sync
   * @param groupUserSubject The subject collecting user info
   * @param groupClientRoleSubject The subject collecting client role info
   */
  public async syncProjectGroup(group: ProjectGroup,
    groupUserSubject: ReplaySubject<{id: string; users: string[]}>,
    groupClientRoleSubject: ReplaySubject<{id: string; name: string; roles: string[];}>): Promise<void> {
    this.logger.debug(`syncProjectGroup: ${group.name}`);

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

  /**
   * Sync ldap groups to the subjects
   * @param groupUserSubject The subject collecting user info
   * @param groupClientRoleSubject The subject collecting client role info
   */
  public async syncLdapGroups(
    groupUserSubject: ReplaySubject<{id: string; users: string[]}>,
    groupClientRoleSubject: ReplaySubject<{id: string; name: string; roles: string[];}>): Promise<void> {
    const ldapConfig = await this.config.getLdap();

    for (const groups of ldapConfig.groups) {
      const members = await this.ldapApi.getGroupIdirs(groups.filter, ldapConfig.base);

      this.logger.debug(
        `LDAPTLS_REQCERT=never ldapsearch -H ${process.env.LDAP_URL as string || 'ldaps://idir.bcgov'} -x ` +
        `-D ${process.env.LDAP_USERNAME as string} -W -b "${ldapConfig.base}" "${groups.filter}" member`);
      if (members) {
        for (const group of groups.group) {
          const devGroup = await this.keycloakApi.makeGroups(group.path[0], group.path[1]);
          if (devGroup.id) {
            groupUserSubject.next({id: devGroup.id, users: members});
            groupClientRoleSubject.next({
              id: devGroup.id,
              name: group.role[0].client,
              roles: group.role[0].roles,
            });
          }
        }
      }
      // console.log(members);
    }
  }
}
