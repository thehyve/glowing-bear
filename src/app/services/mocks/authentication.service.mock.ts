/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, OnDestroy} from '@angular/core';
import {AuthenticationMethod} from '../authentication/authentication-method';
import {AsyncSubject} from 'rxjs/AsyncSubject';

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

  get authorised(): AsyncSubject<boolean> {
    return this.authenticationMethod.authorised;
  }
}
