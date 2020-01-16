import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError} from "rxjs/operators";
import {AppConfig} from 'app/config/app.config';
import {ErrorHelper} from '../utilities/error-helper';

@Injectable()
export class ApiEndpointService {

  private _endpointUrl: string;

  get endpointUrl(): string {
    return this._endpointUrl;
  }

  constructor(private http: HttpClient,
              private appConfig: AppConfig) {
    this._endpointUrl = this.appConfig.getConfig('api-url');
  }

  /**
   * Make a post http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param body
   * @param apiUrl - use to override the api url configured
   * @returns {Observable<any | any>}
   */
  postCall(urlPart: string, body: object, apiUrl?: string): Observable<any> {
    const url = apiUrl ? apiUrl : this.endpointUrl + "/" + urlPart;
    return this.http.post(url, body).pipe(
      catchError(ErrorHelper.handleError.bind(this))
    );
  }

  /**
   * Make a get http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param additionalParam
   * @returns {Observable<any | any>}
   */
  getCall(urlPart, additionalParam?): Observable<any> {
    const url = `${this.endpointUrl}/${urlPart}`;
    return this.http.get(url, additionalParam).pipe(
      catchError(ErrorHelper.handleError.bind(this))
    );
  }

  /**
   * Make a put http request
   * @param urlPart
   * @param body
   * @returns {Observable<any | any>}
   */
  putCall(urlPart, body) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.put(url, body).pipe(
      catchError(ErrorHelper.handleError.bind(this))
    );
  }

  /**
   * Make a delete http request
   * @param urlPart
   * @returns {Observable<any | any>}
   */
  deleteCall(urlPart) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.delete(url).pipe(
      catchError(ErrorHelper.handleError.bind(this))
    );
  }
}
