import { injectable } from 'inversify';
import { SourceService, SourceUser } from '../source.service';
import { isStaticRoleMemberConfig } from '../../util/config.util';
import { RoleMemberConfig } from '../../types';

@injectable()
/**
 * Service for getting static group users
 */
export class SourceStaticService implements SourceService {
  /**
   * Returns an array of users.
   */
  public getUsers(config: RoleMemberConfig): Promise<SourceUser[]> {
    if (!isStaticRoleMemberConfig(config)) {
      return Promise.resolve([]);
    }
    return Promise.resolve(config.static);
  }
}
