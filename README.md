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

For e2e test we use [Protractor] in combination with the [cucumber-js] framework.
To install protractor run `npm install -g protractor`. 
To run the tests you need to have an up to dated version of chrome installed and the TranSMART application running, by default on `localhost:8080`.
To run all tests: `protractor`.
To run specific feature files: `protractor --specs=e2e/features/name-of.feature`.

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
  "env": "prod"
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
| `authentication-method`   | `oauth2`  | Authentication method (`oauth2`, `oidc`) |
| `oidc-server-url`         |           | E.g., `https://keycloak.example.com/auth/realms/{realm}` |
| `oidc-scopes`             | `openid`  | |
| `oidc-client-id`          | `glowingbear-js` | |


## License

Copyright &copy; 2017&ndash;2018 &nbsp; The Hyve B.V.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the [GNU General Public License](LICENSE)
along with this program. If not, see https://www.gnu.org/licenses/.


[tranSMART]: https://github.com/thehyve/transmart-core
[Angular CLI]: https://github.com/angular/angular-cli
[Protractor]: http://www.protractortest.org
[Karma]: https://karma-runner.github.io
[cucumber-js]: https://github.com/cucumber/cucumber-js
[nginx]: https://nginx.org
[Apache]: https://httpd.apache.org
