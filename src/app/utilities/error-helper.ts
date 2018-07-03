/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {HttpErrorResponse} from '@angular/common/http';
import {MessageHelper} from './message-helper';

export class ErrorHelper {

  /**
   * Handles error
   * @param error {HttpErrorResponse | any}
   */
  static handleError(error: HttpErrorResponse | any) {
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('A client-side or network error occurred:', error.error.message);
        MessageHelper.alert('error', 'A client-side or network error occurred');
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        const status = error.status;
        const url = error.url;
        const message = error.message;
        const summary = `Status: ${status}\nurl: ${url}\nMessage: ${message}`;
        console.error(summary);
        console.error(error.error);
        if (status === 401) {
          MessageHelper.alert('error', 'Unauthorised');
        } else {
          MessageHelper.alert('error', 'A server-side error occurred');
        }
      }
    } else {
      console.error(`Error: ${error}`, error);
    }
  }

}
