export class AppConfigMock {
  private config: Object = null;
  private env: Object = null;
  constructor() {
    this.config = {
      'api-url': '',
      'api-version': '',
      'app-url': '',
      'authentication-method': 'oauth2'
    };
  }
  public getConfig(key: any) {
    return this.config[key];
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
      'api-url': '',
      'api-version': '',
      'app-url': '',
      'authentication-method': 'oidc'
    };
  }
  public getConfig(key: any) {
    return this.config[key];
  }
  public getEnv(key: any) {
    return this.env[key];
  }

  load() {}
}
