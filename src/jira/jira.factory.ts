import JiraApi from 'jira-client';

/**
 * Jira API factory
 * @param host The Jira address
 * @param basePath The base url
 * @param username The Jira username
 * @param password The Jira password
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
