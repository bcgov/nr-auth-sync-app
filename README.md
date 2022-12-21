# Auth Sync Tool

The auth sync tool takes user group and "privilege information" from federated systems to generate client roles and group membership (and what roles those groups have) in CSS (KeyCloak).

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/x/LpZvBQ)


<!-- toc -->
* [Auth Sync Tool](#auth-sync-tool)
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
$ authtool (--version)
authtool/1.0.0 darwin-x64 node-v16.17.1
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
* [`authtool member-sync`](#authtool-member-sync)
* [`authtool role-sync`](#authtool-role-sync)

## `authtool help [COMMAND]`

Display help for authtool.

```
USAGE
  $ authtool help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for authtool.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.19/src/commands/help.ts)_

## `authtool member-sync`

Syncs Developers from Jira projects to Css

```
USAGE
  $ authtool member-sync [-h] [--css-token-url <value>] [--css-client-id <value>] [--css-client-secret <value>]
    [--jira-host <value>] [--jira-base-url <value>] [--jira-username <value>] [--jira-password <value>]

FLAGS
  -h, --help                   show CLI help
  --css-client-id=<value>      [default: id] The css keycloak client id
  --css-client-secret=<value>  [default: password] The css keycloak client secret
  --css-token-url=<value>      [default: url] The css token url
  --jira-base-url=<value>      [default: /int/jira] The Jira Base URL
  --jira-host=<value>          [default: bwa.nrs.gov.bc.ca] The Jira host
  --jira-password=<value>      [default: password] The Jira password
  --jira-username=<value>      [default: admin] The Jira user

DESCRIPTION
  Syncs Developers from Jira projects to Css

EXAMPLES
  $ authtool member-sync
```

## `authtool role-sync`

Syncs roles to Css

```
USAGE
  $ authtool role-sync [-h] [--css-token-url <value>] [--css-client-id <value>] [--css-client-secret <value>]

FLAGS
  -h, --help                   show CLI help
  --css-client-id=<value>      [default: id] The css keycloak client id
  --css-client-secret=<value>  [default: password] The css keycloak client secret
  --css-token-url=<value>      [default: url] The css token url

DESCRIPTION
  Syncs roles to Css

EXAMPLES
  $ authtool role-sync
```
<!-- commandsstop -->
