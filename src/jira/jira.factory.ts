import JiraApi from 'jira-client';

/**
 * Jira API factory
 * @param host
 * @param basePath
 * @param username
 * @param password
 * @returns
 */
export function jiraFactory(host: string, basePath: string, username: string, password: string): JiraApi {
  return new JiraApi({
    protocol: 'https',
    host,
    base: basePath,
    username,
    password,
    apiVersion: '2',
    strictSSL: true,
  });
}
