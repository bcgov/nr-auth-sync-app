/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import ldap from 'ldapjs';
import {mocked} from 'ts-jest/utils';
import {ldapFactory} from './ldap.factory';

const mockBindImplementation = jest.fn().mockImplementation((username, password, callback) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  callback();
});
const mockLdapObj = {
  bind: mockBindImplementation,
};

jest.mock('ldapjs', () => {
  return {
    createClient: jest.fn(),
  };
});

describe('ldap.factory', () => {
  afterEach(() => jest.restoreAllMocks());

  it('Returns a Ldap client', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mockLdapApi = mocked(ldap);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockLdapApi.createClient.mockReturnValue(mockLdapObj as any);

    // Test command
    const rVal = await ldapFactory('url', 'username', 'password');

    expect(mockLdapApi.createClient).toBeCalledTimes(1);
    expect(mockLdapApi.createClient).toBeCalledWith({
      url: ['url'],
      tlsOptions: {
        rejectUnauthorized: false,
      },
    });
    expect(rVal).toEqual({
      bind: mockBindImplementation,
    });
    expect(mockBindImplementation).toBeCalledTimes(1);
    expect(mockBindImplementation).toBeCalledWith('username', 'password', expect.any(Function));
  });
});
