# Auth Sync Tool

The auth sync tool takes user group and "privilege information" from federated systems to generate client roles and group membership (and what roles those groups have) in CSS (KeyCloak).
The auth sync runs everyday at 3PM.

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
authtool/1.0.0 darwin-x64 node-v20.11.1
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
* [`authtool generate`](#authtool-generate)
* [`authtool help [COMMAND]`](#authtool-help-command)
* [`authtool member-sync`](#authtool-member-sync)
* [`authtool monitor`](#authtool-monitor)
* [`authtool role-sync`](#authtool-role-sync)

## `authtool generate`

Generates configuration file from template.

```
USAGE
  $ authtool generate [-h] [--broker-api-url <value>] [--broker-token <value>] [--config-path <value>]
    [--css-token-url <value>] [--css-client-id <value>] [--css-client-secret <value>] [--source-broker-idp <value>]

FLAGS
  -h, --help                       Show CLI help.
      --broker-api-url=<value>     [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>       The broker JWT
      --config-path=<value>        [default: ./config] The path to the config directory
      --css-client-id=<value>      [default: id] The css keycloak client id
      --css-client-secret=<value>  [default: password] The css keycloak client secret
      --css-token-url=<value>      [default: url] The css token url
      --source-broker-idp=<value>  The idp to filter users to

DESCRIPTION
  Generates configuration file from template.

EXAMPLES
  $ authtool generate
```

## `authtool help [COMMAND]`

Display help for authtool.

```
USAGE
  $ authtool help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for authtool.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.8/src/commands/help.ts)_

## `authtool member-sync`

Syncs user and role configuration to CSS

```
USAGE
  $ authtool member-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--config-path <value>]
    [--css-token-url <value>] [--css-client-id <value>] [--css-client-secret <value>]

FLAGS
  -h, --help                       Show CLI help.
      --broker-api-url=<value>     [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>       The broker JWT
      --config-path=<value>        [default: ./config] The path to the config directory
      --css-client-id=<value>      [default: id] The css keycloak client id
      --css-client-secret=<value>  [default: password] The css keycloak client secret
      --css-token-url=<value>      [default: url] The css token url

DESCRIPTION
  Syncs user and role configuration to CSS

EXAMPLES
  $ authtool member-sync
```

## `authtool monitor`

Monitor for auth changes to sync

```
USAGE
  $ authtool monitor [-h] [--broker-api-url <value>] [--broker-token <value>] [--config-path <value>]
    [--css-token-url <value>] [--css-client-id <value>] [--css-client-secret <value>] [--source-broker-idp <value>]

FLAGS
  -h, --help                       Show CLI help.
      --broker-api-url=<value>     [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>       The broker JWT
      --config-path=<value>        [default: ./config] The path to the config directory
      --css-client-id=<value>      [default: id] The css keycloak client id
      --css-client-secret=<value>  [default: password] The css keycloak client secret
      --css-token-url=<value>      [default: url] The css token url
      --source-broker-idp=<value>  The idp to filter users to

DESCRIPTION
  Monitor for auth changes to sync
```

## `authtool role-sync`

Syncs roles to CSS

```
USAGE
  $ authtool role-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--config-path <value>]
    [--css-token-url <value>] [--css-client-id <value>] [--css-client-secret <value>] [--source-broker-idp <value>]

FLAGS
  -h, --help                       Show CLI help.
      --broker-api-url=<value>     [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>       The broker JWT
      --config-path=<value>        [default: ./config] The path to the config directory
      --css-client-id=<value>      [default: id] The css keycloak client id
      --css-client-secret=<value>  [default: password] The css keycloak client secret
      --css-token-url=<value>      [default: url] The css token url
      --source-broker-idp=<value>  The idp to filter users to

DESCRIPTION
  Syncs roles to CSS

EXAMPLES
  $ authtool role-sync
```
<!-- commandsstop -->
