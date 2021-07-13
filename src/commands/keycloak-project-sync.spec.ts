import 'reflect-metadata';
import KeycloakDevSync from './keycloak-project-sync';
import {mocked} from 'ts-jest/utils';
import {bindKeycloak, bindJira, vsContainer} from '../inversify.config';

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
      syncProjectSources: jest.fn().mockResolvedValue('bob'),
    };

    const mockBindKeycloak = mocked(bindKeycloak);
    mockBindKeycloak.mockResolvedValue();

    const mockBindJira = mocked(bindJira);
    mockBindJira.mockReturnValue();

    const mockVsContainer = mocked(vsContainer);
    mockVsContainer.get.mockReturnValueOnce(mockKcInstance);

    // Test command
    await KeycloakDevSync.run([
      'group-name',
      '--keycloak-addr', 'kaddr',
      '--keycloak-realm', 'realm',
      '--keycloak-client-id', 'clientId',
      '--keycloak-client-secret', 'clientSecret',
      '--jira-host', 'jaddr',
      '--jira-base-url', 'jbase',
      '--jira-username', 'jusername',
      '--jira-password', 'jpassword',
    ]);

    expect(mockBindKeycloak).toBeCalledTimes(1);
    expect(mockBindKeycloak).toBeCalledWith('kaddr', 'realm', 'clientId', 'clientSecret');

    expect(mockBindJira).toBeCalledTimes(1);
    expect(mockBindJira).toBeCalledWith('jaddr', 'jbase', 'jusername', 'jpassword');

    expect(mockKcInstance.syncProjectSources).toBeCalledTimes(1);
    expect(mockKcInstance.syncProjectSources).toBeCalledWith('group-name');

    expect(stdoutSpy).toHaveBeenCalledWith('Syncing project \'group-name\' in Keycloak.\n');
  });
});
