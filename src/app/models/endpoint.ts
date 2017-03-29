export class Endpoint {
  private url:string;
  public access_token:string;

  private _isAuthenticated: boolean;

  constructor(url:string) {
    this.url = url;
    this._isAuthenticated = false;
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  setAccessToken(access_token): void {
    this.access_token = access_token;
    this._isAuthenticated = true;
  }

}
