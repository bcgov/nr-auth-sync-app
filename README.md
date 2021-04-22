# Auth Sync Tool #

The auth sync tool takes user group and "privilege information" from federated systems to generate client roles and group membership (and what roles those groups have) in KeyCloak.

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/x/LpZvBQ)


<!-- toc -->
* [Auth Sync Tool #](#auth-sync-tool-)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Supported npm commands

* npm start - deploy configuration to provided vault instance
* npm run lint - lint source code
* npm run test - Run unit tests
# Usage
<!-- usage -->
```sh-session
$ npm install -g authtool
$ authtool COMMAND
running command...
$ authtool (-v|--version|version)
authtool/1.0.0 win32-x64 node-v12.16.2
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
