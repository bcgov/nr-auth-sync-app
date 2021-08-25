export interface AuthKeycloakRoleConfig {
  client: string;
  roles: string[];
}

export interface AuthLdapGroupKeycloakConfig {
  path: string[];
  role: AuthKeycloakRoleConfig[]
}

export interface AuthLdapGroupConfig {
  filter: string;
  group: AuthLdapGroupKeycloakConfig[]
}

export interface AuthLdapConfig {
  base: string;
  groups: AuthLdapGroupConfig[];
}

export interface AuthConfig {
  ldap: AuthLdapConfig;
  projects: string[];
}

/**
 * Service for configuration details
 */
export interface ConfigService {

  /**
   * Return ldap configuration.
   */
  getLdap(): Promise<AuthLdapConfig>;

  /**
   * Return enabled projects
   */
  getProjects(): Promise<string[]>;
}
