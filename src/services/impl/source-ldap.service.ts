import {inject, injectable, optional} from 'inversify';
import {TYPES} from '../../inversify.types';
import {SourceService} from '../source.service';
import {LdapApi} from '../../ldap/ldap.api';

@injectable()
/**
 * Service for getting group data based on a group in ldap.
 */
export class SourceLdapService implements SourceService {
  /**
   * Construct the Jira source service
   */
  constructor(
    @optional() @inject(TYPES.LdapApi) private ldap: LdapApi,
  ) { }

  /**
   * Returns an array of Scopes/Groups.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async getUsers(roleConfig: any): Promise<string[]> {
    if (!roleConfig?.members?.ldap) {
      return [];
    }
    return [];
  }
}
