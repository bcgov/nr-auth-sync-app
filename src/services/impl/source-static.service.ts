import {injectable} from 'inversify';
import {SourceService} from '../source.service';


@injectable()
/**
<<<<<<< HEAD
 * Service for getting staic group users
=======
 * Service for getting static group users
>>>>>>> 0dca13f5f16b4497dd36ee3b0238936fb7735e4d
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
