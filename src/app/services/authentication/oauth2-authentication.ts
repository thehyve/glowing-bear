/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {from as observableFrom, Observable, BehaviorSubject, AsyncSubject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AppConfig} from '../../config/app.config';
import {Injectable, Injector} from '@angular/core';
import {AuthenticationMethod} from './authentication-method';
import {AuthorizationResult} from './authorization-result';
import {Oauth2Token} from './oauth2-token';
import * as moment from 'moment';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {MessageHelper} from '../../utilities/message-helper';
import {RedirectHelper} from '../../utilities/redirect-helper';

/**
 * Implementation of the OAuth2 authorisation flow:
 * - Redirect to login page
 * - Receive authorisation token via URL redirect
 * - Obtain access token using post with authorisation token
 */
@Injectable({
  providedIn: 'root',
})
export class Oauth2Authentication implements AuthenticationMethod {

  private config: AppConfig;
  private router: Router;
  private activatedRoute: ActivatedRoute;
  private http: HttpClient;

  private authUrl: string;
  private apiUrl: string;
  private appUrl: string;
  private clientId: string;

  private _authorised: AsyncSubject<boolean> = new AsyncSubject<boolean>();
  private _token: Oauth2Token = null;
  private _lock: boolean;
  private _tokenResult: BehaviorSubject<AuthorizationResult>;

  /**
   * Gets the authorisation code from the URL.
   * @return {string} the authorisation code if present; null otherwise.
   */
  static getAuthorisationCode(): string {
    let authorisationCode: string = null;
    let search: string = window.location.search;
    if (search.includes('code=')) {
      authorisationCode = search.substring(search.indexOf('code=') + 'code='.length);
      console.log(`Authorisation code: ${authorisationCode}`);
    }
    return authorisationCode;
  }

  constructor(private injector: Injector) { }

  private redirect(authorisation: AuthorizationResult) {
    if (authorisation === AuthorizationResult.Authorized && localStorage.getItem('redirect')) {
      const path = JSON.parse(localStorage.getItem('redirect'));
      console.log(`Redirect to ${path}`);
      this.router.navigate([path]);
    } else {
      this.logout();
    }
  }

  private fetchAccessToken(grantType: 'authorization_code' | 'refresh_token',
                           code: string): Promise<AuthorizationResult> {
    if (this._lock) {
      return this._tokenResult.toPromise();
    }
    this._lock = true;
    this._tokenResult = new BehaviorSubject<AuthorizationResult>(AuthorizationResult.Unauthorized);

    return new Promise((resolve) => {
      const url = `${this.authUrl}/token`;
      let body = new HttpParams()
        .set('grant_type', grantType)
        .set('client_id', this.clientId)
        .set('client_secret', '')
        .set('redirect_uri', encodeURI(this.appUrl));
      if (grantType === 'authorization_code') {
        body = body.set('code', code);
      } else {
        body = body.set('refresh_token', code);
      }
      let authorisationHeader = btoa(`${this.clientId}:`);
      let headers = new HttpHeaders()
        .set('Authorization', `Basic ${authorisationHeader}`)
        .set('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');
      console.log(`Fetching access token using ${grantType} from ${url}`);
      this.http.post(url, body.toString(), {headers: headers})
        .subscribe((result: any) => {
          console.log(`Token retrieved.`);
          this._token = Oauth2Token.from(result);
          localStorage.setItem('token', JSON.stringify(this._token));
          this.authorisation.subscribe((authorisation: AuthorizationResult) => {
            resolve(authorisation);
            this._tokenResult.next(authorisation);
            this._lock = false;
          });
        }, (error: any) => {
          console.error(`Error retrieving token using ${grantType}: ${error}`);
          if (grantType === 'refresh_token') {
            // Remove previous token
            localStorage.removeItem('token');
            this._token = null;
          }
          this.authorisation.subscribe((authorisation: AuthorizationResult) => {
            resolve(authorisation);
            this._tokenResult.next(authorisation);
            this._lock = false;
          });
        });
    });
  }

  load(): Promise<AuthorizationResult> {
    return new Promise((resolve) => {
      // inject services (not in constructor to avoid cyclic dependency)
      this.config = this.injector.get(AppConfig);
      this.router = this.injector.get(Router);
      this.activatedRoute = this.injector.get(ActivatedRoute);
      this.http = this.injector.get(HttpClient);
      this.appUrl = location.origin;
      this.apiUrl = this.config.getConfig('api-url');

      this.authUrl = this.config.getConfig('oidc-server-url');
      this.clientId = this.config.getConfig('oidc-client-id');

      let authorisationCode = Oauth2Authentication.getAuthorisationCode();
      if (authorisationCode) {
        history.replaceState({}, window.document.title, this.appUrl);
        // use access code to retrieve access token
        this.fetchAccessToken('authorization_code', authorisationCode)
          .then((authorisation: AuthorizationResult) => {
          console.log(`Authorisation result: ${authorisation}`);
          this.redirect(authorisation);
          resolve(authorisation);
        });
      } else {
        console.log(`Set redirect to: ${window.location.pathname}`);
        localStorage.setItem('redirect', JSON.stringify(window.location.pathname));

        this._token = JSON.parse(localStorage.getItem('token'));
        this.authorisation.subscribe((authorisation: AuthorizationResult) => {
          console.log(`Authorisation result: ${authorisation}`);
          resolve(authorisation);
        });
      }
    });
  }

  private requestToken(): Observable<AuthorizationResult> {
    // Remove previous token
    localStorage.removeItem('token');
    // Set redirect target for when we return after authentication
    localStorage.setItem('redirect', JSON.stringify(window.location.pathname));
    // Redirect to authentication
    let clientSecret = '';
    let redirectUri = encodeURI(this.appUrl);
    let params = `client_id=${this.clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}`;
    let target = `${this.authUrl}/auth?response_type=code&${params}`;
    return observableFrom(new Promise<AuthorizationResult>((resolve) => {
      resolve(AuthorizationResult.Unauthorized);
      RedirectHelper.redirectTo(target);
    }));
  }

  get authorisation(): Observable<AuthorizationResult> {
    if (!this.hasToken) {
      console.warn(`No token found.`);
      this._authorised.next(false);
      this._authorised.complete();
      return this.requestToken();
    }
    if (this.tokenExpired && this._token.refreshToken) {
      console.warn('Token expired.');
      return observableFrom(this.fetchAccessToken('refresh_token', this._token.refreshToken));
    }
    return observableFrom(new Promise<AuthorizationResult>(resolve => {
      console.log(`Token valid until: ${moment(this._token.expires).format()} (now: ${moment(Date.now()).format()})`);
      this._authorised.next(true);
      this._authorised.complete();
      resolve(AuthorizationResult.Authorized);
    }));
  }

  private get hasToken(): boolean {
    return this._token !== null && this._token.accessToken !== null;
  }

  private get tokenExpired(): boolean {
    return moment(this._token.expires).isBefore(moment());
  }

  get authorised(): AsyncSubject<boolean> {
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
    let target: string;
    let redirectUri = encodeURI(this.appUrl);
    target = `${this.authUrl}/logout?redirect_uri=${redirectUri}`;
    MessageHelper.alert('info', 'Redirect to logout page ...');
    RedirectHelper.redirectTo(target);
  }

}
