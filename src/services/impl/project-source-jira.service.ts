import {inject, injectable} from 'inversify';
import {TYPES} from '../../inversify.types';
import winston from 'winston';
import {Project, ProjectGroup, ProjectSourceService} from '../project-source.service';
import JiraApi from 'jira-client';

@injectable()
/**
 * Service for getting group data based on a project in Jira.
 */
export class ProjectSourceJiraService implements ProjectSourceService {
  /**
   * @param filePath The path to a JSON file to import from.
   */
  constructor(
    @inject(TYPES.JiraClient) private jira: JiraApi,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) { }

  /**
   * Returns the Jira project
   * @param projectName The key of the project to fetch
   */
  public async getProject(projectName: string): Promise<Project> {
    const project = await this.jira.getProject(projectName);
    return {
      name: (project.key as string).toLowerCase(),
    };
  }

  /**
   * Returns an array of projects.
   */
  public async getProjects(): Promise<Project[]> {
    // TODO: Return list of projects
    return Promise.resolve([]);
  }

  /**
   * Returns an array of Scopes/Groups.
   */
  public async getGroups(project: Project): Promise<ProjectGroup[]> {
    const devGroupName = `${project.name}-developers`;
    const leadDevGroupName = `${project.name}-lead-developers`;
    return [
      {
        archetype: 'developer',
        name: devGroupName,
        projectName: project.name,
        users: await this.getUsersInGroup(devGroupName),
      },
      {
        archetype: 'developer-lead',
        name: leadDevGroupName,
        projectName: project.name,
        users: await this.getUsersInGroup(leadDevGroupName),
      },
    ];
  }

  /**
   * Returns a list group of users in a group
   * @param groupName The key of the project
   */
  private async getUsersInGroup(groupName: string): Promise<string[]> {
    // eslint-disable-next-line -- No typing available for Jira objects
    return this.jira.getUsersInGroup(groupName).then((data) => data.users.items.map((obj: any) => obj.key));
  }
}
