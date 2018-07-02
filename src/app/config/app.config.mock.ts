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
