import {HttpErrorResponse} from '@angular/common/http';

export class ErrorHelper {

  /**
   * handle error
   * @param {HttpErrorResponse | any} res
   */
  static handleError(res: HttpErrorResponse | any) {
    const status = res['status'];
    const url = res['url'];
    const message = res['message'];
    const summary = `Status: ${status}\nurl: ${url}\nMessage: ${message}`;
    console.error(summary);
    console.error(res['error']);
  }

}
