import 'reflect-metadata';
import KeycloakGroupSync from './keycloak-group-sync';
import {mocked} from 'ts-jest/utils';
import {bindKeycloak, vsContainer} from '../inversify.config';

jest.mock('../inversify.config');

describe('group sync command', () => {
  let stdoutSpy: any;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });
  afterEach(() => jest.restoreAllMocks());

  it('runs', async () => {
    const mockKcInstance = {
      syncSources: jest.fn().mockResolvedValue('bob'),
    };

    const mockBindKeycloak = mocked(bindKeycloak);
    mockBindKeycloak.mockResolvedValue();

    const mockVsContainer = mocked(vsContainer);
    mockVsContainer.get.mockReturnValueOnce(mockKcInstance);

    // Test command
    await KeycloakGroupSync.run([
      'group-name',
      '--keycloak-addr', 'kaddr',
      '--keycloak-username', 'user',
      '--keycloak-password', 'pass'],
    );

    expect(mockBindKeycloak).toBeCalledTimes(1);
    expect(mockBindKeycloak).toBeCalledWith('kaddr', 'user', 'pass');
    expect(mockKcInstance.syncSources).toBeCalledTimes(1);
    expect(mockKcInstance.syncSources).toBeCalledWith('group-name');

    expect(stdoutSpy).toHaveBeenCalledWith('Creating group \'group-name\' in Keycloak.\n');
  });
});
