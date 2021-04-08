import {inject, injectable} from 'inversify';
import {TYPES} from '../../inversify.types';
import winston from 'winston';
import {ProjectGroup, ProjectSourceService} from '../project-source.service';

@injectable()
/**
 * A file based group import implementation
 */
export class ProjectSourceJiraService implements ProjectSourceService {
  /**
   * @param filePath The path to a JSON file to import from.
   */
  constructor(
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}


  /**
   * Returns an array of projects.
   */
  async getProjects(): Promise<string[]> {
    // TODO: Return list of projects
    return [];
  }

  /**
   * Returns an array of Scopes/Groups.
   */
  async getGroups(projectName: string): Promise<ProjectGroup[]> {
    // TODO: Return list of groups
    this.logger.info(projectName);
    return [];
  }
}
