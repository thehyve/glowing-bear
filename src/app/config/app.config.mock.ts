/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class AppConfigMock {
  private config: Object = null;
  private env: Object = null;
  constructor() {
    this.config = {
      'api-url': 'https://transmart.example.com',
      'app-url': 'https://glowingbear.example.com',
      'authentication-service-type': 'transmart'
    };
  }
  public getConfig(key: any, defaultValue?: any) {
    if (key in this.config) {
      return this.config[key];
    } else {
      return defaultValue;
    }
  }
  public getEnv(key: any) {
    return this.env[key];
  }

  load() {}
}

export class OidcConfigMock {
  private config: Object = null;
  private env: Object = {};
  constructor() {
    this.config = {
      'api-url': 'https://transmart.example.com',
      'app-url': 'https://glowingbear.example.com',
      'authentication-service-type': 'oidc',
      'oidc-server-url': 'https://keycloak.example.com/auth/realms/transmart-dev/protocol/openid-connect',
      'oidc-client-id': 'glowingbear-js'
    };
  }
  public getConfig(key: any, defaultValue?: any) {
    if (key in this.config) {
      return this.config[key];
    } else {
      return defaultValue;
    }
  }
  public getEnv(key: any) {
    return this.env[key];
  }

  load() {}
}
