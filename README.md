# Auth Sync App

Auth Sync takes user group and "privilege information" from federated systems to grant users OIDC roles. The code is designed to support adding new sources and target systems.

It does not setup the client (aka applications or integrations). It is up to the application to interpret the roles a user is granted appropriately. The client (application) may have its own tool (like the [Vault Sync App](https://github.com/bcgov-nr/vault-sync-app)) for managing on the application side of interpreting the roles received from OIDC.

 ### Supported Sources

* [Broker](https://bcgov-nr.github.io/nr-broker/#/)
* Static files

 ### Supported Targets

* [BC Gov Common Hosted Single Sign-on (CSS)](https://developer.gov.bc.ca/docs/default/component/css-docs/)

<!-- toc -->
* [Auth Sync Tool](#auth-sync-tool)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Running

The tool can be run from the source using Node.js or a container image by using Podman or Docker.

```
./bin/dev generate
```

```
podman run --rm ghcr.io/bcgov-nr/auth-sync-app:v1.0.0 generate
```

The sample command runs the [generate](#authtool-generate) command. All the commands will require authentication and configuration to function.

### Workflows

The general pattern is to call the following commands:

* [generate](#authtool-generate) - Create the final configuration file from a template
* [role-sync](#authtool-role-sync) - Sync OIDC roles to target systems
* [member-sync](#authtool-member-sync) - Sync membership in OIDC roles to target systems

The monitor command can be used to run this workflow to run this workflow.

* [monitor](#authtool-monitor)

### Authentication

It is recommended to set all confidential parameters (such as tokens and secrets) using environment variables instead of using arguments. As an example, the argument 'broker-token' should always be configured with the environment variable 'BROKER_TOKEN'.

These can be found by looking in the [src/flags.ts](src/flags.ts) file.

A sample env file is provided. To setup for running the tool using a local dev environment, run the following command:

`source setenv-local.sh`

### Configuration

See: [Development](README-dev.md)

# Development

This document is aimed at developers looking to setup the Auth Sync Tool to run or make modifications to it.

See: [Development](README-dev.md)

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
