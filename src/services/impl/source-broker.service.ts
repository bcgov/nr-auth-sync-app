import { inject, injectable } from 'inversify';
import { SourceService, SourceUser } from '../source.service.js';
import { TYPES } from '../../inversify.types.js';
import { RoleMemberConfig } from '../../types.js';
import { isBrokerRoleMemberConfig } from '../../util/config.util.js';
import { BrokerApi } from '../../broker/broker.api.js';

@injectable()
/**
 * Service for getting group users from broker
 */
export class SourceBrokerService implements SourceService {
  /**
   * Construct the Broker source service
   */
  constructor(
    @inject(TYPES.BrokerApi) private readonly brokerApi: BrokerApi,
    @inject(TYPES.SourceBrokerIdp)
    private readonly sourceBrokerIdp: string,
  ) {}
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
        'email',
        'name',
        'alias',
      ]);

      return response
        .filter(
          (collection) =>
            this.sourceBrokerIdp === '' ||
            collection.domain === this.sourceBrokerIdp,
        )
        .map((collection) => ({
          guid: collection.guid,
          domain: collection.domain,
          email: collection.email,
          name: collection.name,
          ...(collection.alias
            ? { alias: { github: collection.alias[0].username } }
            : {}),
        }));
    } else {
      const response = await this.brokerApi.getVertexUpstreamUser(
        config.broker as string,
        config.brokerUpstreamEdge?.join(),
      );
      return response
        .filter(
          (up) =>
            this.sourceBrokerIdp === '' ||
            up.collection.domain === this.sourceBrokerIdp,
        )
        .map((up) => ({
          guid: up.collection.guid,
          domain: up.collection.domain,
          email: up.collection.email,
          name: up.collection.name,
          ...(up.collection.alias
            ? { alias: { github: up.collection.alias[0].username } }
            : {}),
        }));
    }
  }
}
