export class Endpoint {

  private url: string;
  private version: string;
  private access_token: string;
  private _isAuthenticated: boolean;


  constructor(url: string, version: string) {
    this.url = url;
    this.version = version;
    this._isAuthenticated = false;
  }

  getUrl(): string {
    return this.url;
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
