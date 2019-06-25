/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, Injector, OnDestroy} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {Observable} from 'rxjs/Observable';
import {AuthenticationMethod} from './authentication-method';
import {Oauth2Authentication} from './oauth2-authentication';
import {AuthorizationResult} from './authorization-result';
import {AsyncSubject} from 'rxjs/AsyncSubject';
import {AccessLevel} from './access-level';

@Injectable()
export class AuthenticationService implements OnDestroy {

  private config: AppConfig;
  private authenticationMethod: AuthenticationMethod;
  private _accessLevel: AccessLevel = AccessLevel.Restricted;

  constructor(private injector: Injector) { }

  public load(): Promise<AuthorizationResult> {
    this.config = this.injector.get(AppConfig);
    this.authenticationMethod = this.injector.get(Oauth2Authentication);
    return this.authenticationMethod.load();
  }

  ngOnDestroy(): void {
    this.authenticationMethod.onDestroy();
  }

  authorise(): Observable<AuthorizationResult> {
    return this.authenticationMethod.authorisation;
  }

  logout() {
    this.authenticationMethod.logout();
  }

  get authorised(): AsyncSubject<boolean> {
    return this.authenticationMethod.authorised;
  }

  get validToken(): boolean {
    return this.authenticationMethod.validToken;
  }

  get token(): string {
    return this.authenticationMethod.token;
  }

  get accessLevel(): AccessLevel {
    return this._accessLevel;
  }

  set accessLevel(value: AccessLevel) {
    this._accessLevel = value;
  }

  get authorisations(): Observable<string[]> {
    return this.authenticationMethod.authorisations;
  }
}
