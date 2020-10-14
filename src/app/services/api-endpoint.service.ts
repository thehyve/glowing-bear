import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AppConfig} from 'app/config/app.config';
import {ErrorHelper} from '../utilities/error-helper';

@Injectable()
export class ApiEndpointService {

  private readonly _endpointUrl: string;

  get endpointUrl(): string {
    return this._endpointUrl;
  }

  constructor(private http: HttpClient,
              private appConfig: AppConfig) {
    this._endpointUrl = this.appConfig.getConfig('medco-node-url');
  }

  /**
   * Make a post http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param body
   * @param apiUrl - use to override the api url configured
   * @returns {Observable<any | any>}
   */
  postCall(urlPart: string, body: object, apiUrl?: string): Observable<any> {
    const url = apiUrl ?
      apiUrl + '/' + urlPart :
      this.endpointUrl + '/' + urlPart;

    return this.http.post(url, body).pipe(
      catchError(ErrorHelper.handleHTTPError)
    );
  }

  /**
   * Make a get http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param additionalParam
   * @param apiUrl
   * @returns {Observable<any | any>}
   */
  getCall(urlPart, additionalParam?,apiUrl?): Observable<any> {
    const url = apiUrl? `${apiUrl}/${urlPart}`:`${this.endpointUrl}/${urlPart}`;
    return this.http.get(url, additionalParam).pipe(
      catchError(ErrorHelper.handleHTTPError)
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
      catchError(ErrorHelper.handleHTTPError)
    );
  }

  /**
   * Make a delete http request
   * @param urlPart
   * @param options
   * @param apiUrl
   * @returns {Observable<any | any>}
   */
  deleteCall(urlPart,options?,apiUrl?) {
    const url = apiUrl? `${apiUrl}/${urlPart}`:`${this.endpointUrl}/${urlPart}`;;
    return this.http.delete(url,options).pipe(
      catchError(ErrorHelper.handleHTTPError)
    );
  }
}
