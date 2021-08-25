/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {Client} from 'ldapjs';
import 'reflect-metadata';
import winston from 'winston';
import {LdapApi} from './ldap.api';


describe('ldap.api', () => {
  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getGroupIdirs', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resCbDict: any = {};
    const res = {
      on: jest.fn((cbName, cb) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        resCbDict[cbName] = cb;
      }),
    };
    const mockClient = {
      search: jest.fn((searchBase, options, cb) => {
        expect(searchBase).toBe('base');
        expect(options.filter).toBe('filter');
        expect(options.scope).toBe('sub');
        expect(options.attributes).toEqual(['member']);

        cb(null, res);
      }),
    } as unknown as Client;

    const api = new LdapApi(mockClient, mockLogger);
    jest.spyOn(api, 'getUsername').mockResolvedValue('username');

    const idirPromise = api.getGroupIdirs('filter', 'base');

    resCbDict['searchEntry']({
      object: {
        member: ['wfelIOOFk'],
      },
    });

    resCbDict['end']();

    const idirs = await idirPromise;
    expect(idirs).toEqual(['username']);
  });

  it('getUsername', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resCbDict: any = {};
    const res = {
      on: jest.fn((cbName, cb) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        resCbDict[cbName] = cb;
      }),
    };
    const mockClient = {
      search: jest.fn((searchBase, options, cb) => {
        expect(searchBase).toBe('filter');
        expect(options.attributes).toEqual(['sAMAccountName']);

        cb(null, res);
      }),
    } as unknown as Client;

    const api = new LdapApi(mockClient, mockLogger);
    const idirPromise = api.getUsername('filter');

    resCbDict['searchEntry']({
      object: {
        sAMAccountName: 'wfelIOOFk',
      },
    });

    resCbDict['end']();

    const idirs = await idirPromise;
    expect(idirs).toEqual('wfelioofk');
  });

  it('unbind', () => {
    const mockClient = {
      unbind: jest.fn(),
    } as unknown as Client;

    const api = new LdapApi(mockClient, mockLogger);
    api.unbind();
    expect(mockClient.unbind).toHaveBeenCalled();
  });
});
