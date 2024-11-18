import axios, { AxiosRequestConfig } from 'axios';
import { inject, injectable } from 'inversify';
import { TYPES } from '../inversify.types.js';
import { VertexSearchDto } from './dto/vertex-rest.dto.js';
import { UpstreamResponseDto } from './dto/broker-upstream-response.dto.js';

// Define a type that maps an array of keys to an object where those keys are the properties
type ObjectWithKeys<K extends string> = {
  [key in K]: string; // Replace 'any' with the specific type of the values if known
};

@injectable()
/**
 *
 */
export class BrokerApi {
  private axiosOptions!: AxiosRequestConfig;

  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.BrokerApiUrl) private readonly brokerApi: string,
    @inject(TYPES.BrokerToken) private readonly brokerToken: string,
  ) {
    this.setToken();
  }

  public setToken() {
    this.axiosOptions = {
      baseURL: this.brokerApi,
      headers: {
        Authorization: `Bearer ${this.brokerToken}`,
      },
    };
  }

  public async searchVertices(
    collection: string,
    edgeName?: string,
    edgeTarget?: string,
  ): Promise<VertexSearchDto[]> {
    const response = await axios.post(
      `v1/graph/vertex/search?collection=${collection}` +
        (edgeName !== undefined && edgeTarget !== undefined
          ? `&edgeName=${edgeName}&edgeTarget=${edgeTarget}`
          : ''),
      {},
      this.axiosOptions,
    );
    return response.data;
  }

  public async exportCollection<K extends string>(
    collection: string,
    fields: K[],
  ): Promise<ObjectWithKeys<K>[]> {
    const response = await axios.post(
      `v1/collection/${collection}/export?${fields.map((field) => `fields=${field}`).join('&')}`,
      {},
      this.axiosOptions,
    );
    return response.data;
  }

  public async getVertexUpstreamUser(
    id: string,
  ): Promise<UpstreamResponseDto[]> {
    return (
      await axios.post(
        `v1/graph/vertex/${id}/upstream/4`,
        {},
        this.axiosOptions,
      )
    ).data;
  }
}
