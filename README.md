# GlowingBear
[![Build Status](https://travis-ci.org/thehyve/glowing-bear.svg?branch=master)](https://travis-ci.org/thehyve/glowing-bear/branches)
[![codecov](https://codecov.io/gh/thehyve/glowing-bear/branch/dev/graph/badge.svg)](https://codecov.io/gh/thehyve/glowing-bear)

A cohort selection user interface for [TranSMART].


## Development

This project was generated with [Angular CLI] version 1.0.0.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma], run `ng test --code-coverage` to test with generated coverage documents, which are located in the coverage folder.

### Running end-to-end tests

For e2e test we use [Cypress] in combination with the [cypress-cucumber-preprocessor].
[Cypress] is install as part of the your `npm install` command. 
To run the tests using the headless browser `npm run e2e` or `npm run cypress` to launch the GUI.
by default the tests expect a glowing bear instance to be running at http://localhost:4200/. This can be changed in cypress.json
WARNING: tests alter state. All saved queries are deleted.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


## Publishing

We use Gradle to create bundles that are suitable for deployment:
```bash
# Create a tar bundle in build/distributions
gradle assemble

# Publish the bundle to Nexus
gradle publish
```

## Deployment

Published snapshot bundles are available in the `snapshots` repository
on https://repo.thehyve.nl with id `nl.thehyve:glowing-bear:0.0.1-SNAPSNOT:tar`.

Untar the archive in a directory where it can be served by a web server,
e.g., [Apache] or [nginx].

### Configuration

The application can be configured by changing the `env.json` and `config.*.json`
files in `app/config`.

Example `env.json`:
```json
{
  "env": "default"
}
```
Example `config.prod.json`:
```json
{
  "api-url": "https://transmart.thehyve.net",
  "api-version": "v2",
  "app-url": "https://glowingbear.thehyve.net",
  "tree-node-counts-update": true,
  "autosave-subject-sets": false
}
```

Supported properties in the `config.*.json` files:

| Property                  | Default   | Description |
|:------------------------- |:--------- |:----------- |
| `api-url`                 |           | URL of the TranSMART API to connect to. |
| `api-version`             | `v2`      | TranSMART API version. Only `v2` is supported. |
| `app-url`                 |           | URL where the Glowing Bear is accessible for the user. |
| `tree-node-counts-update` | `true`    | Fetch counts for study nodes in step 2 of Data Selection. |
| `autosave-subject-sets`   | `false`   | Persist subject selection as subject set automatically. |
| `export-data-view`        | `default` | Shape of the export (`default`, `surveyTable`). |
| `show-observation-counts` | `true`    | |
| `instant-counts-update-1` | `false`   | |
| `instant-counts-update-2` | `false`   | |
| `instant-counts-update-3` | `false`   | |
| `authentication-service-type` | `oidc`  | Authentication service type (`oidc`, `transmart`) |
| `oidc-server-url`         |           | E.g., `https://keycloak.example.com/auth/realms/{realm}/protocol/openid-connect` |
| `oidc-client-id`          | `glowingbear-js` | |
| `api-type`                | `transmart` | API type to use (`transmart` or `picsure`) |
| `picsure-resource-name`   |           | Name of the PIC-SURE resource to use if relevant (e.g. `i2b2-local`) |
| `enable-query-saving`     | `true`    | Enable query saving feature |
| `enable-variable-selection` | `true`  | Enable variable selection step |
| `enable-data-table`       | `true`    | Enable data table step |
| `enable-analysis`         | `true`    | Enable analysis features |
| `enable-export`           | `true`    | Enable data export features |
| `force-i2b2-nesting-style` | `false`  | Enforce the AND/OR i2b2 query format (if `false`, format is free) |
| `enable-greedy-tree-loading` | `true` | Enable greedy tree loading (load whole tree at startup) | 

## License

Copyright &copy; 2017&ndash;2018 &nbsp; The Hyve B.V.

This program is free software: you can redistribute it and/or modify
it under the terms of the [Mozilla Public License 2.0](LICENSE).

You should have received a copy of the license along with this program. 
If not, see https://opensource.org/licenses/MPL-2.0.


[tranSMART]: https://github.com/thehyve/transmart-core
[Angular CLI]: https://github.com/angular/angular-cli
[Protractor]: http://www.protractortest.org
[Karma]: https://karma-runner.github.io
[cucumber-js]: https://github.com/cucumber/cucumber-js
[nginx]: https://nginx.org
[Apache]: https://httpd.apache.org
[Cypress]: https://www.cypress.io/
[cypress-cucumber-preprocessor]: https://github.com/TheBrainFamily/cypress-cucumber-preprocessor
