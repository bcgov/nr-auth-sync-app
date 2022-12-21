/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {inject, injectable} from 'inversify';
import {TYPES} from '../inversify.types';
import {Client} from 'ldapjs';

@injectable()
/**
 * LDAP Api
 */
export class LdapApi {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.LdapClient) private ldapClient: Client,
  ) {}

  /**
   * Get idirs for the group found using the filter and search base in ldap.
   */
  public async getGroupIdirs(filter: string, searchBase: string): Promise<string[] | undefined> {
    const idirs: string[] = [];
    const members: string[] | undefined = await new Promise((resolve) => {
      let members: string[] | undefined = undefined;
      this.ldapClient.search(searchBase, {
        filter,
        scope: 'sub',
        attributes: ['member'],
      }, (err: any, res: any) => {
        res.on('searchEntry', (entry: { object: { member: string[]; }; }) => {
          members = entry.object.member;
        });
        res.on('error', (err: any) => {
          throw err;
        });
        res.on('end', () => {
          resolve(members);
        });
      });
    });

    if (members) {
      for (const userCn of members) {
        const username = await this.getUsername(userCn);
        if (username) {
          idirs.push(username);
        }
      }
    }

    return idirs;
  }

  /**
   * Attempt to find a username based on the cn.
   * @param cn
   * @returns Promise<string
   */
  public getUsername(cn: string): Promise<string|undefined> {
    return new Promise((resolve) => {
      let username: string | undefined = undefined;
      this.ldapClient.search(cn, {
        attributes: ['sAMAccountName'],
      }, (err, res) => {
        res.on('searchEntry', (entry) => {
          username = (entry.object.sAMAccountName as string).toLowerCase();
        });
        res.on('error', (err) => {
          throw err;
        });
        res.on('end', () => {
          resolve(username);
        });
      });
    });
  }

  /**
   * Unbind (aka close) connection to ldap server.
   */
  public unbind(): void {
    this.ldapClient.unbind();
  }
}
