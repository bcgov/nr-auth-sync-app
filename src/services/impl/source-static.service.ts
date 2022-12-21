import {injectable} from 'inversify';
import {SourceService} from '../source.service';


@injectable()
/**
 * Service for getting staic group users
 */
export class SourceStaticService implements SourceService {
  /**
   * Returns an array of Scopes/Groups.
   */
  public getUsers(roleConfig: any): Promise<string[]> {
    if (!roleConfig?.members?.static) {
      return Promise.resolve([]);
    }
    return roleConfig.members.static;
  }
}
