import KeycloakAdminClient from 'keycloak-admin';

let keycloak: KeycloakAdminClient;
let keycloakAuthPromise: Promise<any>;

/**
 * Keycloak api factory
 * @param addr The keycloak server address
 * @param realm The keycloak realm
 * @param clientId The keycloak client ID
 * @param clientSecret The keycloak client secret
 */
export async function keycloakFactory(
  addr: string,
  realm: string,
  clientId: string,
  clientSecret: string): Promise<KeycloakAdminClient> {
  if (!keycloakAuthPromise) {
    keycloak = new KeycloakAdminClient({
      baseUrl: addr,
      realmName: realm,
    });

    keycloakAuthPromise = keycloak.auth({
      clientSecret,
      grantType: 'client_credentials',
      clientId,
    });
  }
  await keycloakAuthPromise;
  return keycloak;
}
