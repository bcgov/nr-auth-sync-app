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

## Build with Podman

```
podman build . -t auth-sync-app
```

The built container can be substituted for the released container.

