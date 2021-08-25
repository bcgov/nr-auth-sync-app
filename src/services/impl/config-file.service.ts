import * as fs from 'fs';
import * as path from 'path';
import {injectable} from 'inversify';
import {AuthConfig, AuthLdapConfig, ConfigService} from '../config.service';

@injectable()
/**
 * Service for configuration details
 */
export class ConfigFileService implements ConfigService {
  private static readonly policyFilePath
    = path.join(__dirname, '../../../config', 'auth.json');
  private static readonly config
    = JSON.parse(fs.readFileSync(ConfigFileService.policyFilePath, 'UTF8')) as AuthConfig;

  /**
   * Return ldap configuration.
   */
  getLdap(): Promise<AuthLdapConfig> {
    return Promise.resolve(ConfigFileService.config.ldap);
  }

  /**
   * Return enabled projects
   */
  getProjects(): Promise<string[]> {
    return Promise.resolve(ConfigFileService.config.projects);
  }
}
