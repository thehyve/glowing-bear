/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class AppConfigMock {
  config: Object = null;
  private env: Object = null;
  loaded = true;
  error: string = null;

  constructor() {
    this.config = {
      'api-version': 'v2',
      'api-url': 'https://transmart.example.com',
      'gb-backend-url': 'https://gb-backend.example.com',
      'fractalis-url': 'https://fractalis.example.com',
      'fractalis-datasource-service': 'transmart-example-service',
      'enable-fractalis-analysis': true,
      'authentication-service-type': 'transmart',
      'export-mode': {
        'name': 'transmart',
        'data-view': 'dataTable'
      },
    };
  }

  get version() {
    return '0.0.1-test';
  }

  public getConfig(key: any) {
    return this.config[key];
  }

  public getEnv(key: any) {
    return 'default';
  }

  get isLoaded(): boolean {
    return this.loaded;
  }

  get configError(): string {
    return this.error;
  }

  load() {}
}

export class OidcConfigMock {
  private config: Object = null;
  private env: Object = {};

  constructor() {
    this.config = {
      'api-version': 'v2',
      'api-url': 'https://transmart.example.com',
      'fractalis-url': 'https://fractalis.example.com',
      'fractalis-datasource-service': 'transmart-example-service',
      'authentication-service-type': 'oidc',
      'oidc-server-url': 'https://keycloak.example.com/auth/realms/transmart-dev/protocol/openid-connect',
      'oidc-client-id': 'transmart-client'
    };
  }

  get version() {
    return '0.0.1-test';
  }

  public getConfig(key: any) {
    return this.config[key];
  }

  public getEnv(key: any) {
    return this.env[key];
  }

  get isLoaded(): boolean {
    return true;
  }

  load() {}
}

export class AppConfigPackerMock {
  private config: Object = null;
  private env: Object = null;

  constructor() {
    this.config = {
      'api-version': 'v2',
      'api-url': 'https://transmart.example.com',
      'gb-backend-url': 'https://gb-backend.example.com',
      'fractalis-url': 'https://fractalis.example.com',
      'fractalis-datasource-service': 'transmart-example-service',
      'authentication-service-type': 'transmart',
      'export-mode': {
        'name': 'packer',
        'export-url': 'http://foo.bar',
        'data-view': 'basic-packer-export'
      },
    };
  }

  get version() {
    return '0.0.1-test';
  }

  public getConfig(key: any) {
    return this.config[key];
  }


  public getEnv(key: any) {
    return this.env[key];
  }

  get isLoaded(): boolean {
    return true;
  }

  load() {}
}

export class AppConfigSurveyExportMock {
  private config: Object = null;
  private env: Object = null;

  constructor() {
    this.config = {
      'api-version': 'v2',
      'api-url': 'https://transmart.example.com',
      'gb-backend-url': 'https://gb-backend.example.com',
      'fractalis-url': 'https://fractalis.example.com',
      'fractalis-datasource-service': 'transmart-example-service',
      'authentication-service-type': 'transmart',
      'export-mode': {
        'name': 'transmart',
        'data-view': 'surveyTable'
      },
    };
  }

  get version() {
    return '0.0.1-test';
  }

  public getConfig(key: any) {
    return this.config[key];
  }


  public getEnv(key: any) {
    return this.env[key];
  }

  get isLoaded(): boolean {
    return true;
  }

  load() {}
}

export class AppConfigFractalisDisabledMock {
  private config: Object = null;
  private env: Object = null;

  constructor() {
    this.config = {
      'api-version': 'v2',
      'api-url': 'https://transmart.example.com',
      'gb-backend-url': 'https://gb-backend.example.com',
      'fractalis-url': 'https://fractalis.example.com',
      'fractalis-datasource-service': 'transmart-example-service',
      'enable-fractalis-analysis': false,
      'authentication-service-type': 'transmart',
      'export-mode': {
        'name': 'transmart',
        'data-view': 'surveyTable'
      },
    };
  }

  get version() {
    return '0.0.1-test';
  }

  public getConfig(key: any) {
    return this.config[key];
  }

  public getEnv(key: any) {
    return this.env[key];
  }

  get isLoaded(): boolean {
    return true;
  }

  load() {}
}
