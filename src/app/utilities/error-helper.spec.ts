/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHelper} from './error-helper';
import {HttpHeaders} from '@angular/common/http';

describe('ErrorHelper.handleError', () => {

  it('logs an http error', () => {
    let error = new HttpErrorResponse({
      error: 'Unauthorized user',
      headers: new HttpHeaders(),
      status: 401,
      statusText: 'Unauthorized user',
      url: 'http://example.com'
    });

    console.error = jasmine.createSpy('error');
    ErrorHelper.handleError(error);
    expect(console.error).toHaveBeenCalledTimes(2);
  });

});
