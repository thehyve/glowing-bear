import {ActivatedRoute, Router} from '@angular/router';
import {AppConfig} from '../../config/app.config';
import {Injectable, Injector} from '@angular/core';
import {AuthenticationMethod} from './authentication-method';
import {Observable} from 'rxjs/Observable';
import {AuthorisationResult} from './authorisation-result';
import {Oauth2Token} from './oauth2-token';
import * as moment from 'moment';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ErrorHelper} from '../../utilities/error-helper';
import {MessageHelper} from '../../utilities/message-helper';

/**
 * Implementation of the OAuth2 authorisation flow:
 * - Redirect to login page
 * - Receive authorisation token via URL redirect
 * - Obtain access token using post with authorisation token
 */
@Injectable()
export class Oauth2Authentication implements AuthenticationMethod {

  private config: AppConfig;
  private router: Router;
  private activatedRoute: ActivatedRoute;
  private http: HttpClient;

  private apiUrl: string;
  private appUrl: string;

  private _authorised: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _token: Oauth2Token = null;
  private _lock: boolean;
  private _tokenResult: BehaviorSubject<AuthorisationResult>;

  /**
   * Gets the authorisation code from the URL.
   * @return {string} the authorisation code if present; null otherwise.
   */
  static getAuthorisationCode(): string {
    let authorisationCode: string = null;
    let search: string = window.location.search;
    if (search.startsWith('?code=')) {
      authorisationCode = search.substring('?code='.length);
      console.log(`Authorisation code: ${authorisationCode}`);
    }
    return authorisationCode;
  }

  constructor(private injector: Injector) { }

  private redirect(authorisation: AuthorisationResult) {
    if (authorisation === 'authorized') {
      const path = JSON.parse(localStorage.getItem('redirect'));
      console.log(`Redirect to ${path}`);
      this.router.navigate([path]);
    } else {
      this.router.navigate(['/']);
    }
  }

  private fetchAccessToken(grantType: 'authorization_code' | 'refresh_token',
                           code: string): Promise<AuthorisationResult> {
    if (this._lock) {
      return this._tokenResult.toPromise();
    }
    this._lock = true;
    this._tokenResult = new BehaviorSubject<AuthorisationResult>('unauthorized');

    return new Promise((resolve) => {
      const url = `${this.apiUrl}/oauth/token`;
      let body = new HttpParams()
        .set('grant_type', grantType)
        .set('client_id', 'glowingbear-js')
        .set('client_secret', '')
        .set('redirect_uri', encodeURI(this.appUrl));
      if (grantType === 'authorization_code') {
        body = body.set('code', code);
      } else {
        body = body.set('refresh_token', code);
      }
      let authorisationHeader = btoa(`glowingbear-js:`);
      let headers = new HttpHeaders()
        .set('Authorization', `Basic ${authorisationHeader}`)
        .set('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');
      console.log(`Fetching access token using ${grantType} from ${url}`);
      this.http.post(url, body.toString(), {headers: headers})
        .catch(ErrorHelper.handleError.bind(this))
        .subscribe((result: any) => {
          console.log(`Token retrieved.`);
          this._token = Oauth2Token.from(result);
          localStorage.setItem('token', JSON.stringify(this._token));
          this.authorisation.subscribe((authorisation: AuthorisationResult) => {
            resolve(authorisation);
            this._tokenResult.next(authorisation);
            this._lock = false;
          });
        }, (error: any) => {
          console.error(`Error retrieving token using ${grantType}: ${error}`);
          if (grantType === 'refresh_token') {
            // Remove previous token
            localStorage.removeItem('token');
          }
          this.authorisation.subscribe((authorisation: AuthorisationResult) => {
            resolve(authorisation);
            this._tokenResult.next(authorisation);
            this._lock = false;
          });
        });
    });
  }

  load(): Promise<AuthorisationResult> {
    return new Promise((resolve) => {
      // inject services (not in constructor to avoid cyclic dependency)
      this.config = this.injector.get(AppConfig);
      this.router = this.injector.get(Router);
      this.activatedRoute = this.injector.get(ActivatedRoute);
      this.http = this.injector.get(HttpClient);
      this.apiUrl = this.config.getConfig('api-url');
      this.appUrl = this.config.getConfig('app-url');

      let authorisationCode = Oauth2Authentication.getAuthorisationCode();
      if (authorisationCode) {
        history.replaceState({}, window.document.title, this.appUrl);
        // use access code to retrieve access token
        this.fetchAccessToken('authorization_code', authorisationCode)
          .then((authorisation: AuthorisationResult) => {
          console.log(`Authorisation result: ${authorisation}`);
          this.redirect(authorisation);
          resolve(authorisation);
        });
      } else {
        console.log(`Set redirect to: ${window.location.pathname}`);
        localStorage.setItem('redirect', JSON.stringify(window.location.pathname));

        this._token = JSON.parse(localStorage.getItem('token'));
        this.authorisation.subscribe((authorisation: AuthorisationResult) => {
          console.log(`Authorisation result: ${authorisation}`);
          resolve(authorisation);
        });
      }
    });
  }

  private requestToken(): Observable<AuthorisationResult> {
    // Remove previous token
    localStorage.removeItem('token');
    // Set redirect target for when we return after authentication
    localStorage.setItem('redirect', JSON.stringify(window.location.pathname));
    // Redirect to authentication
    let clientId = 'glowingbear-js';
    let clientSecret = '';
    let redirectUri = encodeURI(this.appUrl);
    let params = `client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}`;
    let target = `${this.apiUrl}/oauth/authorize?response_type=code&${params}`;
    return Observable.fromPromise(new Promise((resolve) => {
      resolve('unauthorized');
      console.log(`Redirecting to ${target} ...`);
      setTimeout(() => {
          // Redirect to login page
          window.location.assign(target);
        }, 2000
      );
    }));
  }

  get authorisation(): Observable<AuthorisationResult> {
    if (!this.hasToken) {
      console.warn(`No valid token found.`);
      this._authorised.next(false);
      return this.requestToken();
    }
    if (this.tokenExpired && this._token.refreshToken) {
      console.warn('Token expired.');
      return Observable.from(this.fetchAccessToken('refresh_token', this._token.refreshToken));
    }
    console.log(`Valid token available.`);
    console.log(`Token valid until: ${moment(this._token.expires).format()} (now: ${moment(Date.now()).format()})`);
    this._authorised.next(true);
    return Observable.of(<AuthorisationResult>'authorized');
  }

  private get hasToken(): boolean {
    return this._token !== null && this._token.accessToken !== null;
  }

  private get tokenExpired(): boolean {
    return moment(this._token.expires).isBefore(moment());
  }

  get authorised(): BehaviorSubject<boolean> {
    return this._authorised;
  }

  get validToken(): boolean {
    return this.hasToken && !this.tokenExpired;
  }

  get token(): string {
    return this._token === null ? null : this._token.accessToken;
  }

  onDestroy(): void {
  }

  logout(): void {
    localStorage.removeItem('token');
    let target = `${this.apiUrl}/logout`;
    MessageHelper.alert('info', 'Redirect to logout page ...');
    console.log(`Redirecting to ${target} ...`);
    setTimeout(() => {
        window.location.assign(target);
      }, 4000
    );
  }

}
