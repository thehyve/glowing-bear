/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {NavbarService} from './navbar.service';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';
import {QueryService} from './query.service';
import {QueryServiceMock} from './mocks/query.service.mock';

describe('NavbarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        NavbarService
      ]
    });
  });

  it('should be injected', inject([NavbarService], (service: NavbarService) => {
    expect(service).toBeTruthy();
  }));
});
