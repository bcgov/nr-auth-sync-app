# Auth Sync App

Auth Sync App takes user group and "privilege information" from federated source systems to grant roles in target systems. The code is designed to support adding new sources and target systems.

Auth Sync App does not setup the source systems or the target systems. You are responsible for creating any required accounts and setting up access for the Auth Sync App in those systems.

Auth Sync App does not directly grant user access. Instead, clients of the target systems are configured independely of interpret the role themselves. An OIDC target, for example, will have roles added or removed and those roles granted to users by Auth Sync App. It is up to the application to interpret the roles a user is granted appropriately. The client (application) may have its own tool (like the [Vault Sync App](https://github.com/bcgov-nr/vault-sync-app)) for managing on the application side of interpreting the roles received from OIDC.

### Supported Sources

Sources return a group of users for each role in the configuration.

* [Broker](https://bcgov-nr.github.io/nr-broker/#/)
* Static files

### Supported Targets

A target is kept in sync with the configured roles.

#### BC Gov Common Hosted Single Sign-on (CSS)

The CSS target lets you sync the roles and role membership of an integration.

To use this target, you must have a CSS API Account with access to the integration you want to manage.

See: [CSS Documentation](https://developer.gov.bc.ca/docs/default/component/css-docs/)

#### GitHub

The GitHub target lets you sync teams and team membership to a GitHub organization.

To use this target, you must have a fine-grained PAT with read and write access to members in the organization.

<!-- toc -->
* [Auth Sync App](#auth-sync-app)
* [Development](#development)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Running

The tool can be run from the source using Node.js or a container image by using Podman or Docker.

```
./bin/dev.js generate
```

```
podman run --rm ghcr.io/bcgov/nr-auth-sync-app:v1.0.0 generate
```

The sample command runs the [generate](#authtool-generate) command. All the commands will require authentication and configuration to function.

### Workflows

The general pattern is to call the following commands:

* [generate](#authtool-generate) - Create a configuration file from a template (if necessary)
* [role-sync](#authtool-role-sync) - Sync roles to target system
* [member-sync](#authtool-member-sync) - Sync membership in roles to target system

The monitor command can be used to automate running this workflow.

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
$ npm install -g nr-auth-sync-app
$ authtool COMMAND
running command...
$ authtool (--version)
nr-auth-sync-app/1.0.0 darwin-x64 node-v22.14.0
$ authtool --help [COMMAND]
USAGE
  $ authtool COMMAND
...
```
<!-- usagestop -->

The script in /bin/run.js can also run the code without installing it.

```sh-session
$ ./bin/run.js COMMAND
running command...
$ ./bin/run.js (-v|--version|version)
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
    [--source-broker-idp <value>] [--css-token-url <value>] [--css-client-id <value>] [--css-client-secret <value>]
    [--github-client-type <value>] [--github-app-id <value>] [--github-client-id <value>] [--github-client-secret
    <value>] [--github-private-key <value>] [--github-token <value>]

FLAGS
  -h, --help                          Show CLI help.
      --broker-api-url=<value>        [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>          The broker JWT
      --config-path=<value>           [default: ./config] The path to the config directory
      --css-client-id=<value>         [default: id] The css keycloak client id
      --css-client-secret=<value>     [default: password] The css keycloak client secret
      --css-token-url=<value>         [default: url] The css token url
      --github-app-id=<value>         [default: id] The GitHub app id
      --github-client-id=<value>      [default: id] The GitHub client id
      --github-client-secret=<value>  [default: password] The GitHub client secret
      --github-client-type=<value>    The GitHub client type
      --github-private-key=<value>    [default: key] The GitHub private key for signing requests
      --github-token=<value>          [default: token] A GitHub PAT
      --source-broker-idp=<value>     The idp to filter users to

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.28/src/commands/help.ts)_

## `authtool member-sync`

Syncs user and role configuration to CSS

```
USAGE
  $ authtool member-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--config-path <value>]
    [--notification-smtp-host <value>] [--notification-smtp-port <value>] [--notification-smtp-secure]
    [--notification-option-from <value>] [--notification-option-subject <value>] [--notification-option-template-text
    <value>] [--notification-option-template-html <value>] [--source-broker-idp <value>] [--css-token-url <value>]
    [--css-client-id <value>] [--css-client-secret <value>] [--github-client-type <value>] [--github-app-id <value>]
    [--github-client-id <value>] [--github-client-secret <value>] [--github-private-key <value>] [--github-token
    <value>]

FLAGS
  -h, --help                                       Show CLI help.
      --broker-api-url=<value>                     [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker
                                                   api base url
      --broker-token=<value>                       The broker JWT
      --config-path=<value>                        [default: ./config] The path to the config directory
      --css-client-id=<value>                      [default: id] The css keycloak client id
      --css-client-secret=<value>                  [default: password] The css keycloak client secret
      --css-token-url=<value>                      [default: url] The css token url
      --github-app-id=<value>                      [default: id] The GitHub app id
      --github-client-id=<value>                   [default: id] The GitHub client id
      --github-client-secret=<value>               [default: password] The GitHub client secret
      --github-client-type=<value>                 The GitHub client type
      --github-private-key=<value>                 [default: key] The GitHub private key for signing requests
      --github-token=<value>                       [default: token] A GitHub PAT
      --notification-option-from=<value>           The notification from address
      --notification-option-subject=<value>        [default: Your Access Report (nr-auth-sync-app)] The notification
                                                   subject
      --notification-option-template-html=<value>  The notification template in html
      --notification-option-template-text=<value>  The notification template in text
      --notification-smtp-host=<value>             The SMTP Host
      --notification-smtp-port=<value>             The SMTP port
      --notification-smtp-secure                   The SMTP secure flag
      --source-broker-idp=<value>                  The idp to filter users to

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
    [--notification-smtp-host <value>] [--notification-smtp-port <value>] [--notification-smtp-secure]
    [--notification-option-from <value>] [--notification-option-subject <value>] [--notification-option-template-text
    <value>] [--notification-option-template-html <value>] [--source-broker-idp <value>] [--css-token-url <value>]
    [--css-client-id <value>] [--css-client-secret <value>] [--github-client-type <value>] [--github-app-id <value>]
    [--github-client-id <value>] [--github-client-secret <value>] [--github-private-key <value>] [--github-token
    <value>]

FLAGS
  -h, --help                                       Show CLI help.
      --broker-api-url=<value>                     [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker
                                                   api base url
      --broker-token=<value>                       The broker JWT
      --config-path=<value>                        [default: ./config] The path to the config directory
      --css-client-id=<value>                      [default: id] The css keycloak client id
      --css-client-secret=<value>                  [default: password] The css keycloak client secret
      --css-token-url=<value>                      [default: url] The css token url
      --github-app-id=<value>                      [default: id] The GitHub app id
      --github-client-id=<value>                   [default: id] The GitHub client id
      --github-client-secret=<value>               [default: password] The GitHub client secret
      --github-client-type=<value>                 The GitHub client type
      --github-private-key=<value>                 [default: key] The GitHub private key for signing requests
      --github-token=<value>                       [default: token] A GitHub PAT
      --notification-option-from=<value>           The notification from address
      --notification-option-subject=<value>        [default: Your Access Report (nr-auth-sync-app)] The notification
                                                   subject
      --notification-option-template-html=<value>  The notification template in html
      --notification-option-template-text=<value>  The notification template in text
      --notification-smtp-host=<value>             The SMTP Host
      --notification-smtp-port=<value>             The SMTP port
      --notification-smtp-secure                   The SMTP secure flag
      --source-broker-idp=<value>                  The idp to filter users to

DESCRIPTION
  Monitor for auth changes to sync
```

## `authtool role-sync`

Syncs roles to CSS

```
USAGE
  $ authtool role-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--config-path <value>]
    [--source-broker-idp <value>] [--css-token-url <value>] [--css-client-id <value>] [--css-client-secret <value>]
    [--github-client-type <value>] [--github-app-id <value>] [--github-client-id <value>] [--github-client-secret
    <value>] [--github-private-key <value>] [--github-token <value>]

FLAGS
  -h, --help                          Show CLI help.
      --broker-api-url=<value>        [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>          The broker JWT
      --config-path=<value>           [default: ./config] The path to the config directory
      --css-client-id=<value>         [default: id] The css keycloak client id
      --css-client-secret=<value>     [default: password] The css keycloak client secret
      --css-token-url=<value>         [default: url] The css token url
      --github-app-id=<value>         [default: id] The GitHub app id
      --github-client-id=<value>      [default: id] The GitHub client id
      --github-client-secret=<value>  [default: password] The GitHub client secret
      --github-client-type=<value>    The GitHub client type
      --github-private-key=<value>    [default: key] The GitHub private key for signing requests
      --github-token=<value>          [default: token] A GitHub PAT
      --source-broker-idp=<value>     The idp to filter users to

DESCRIPTION
  Syncs roles to CSS

EXAMPLES
  $ authtool role-sync
```
<!-- commandsstop -->
