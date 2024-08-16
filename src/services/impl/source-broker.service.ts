import { inject, injectable } from 'inversify';
import { SourceService, SourceUser } from '../source.service';
import { TYPES } from '../../inversify.types';
import { RoleMemberConfig } from '../../types';
import { isBrokerRoleMemberConfig } from '../../util/config.util';
import { BrokerApi } from '../../broker/broker.api';

@injectable()
/**
 * Service for getting group users from broker
 */
export class SourceBrokerService implements SourceService {
  /**
   * Construct the Broker source service
   */
  constructor(@inject(TYPES.BrokerApi) private readonly brokerApi: BrokerApi) {}
  /**
   * Returns an array of users.
   */
  public async getUsers(config: RoleMemberConfig): Promise<SourceUser[]> {
    if (!isBrokerRoleMemberConfig(config)) {
      return Promise.resolve([]);
    }
    if (config.broker === 'all') {
      const response = await this.brokerApi.exportCollection('user', [
        'domain',
        'guid',
      ]);

      return response
        .filter((collection) => collection.domain === 'azureidir')
        .map((collection) => ({
          guid: collection.guid,
          domain: collection.domain,
        }));
    } else {
      const response = await this.brokerApi.getVertexUpstreamUser(
        config.broker,
      );
      return response
        .filter((up) => up.collection.domain === 'azureidir')
        .map((up) => ({
          guid: up.collection.guid,
          domain: up.collection.domain,
        }));
    }
  }
}
