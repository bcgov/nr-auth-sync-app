import {inject, injectable, optional} from 'inversify';
import axios from 'axios';
import {SourceService} from '../source.service';
import {UpstreamResponseDto} from './broker-upstream-response.dto';
import {TYPES} from '../../inversify.types';
import {RoleMemberConfig} from '../../css/css.types';
import { isBrokerRoleMemberConfig } from '../../util/config.util';

@injectable()
/**
 * Service for getting group users from broker
 */
export class SourceBrokerService implements SourceService {
  /**
   * Construct the Broker source service
   */
  constructor(
    @optional() @inject(TYPES.BrokerApiUrl) private brokerApiUrl: string,
    @optional() @inject(TYPES.BrokerToken) private brokerToken: string,
  ) { }
  /**
   * Returns an array of users.
   */
  public async getUsers(config: RoleMemberConfig): Promise<string[]> {
    if (!isBrokerRoleMemberConfig(config) || !this.brokerToken) {
      return Promise.resolve([]);
    }
    const response: UpstreamResponseDto[] =
      (await axios.post(
        `${this.brokerApiUrl}v1/graph/vertex/${config.broker}/upstream/4`,
        {},
        {headers: {Authorization: `Bearer ${this.brokerToken}`}})
      ).data;
    return response.map((up) => up.collection.email);
  }
}
