# Glowing Bear
[![Build Status](https://travis-ci.org/thehyve/glowing-bear.svg?branch=master)](https://travis-ci.org/thehyve/glowing-bear/branches)
[![codecov](https://codecov.io/gh/thehyve/glowing-bear/branch/dev/graph/badge.svg)](https://codecov.io/gh/thehyve/glowing-bear)

A frontend application for clinical data selection and analysis 
based on [TranSMART]. Visit https://glowingbear.app for more information.

This project is based on [Angular 6](https://github.com/angular/angular), 
[Angular CLI 6](https://github.com/angular/angular-cli) and 
[Yarn 1.9.4](https://github.com/yarnpkg/yarn/releases)


### How to install
* First, make sure the latest Angular CLI and Yarn are installed globally.

* Second, clone Glowing Bear's code and install its dependencies
    ```
    git clone https://github.com/thehyve/glowing-bear.git
    cd glowing-bear
    yarn
    ```


### How to run locally
We assume that a TranSMART backend has been installed and run,
either locally, e.g. on [localhost:8081](localhost:8081), 
or remotely, e.g. on https://transmart-dev.thehyve.net. 
For information on how to install and run TranSMART, 
please refer to its [documentation](https://github.com/thehyve/transmart-core).

* First, use the configuration for development 
by changing [env.json](src/app/config/env.json) to

    ```json
    {
      "env": "dev"
    }
    ```

* Second, modify [config.dev.json](src/app/config/config.dev.json) 
so that the `api-url` points to your running transmart instance.

    ```json
    {
      "api-url": "http://localhost:8081"
    }
    ```

* Third, run
    ```
    yarn start
    ```
    The app is run on `http://localhost:4200/` and 
    will automatically reload if you change any of the source files.



### How to build
`yarn build` (or `ng build`)

`yarn package` (or `ng build --prod`)

The build artifacts will be stored in the `dist/` directory.



### How to test
Run `yarn test` to execute the unit tests via [Karma], 
the generated coverage documents can be found in the `coverage/` folder.

For e2e test we use [Cypress] in combination with the [cypress-cucumber-preprocessor].
[Cypress] is install as part of the your `npm install` command. 
To run the tests using the headless browser `npm run e2e` or `npm run cypress` to launch the GUI.
by default the tests expect a glowing bear instance to be running at http://localhost:4200/. This can be changed in cypress.json
WARNING: tests alter state. All saved queries are deleted.



### How to deploy
We use Gradle to create bundles that are suitable for deployment:

```bash
# Create a tar bundle in build/distributions
gradle assemble

# Publish the bundle to Nexus
gradle publish
```

Published snapshot bundles are available in the `snapshots` repository
on https://repo.thehyve.nl with id `nl.thehyve:glowing-bear:0.0.1-SNAPSNOT:tar`.

Untar the archive in a directory where it can be served by a web server,
e.g. [Apache] or [nginx].



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
| `app-url`                 |           | URL where the Glowing Bear is accessible for the user.|
| `autosave-subject-sets`   | `false`   | Persist subject selection as subject set automatically. |
| `export-data-view`        | `default` | Shape of the export (`default`, `surveyTable`). |
| `show-observation-counts` | `true`    | |
| `instant-counts-update-1` | `false`   | |
| `instant-counts-update-2` | `false`   | |
| `instant-counts-update-3` | `false`   | |
| `authentication-service-type` | `oidc`  | Authentication service type (`oidc`, `transmart`) |
| `oidc-server-url`         |           | E.g., `https://keycloak.example.com/auth/realms/{realm}/protocol/openid-connect` |
| `oidc-client-id`          | `glowingbear-js` | |


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
