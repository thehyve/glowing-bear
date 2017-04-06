export class Endpoint {

  private baseUrl: string;
  private version: string;
  private access_token: string;
  private _isAuthenticated: boolean;


  constructor(baseUrl: string, version: string) {
    this.baseUrl = baseUrl;
    this.version = version;
    this._isAuthenticated = false;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getUrl(): string {
    return this.baseUrl + '/' + this.version;
  }

  getVersion(): string {
    return this.version;
  }

  getAccessToken(): string {
    return this.access_token;
  }

  setAccessToken(token: string): void {
    this._isAuthenticated = true;
    this.access_token = token;
  }

}
