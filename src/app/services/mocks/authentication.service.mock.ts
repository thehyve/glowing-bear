/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {AsyncSubject, Observable, of as observableOf} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthenticationMethod} from '../authentication/authentication-method';
import {AccessLevel} from '../authentication/access-level';
import {Subject} from 'rxjs/Rx';
import {AuthorizationResult} from '../authentication/authorization-result';

@Injectable()
export class AuthenticationServiceMock {

  private authenticationMethod: AuthenticationMethod;

  constructor() {
  }

  public load() {
  }

  logout() {
  }

  get authorised(): AsyncSubject<boolean> {
    return this.authenticationMethod.authorised;
  }

  get accessLevel(): Subject<AccessLevel> {
    let accessLevel: Subject<AccessLevel> = new AsyncSubject<AccessLevel>();
    accessLevel.next(AccessLevel.Full);
    accessLevel.complete();
    return accessLevel;
  }


  authorise(): Observable<AuthorizationResult> {
    return observableOf();
  }

}
