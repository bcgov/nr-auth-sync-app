import 'reflect-metadata';
import KeycloakSync from './keycloak-sync';
import {mocked} from 'ts-jest/utils';
import {bindKeycloak, bindJira, bindLdap, vsContainer} from '../inversify.config';

jest.mock('../inversify.config');

describe('group sync command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const mockBindJira = mocked(bindJira);
    mockBindJira.mockReturnValue();

    const mockBindLdap = mocked(bindLdap);
    mockBindLdap.mockResolvedValue();

    const mockVsContainer = mocked(vsContainer);
    mockVsContainer.get.mockReturnValueOnce(mockKcInstance);

    // Test command
    await KeycloakSync.run([
      '--keycloak-addr', 'kaddr',
      '--keycloak-realm', 'realm',
      '--keycloak-client-id', 'clientId',
      '--keycloak-client-secret', 'clientSecret',
      '--jira-host', 'jaddr',
      '--jira-base-url', 'jbase',
      '--jira-username', 'jusername',
      '--jira-password', 'jpassword',
      '--ldap-url', 'jbase',
      '--ldap-username', 'jusername',
      '--ldap-password', 'jpassword',
    ]);

    expect(mockBindKeycloak).toBeCalledTimes(1);
    expect(mockBindKeycloak).toBeCalledWith('kaddr', 'realm', 'clientId', 'clientSecret');

    expect(mockBindJira).toBeCalledTimes(1);
    expect(mockBindJira).toBeCalledWith('jaddr', 'jbase', 'jusername', 'jpassword');

    expect(mockBindLdap).toBeCalledTimes(1);
    expect(mockBindLdap).toBeCalledWith('jbase', 'jusername', 'jpassword');

    expect(mockKcInstance.syncSources).toBeCalledTimes(1);

    expect(stdoutSpy).toHaveBeenCalledWith('Syncing to Keycloak.\n');
  });
});
