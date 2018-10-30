/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {catchError, map} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse, HttpHandler} from '@angular/common/http';
import {ErrorHelper} from './error-helper';
import {Observable, of as observableOf} from 'rxjs';


export class HttpHelper {


  constructor(private endpointUrl: string, private http: HttpClient) {
  }

  /**
   * Make a post http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param body
   * @param responseField
   * @returns {Observable<any | any>}
   */
  public postCall(urlPart, body, responseField) {
    const url = `${this.endpointUrl}/${urlPart}`;
    if (responseField) {
      return this.http.post(url, body).pipe(
        map(res => res[responseField]),
        catchError(error => {
          ErrorHelper.handleError(error);
          return observableOf(error);
        })
      );
    } else {
      return this.http.post(url, body).pipe(
        catchError(error => {
          ErrorHelper.handleError(error);
          return observableOf(error);
        })
      );
    }
  }

  /**
   * Make a get http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param responseField
   * @returns {Observable<any | any>}
   */
  public getCall(urlPart, responseField) {
    const url = `${this.endpointUrl}/${urlPart}`;
    if (responseField) {
      return this.http.get(url).pipe(
        map((res) => res[responseField]),
        catchError((error: HttpErrorResponse) => {
          ErrorHelper.handleError(error);
          return observableOf(error);
        })
      );
    } else {
      return this.http.get(url).pipe(
        catchError((error: HttpErrorResponse) => {
          ErrorHelper.handleError(error);
          return observableOf(error);
        })
      );
    }
  }

  /**
   * Make a put http request
   * @param urlPart
   * @param body
   * @returns {Observable<any | any>}
   */
  public putCall(urlPart, body) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.put(url, body).pipe(
      catchError(error => {
        ErrorHelper.handleError(error);
        return observableOf(error);
      })
    );
  }

  /**
   * Make a delete http request
   * @param urlPart
   * @returns {Observable<any | any>}
   */
  public deleteCall(urlPart) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.delete(url).pipe(
      catchError(error => {
        ErrorHelper.handleError(error);
        return observableOf(error);
      })
    );
  }

  public downloadData(urlPart) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.get(url, {responseType: 'blob'}).pipe(
      catchError(ErrorHelper.handleError.bind(this)));
  }

}
