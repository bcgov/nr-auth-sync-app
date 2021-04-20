# Vault Sync Tool #

The Vault Sync tool or VST is for generating and syncing vault policies, groups and appRoles.


<!-- toc -->
* [Vault Sync Tool #](#vault-sync-tool-)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Environment Variables

The tool can use the following environment variables in place of command arguments. The default is in the brackets.

* VAULT_ADDR - The address of the vault server ('http://127.0.0.1:8200')
* VAULT_TOKEN - The token to use when connecting to vault (myroot)

* KEYCLOAK_ADDR - The address of the keycloak server ('http://127.0.0.1:8080')
* KEYCLOAK_USERNAME - The username to use when connecting to Keycloak (admin)
* KEYCLOAK_PASSWORD - The password to use when connecting to Keycloak (password)


## Supported npm commands

* npm start - deploy configuration to provided vault instance
* npm run lint - lint source code
* npm run test - Run unit tests
* npm run e2e - Run end-to-end tests

## Configuration

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/x/m4FvBQ)

## Local testing

The following will start up vault in docker. The default environment variables should work with it.

`docker run --rm --cap-add=IPC_LOCK -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' --name=dev-vault -p 8200:8200 vault`

You will need to add a oidc authentication method to do local testing of group syncs.

`vault auth enable oidc`
`vault auth enable approle`

The following will start up keycloak in docker. The default environment variables should work with it.

`docker run -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=password jboss/keycloak`

# Usage
<!-- usage -->
```sh-session
$ npm install -g authtool
$ authtool COMMAND
running command...
$ authtool (-v|--version|version)
authtool/1.0.0 linux-x64 node-v12.20.0
$ authtool --help [COMMAND]
USAGE
  $ authtool COMMAND
...
```
<!-- usagestop -->

The script in /bin/run can also run the code without installing it.

```sh-session
$ ./bin/run COMMAND
running command...
$ ./bin/run (-v|--version|version)
...
```

# Commands
<!-- commands -->
* [`authtool help [COMMAND]`](#authtool-help-command)
* [`authtool keycloak-project-sync [PROJECTNAME]`](#authtool-keycloak-project-sync-projectname)

## `authtool help [COMMAND]`

display help for authtool

```
USAGE
  $ authtool help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `authtool keycloak-project-sync [PROJECTNAME]`

Syncs project to Keycloak

```
USAGE
  $ authtool keycloak-project-sync [PROJECTNAME]

OPTIONS
  -h, --help                                       show CLI help
  --jira-base-url=jira-base-url                    [default: /int/jira] The Jira Base URL
  --jira-host=jira-host                            [default: bwa.nrs.gov.bc.ca] The Jira host
  --jira-password=jira-password                    [default: password] The Jira password
  --jira-username=jira-username                    [default: admin] The Jira user
  --keycloak-addr=keycloak-addr                    [default: http://127.0.0.1:8080/auth] The keycloak address
  --keycloak-client-id=keycloak-client-id          [default: admin] The keycloak client ID
  --keycloak-client-secret=keycloak-client-secret  [default: password] The keycloak client secret
  --keycloak-realm=keycloak-realm                  [default: master] The keycloak realm
```
<!-- commandsstop -->
