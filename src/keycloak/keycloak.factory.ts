import KeycloakAdminClient from 'keycloak-admin';

let keycloak: KeycloakAdminClient;
let keycloakAuthPromise: Promise<KeycloakAdminClient>;

/**
 * Keycloak api factory
 * @param addr The keycloak server address
 * @param realm The keycloak realm
 * @param clientId The keycloak client ID
 * @param clientSecret The keycloak client secret
 */
export function keycloakFactory(
  addr: string,
  realm: string,
  clientId: string,
  clientSecret: string): Promise<KeycloakAdminClient> {
  if (!keycloak) {
    keycloak = new KeycloakAdminClient({
      baseUrl: addr,
      realmName: realm,
    });

    keycloakAuthPromise = keycloak.auth({
      clientSecret,
      grantType: 'client_credentials',
      clientId,
    }).then(() => keycloak);
  }
  return keycloakAuthPromise;
}
