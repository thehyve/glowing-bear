/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {of as observableOf, AsyncSubject, Observable} from 'rxjs';
import {Injectable, OnDestroy} from '@angular/core';
import {AuthenticationMethod} from '../authentication/authentication-method';
import {AuthorizationResult} from '../authentication/authorization-result';
import {AccessLevel} from '../authentication/access-level';

@Injectable()
export class AuthenticationServiceMock implements OnDestroy {

  private authenticationMethod: AuthenticationMethod;

  constructor() {
  }

  public load() {
  }

  ngOnDestroy(): void {
  }

  logout() {
  }

  authorise(): Observable<AuthorizationResult> {
    return observableOf(AuthorizationResult.Authorized);
  }

  get authorised(): AsyncSubject<boolean> {
    return this.authenticationMethod.authorised;
  }

  get accessLevel(): AccessLevel {
    return AccessLevel.Full;
  }

}
