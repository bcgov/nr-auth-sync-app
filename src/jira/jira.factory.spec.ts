import JiraApi from 'jira-client';
import {mocked} from 'ts-jest/utils';
import {jiraFactory} from './jira.factory';

const mockJiraApiObj = {api: 'api'};

jest.mock('jira-client', () => {
  return jest.fn().mockImplementation(() => {
    return mockJiraApiObj;
  });
});

describe('jira.factory', () => {
  afterEach(() => jest.restoreAllMocks());

  it('Returns a Jira client', () => {
    const mockJiraApi = mocked(JiraApi);

    // Test command
    const rVal = jiraFactory('host', 'basePath', 'username', 'password');

    expect(mockJiraApi).toBeCalledTimes(1);
    expect(mockJiraApi).toBeCalledWith({
      protocol: 'https',
      host: 'host',
      base: 'basePath',
      username: 'username',
      password: 'password',
      apiVersion: '2',
      strictSSL: true,
    });
    expect(rVal).toEqual(mockJiraApiObj);
  });
});
