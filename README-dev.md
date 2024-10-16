# Auth Sync Tool - Development

Back: [README.md](README.md)

This document is aimed at developers looking to setup the Auth Sync Tool to run or make modifications to it.

See: [Oclif CLI](https://oclif.io)

## Requirements

* Podman
* Node.js

## Supported NPM commands

* npm run lint - lint source code
* npm run test - Run unit tests
* npm run prepack - Build and update CLI README

## Getting Started

First, checkout the code. Next run, npm i to install the npm packages. The Oclif CLI is not intended to be installed locally or uploaded to npm. The "run" scripts in /bin should be used to invoke the tool. These run the tool directly from the source.

## Build with Podman

```
podman build . -t auth-sync-app
```

The built container can be substituted for the released container.

## Configuration

