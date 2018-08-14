/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {AsyncSubject} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthenticationMethod} from '../authentication/authentication-method';
import {AccessLevel} from '../authentication/access-level';

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

  get accessLevel(): AccessLevel {
    return AccessLevel.Full;
  }

}
