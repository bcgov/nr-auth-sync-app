import KeycloakAdminClient from 'keycloak-admin';
import 'reflect-metadata';
import winston from 'winston';
import {KeycloakApi} from './keycloak.api';

describe('keycloak.api', () => {
  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getClientByName: returns client when found', async () => {
    const clients = [
      {clientId: 'BOB'},
      {clientId: 'bob'},
      {clientId: 'sam'},
    ];

    const mockKeycloakAdminClient = {
      clients: {
        find: jest.fn(() => clients),
      },
    } as unknown as KeycloakAdminClient;

    const keycloakApi = new KeycloakApi(mockKeycloakAdminClient, mockLogger);

    const rVal = await keycloakApi.getClientByName('bob');
    expect(mockKeycloakAdminClient.clients.find).toBeCalledTimes(1);
    expect(rVal).toBe(clients[1]);
  });

  it('getClientByName: returns undefined when client not found', async () => {
    const mockKeycloakAdminClient = {
      clients: {
        find: jest.fn(() => []),
      },
    } as unknown as KeycloakAdminClient;

    const keycloakApi = new KeycloakApi(mockKeycloakAdminClient, mockLogger);

    const rVal = await keycloakApi.getClientByName('bob');
    expect(mockKeycloakAdminClient.clients.find).toBeCalledTimes(1);
    expect(rVal).toBe(undefined);
  });

  it('getUser: returns user when found', async () => {
    const fakeUsers = [
      {clientId: 'bob@idir', test: 'me'},
      {clientId: 'bob@idir', test: 'two'},
    ];

    const mockKeycloakAdminClient = {
      users: {
        find: jest.fn(() => fakeUsers),
      },
    } as unknown as KeycloakAdminClient;

    const keycloakApi = new KeycloakApi(mockKeycloakAdminClient, mockLogger);

    const rVal = await keycloakApi.getUser('bob');
    expect(mockKeycloakAdminClient.users.find).toBeCalledTimes(1);
    expect(mockKeycloakAdminClient.users.find).toBeCalledWith({
      username: 'bob@idir',
    });
    expect(rVal).toBe(fakeUsers[0]);
  });

  it('getGroupByName: returns group when found', async () => {
    const fakeGroups = [
      {name: 'me'},
      {name: 'bob'},
    ];

    const mockKeycloakAdminClient = {
      groups: {
        find: jest.fn(() => fakeGroups),
      },
    } as unknown as KeycloakAdminClient;

    const keycloakApi = new KeycloakApi(mockKeycloakAdminClient, mockLogger);

    const rVal = await keycloakApi.getGroupByName('bob');
    expect(mockKeycloakAdminClient.groups.find).toBeCalledTimes(1);
    expect(rVal).toBe(fakeGroups[1]);
  });

  it('getGroupByName: returns undefined when group not found', async () => {
    const fakeGroups = [
      {name: 'me'},
      {name: 'bob'},
    ];

    const mockKeycloakAdminClient = {
      groups: {
        find: jest.fn(() => fakeGroups),
      },
    } as unknown as KeycloakAdminClient;

    const keycloakApi = new KeycloakApi(mockKeycloakAdminClient, mockLogger);

    const rVal = await keycloakApi.getGroupByName('flkjlfe');
    expect(mockKeycloakAdminClient.groups.find).toBeCalledTimes(1);
    expect(rVal).toBe(undefined);
  });

  // Notes: Treats getGroupByName as a private call
  it('getSubgroupByName: returns group when found', async () => {
    const fakeGroups = [
      {name: 'me', subGroups: [{}]},
      {name: 'bob', subGroups: [{name: 'sue'}, {name: 'sam'}]},
    ];

    const mockKeycloakAdminClient = {
      groups: {
        find: jest.fn(() => fakeGroups),
      },
    } as unknown as KeycloakAdminClient;

    const keycloakApi = new KeycloakApi(mockKeycloakAdminClient, mockLogger);

    const rVal = await keycloakApi.getSubgroupByName('bob', 'sam');
    expect(mockKeycloakAdminClient.groups.find).toBeCalledTimes(1);
    expect(rVal).toBe(fakeGroups[1].subGroups[1]);
  });

  // Notes: Treats getGroupByName as a private call
  it('getSubgroupByName: returns undefined when group not found', async () => {
    const fakeGroups = [
      {name: 'me', subGroups: [{}]},
      {name: 'bob', subGroups: [{name: 'sam'}]},
    ];

    const mockKeycloakAdminClient = {
      groups: {
        find: jest.fn(() => fakeGroups),
      },
    } as unknown as KeycloakAdminClient;

    const keycloakApi = new KeycloakApi(mockKeycloakAdminClient, mockLogger);

    let rVal = await keycloakApi.getSubgroupByName('flkjlfe', 'sam');
    expect(mockKeycloakAdminClient.groups.find).toBeCalledTimes(1);
    expect(rVal).toBe(undefined);

    rVal = await keycloakApi.getSubgroupByName('bob', 'fwefew');
    expect(mockKeycloakAdminClient.groups.find).toBeCalledTimes(2);
    expect(rVal).toBe(undefined);
  });
});
