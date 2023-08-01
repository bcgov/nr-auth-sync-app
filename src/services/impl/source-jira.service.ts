import { inject, injectable, optional } from 'inversify';
import JiraApi from 'jira-client';
import axios from 'axios';
import { TYPES } from '../../inversify.types';
import { SourceService } from '../source.service';
import { RoleMemberConfig } from '../../css/css.types';
import { isJiraRoleMemberConfig } from '../../util/config.util';

interface Project {
  name: string;
}

@injectable()
/**
 * Service for getting group data based on a project in Jira.
 */
export class SourceJiraService implements SourceService {
  /**
   * Construct the Jira source service
   */
  constructor(
    @optional() @inject(TYPES.JiraClient) private jira: JiraApi,
    @optional() @inject(TYPES.JiraUsername) private jiraUsername: string,
    @optional() @inject(TYPES.JiraPassword) private jiraPassword: string,
  ) {}

  /**
   * Returns an array of Scopes/Groups.
   */
  public async getUsers(config: RoleMemberConfig): Promise<string[]> {
    if (!isJiraRoleMemberConfig(config)) {
      return [];
    }
    const jiraArray = Array.isArray(config.jira) ? config.jira : [config.jira];
    const users: string[] = [];
    for (const jira of jiraArray) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const project = await this.getProject(jira.project);
      for (const group of jira.groups) {
        users.push(...(await this.getUsersInGroup(group)));
      }
    }
    return users;
  }

  /**
   * Returns the Jira project
   * @param projectName The key of the project to fetch
   */
  private async getProject(projectName: string): Promise<Project> {
    const project = await this.jira.getProject(projectName);
    return {
      name: (project.key as string).toLowerCase(),
    };
  }

  /**
   * Returns a list group of users in a group
   * @param groupName The key of the project
   */
  private async getUsersInGroup(groupName: string): Promise<string[]> {
    // eslint-disable-next-line -- No typing available for Jira objects

    try {
      const users: string[] = await this.jira
        .getUsersInGroup(groupName)
        .then((data) => data.users.items.map((obj: any) => obj.key));
      return Promise.all(
        users.map(async (user) => {
          return (
            await axios.get(
              `https://bwa.nrs.gov.bc.ca/int/jira/rest/api/2/user?key=${user}`,
              {
                responseEncoding: 'utf8',
                headers: {
                  'Accept-Encoding': 'identity',
                },
                auth: {
                  username: this.jiraUsername,
                  password: this.jiraPassword,
                },
              },
            )
          ).data.emailAddress.toLowerCase();
        }),
      );
    } catch (e) {
      // No group?
      return Promise.resolve([]);
    }
  }
}
