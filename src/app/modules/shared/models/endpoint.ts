export class Endpoint {

  private _accessToken: string;
  private _isAuthenticated: boolean;


  constructor(private _apiUrl: string, private _apiVersion: string, private _appUrl: string) {
    this._isAuthenticated = false;
  }

  get apiUrl(): string {
    return this._apiUrl;
  }

  set apiUrl(value: string) {
    this._apiUrl = value;
  }

  get apiVersion(): string {
    return this._apiVersion;
  }

  set apiVersion(value: string) {
    this._apiVersion = value;
  }

  get appUrl(): string {
    return this._appUrl;
  }

  set appUrl(value: string) {
    this._appUrl = value;
  }

  getUrl(): string {
    return this._apiUrl + '/' + this._apiVersion;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  set accessToken(value: string) {
    this._isAuthenticated = !!value;
    this._accessToken = value;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  set isAuthenticated(value: boolean) {
    this._isAuthenticated = value;
  }
}
