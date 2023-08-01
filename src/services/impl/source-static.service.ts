import { injectable } from 'inversify';
import { SourceService } from '../source.service';
import { isStaticRoleMemberConfig } from '../../util/config.util';
import { RoleMemberConfig } from '../../css/css.types';

@injectable()
/**
 * Service for getting static group users
 */
export class SourceStaticService implements SourceService {
  /**
   * Returns an array of Scopes/Groups.
   */
  public getUsers(config: RoleMemberConfig): Promise<string[]> {
    if (!isStaticRoleMemberConfig(config)) {
      return Promise.resolve([]);
    }
    return Promise.resolve(config.static);
  }
}
