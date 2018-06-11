import {HttpErrorResponse} from '@angular/common/http';

export class ErrorHelper {

  /**
   * handles error
   * @param {HttpErrorResponse} error
   */
  static handleError(error: HttpErrorResponse) {
    const status = error['status'];
    const url = error['url'];
    const message = error['message'];
    const summary = `Status: ${status}\nurl: ${url}\nMessage: ${message}`;
    console.error(summary);
    console.error(error['error']);
  }

}
