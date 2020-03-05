/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020  EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {HttpErrorResponse} from '@angular/common/http';
import {MessageHelper} from './message-helper';
import {Observable, throwError} from 'rxjs';

export class ErrorHelper {

  /**
   * Handles error.
   * @param errMsg
   * @param err
   */
  static handleError(errMsg: string, err: Error) {
    console.error(`${errMsg}`);
    if (err && err.stack) {
      console.error(`${err.stack}`);
    }
    MessageHelper.alert('error', 'An error occurred, check details in console.');
  }

  /**
   * Handle and create a new error.
   * @param errMsg
   */
  static handleNewError(errMsg: string): Error  {
    let err = new Error(errMsg);
    console.error(`${errMsg}\n${err.stack}`);
    MessageHelper.alert('error', 'An error occurred, check details in console.');
    return err;
  }

  /**
   * Handles HTTP error and returns error.
   * @param error {HttpErrorResponse}
   */
  static handleHTTPError(error: HttpErrorResponse): Observable<never> {
    let errMsg, errDetail: string;
    if (error.error instanceof ErrorEvent) {
      // client side or network error
      errMsg = 'A client-side or network error occurred';
      errDetail = error.error.message;
    } else {
      // server side error
      errMsg = `A server-side ${error.status} error occurred`;
      errDetail = `Status: ${error.status}; URL: ${error.url}; Message: ${error.message}`;
    }

    console.error(`${errMsg}\n${errDetail}\n${error.error}`);
    MessageHelper.alert('error', errMsg);
    return throwError(error.error);
  }
}
