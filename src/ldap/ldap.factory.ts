import ldap from 'ldapjs';

/**
 * The LDAP factory
 * @param url The LDAP address
 * @param username The LDAP username
 * @param password The LDAP password
 * @returns Promise<ldap.Client>
 */
export async function ldapFactory(url: string, username: string, password: string): Promise<ldap.Client> {
  const client: ldap.Client = ldap.createClient({
    url: [url],
    tlsOptions: {
      // Needed as .bcgov is not a real url
      rejectUnauthorized: false,
    },
  });

  // Wrap callback in promise
  return await new Promise((resolve) => {
    client.bind(username, password, () => {
      resolve(client);
    });
  });
}
