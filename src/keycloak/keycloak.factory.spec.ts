import KeycloakAdminClient from 'keycloak-admin';
import {mocked} from 'ts-jest/utils';
import {keycloakFactory} from './keycloak.factory';

jest.mock('keycloak-admin');

describe('keycloak.factory', () => {
  afterEach(() => jest.restoreAllMocks());

  it('Returns a keycloak admin client', async () => {
    const mockKeyClient = mocked(KeycloakAdminClient);
    const mockKeyClientInstance = {
      auth: jest.fn().mockResolvedValue('true'),
    } as unknown as KeycloakAdminClient;
    mockKeyClient.mockImplementation(() => {
      return mockKeyClientInstance;
    });

    // Test command
    const rVal = await keycloakFactory('addr', 'realm', 'clientId', 'clientSecret');

    expect(mockKeyClient).toBeCalledTimes(1);
    expect(mockKeyClient).toBeCalledWith({
      baseUrl: 'addr',
      realmName: 'realm',
    });

    expect(mockKeyClientInstance.auth).toBeCalledWith({
      clientSecret: 'clientSecret',
      grantType: 'client_credentials',
      clientId: 'clientId',
    });
    expect(rVal).toEqual(mockKeyClientInstance);
  });
});
