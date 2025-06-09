# Auth Sync Tool - Development

Back: [README.md](README.md)

This document is aimed at developers looking to setup the Auth Sync Tool to run or make modifications to it.

See: [Oclif CLI](https://oclif.io)

## Requirements

* Podman
* Node.js

## Supported NPM commands

* npm run build - Build js files in dist (required for pack)
* npm run lint - lint source code
* npm run test - Run unit tests
* npm run pack - Build and update CLI README

## Getting Started

First, checkout the code. Next run, npm i to install the npm packages. The Oclif CLI is not intended to be installed locally or uploaded to npm. The "run" scripts in /bin should be used to invoke the tool. These run the tool directly from the source.

## Build with Podman

```
podman build . -t nr-auth-sync-app
```

The built container can be substituted for the released container.

## Configure Debug Statements

The tool will not output much output by default. The console output can be tuned by setting the `DEBUG` environment variable.

```
DEBUG=* ./bin/dev.js member-sync
DEBUG=oclif:* ./bin/dev.js member-sync
DEBUG=*Controller\|*Service ./bin/dev.js member-sync
```
