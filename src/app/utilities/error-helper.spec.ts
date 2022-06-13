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
import {MessageHelper} from './message-helper';
import {MessageService} from 'primeng';

describe('ErrorHelper.handleError', () => {

  beforeEach(() => {
    MessageHelper.messageService = new MessageService();
    MessageHelper.messageService.add = jasmine.createSpy('add');
    console.error = jasmine.createSpy('error');
  });

  it('logs an http error', () => {
    let error = new HttpErrorResponse({
      error: 'Unauthorized user',
      headers: new HttpHeaders(),
      status: 401,
      statusText: 'Unauthorized user',
      url: 'http://example.com'
    });
    ErrorHelper.handleError(error);
    expect(console.error).toHaveBeenCalledTimes(3);
    expect(MessageHelper.messageService.add).toHaveBeenCalledTimes(1);
  });

  it('logs an access http error', () => {
    let error = new HttpErrorResponse({
      error: 'Access denied',
      headers: new HttpHeaders(),
      status: 403,
      statusText: 'Access denied',
      url: 'http://example.com'
    });

    ErrorHelper.handleError(error);
    expect(console.error).toHaveBeenCalledTimes(3);
    expect(MessageHelper.messageService.add).toHaveBeenCalledTimes(1);
  });

});
