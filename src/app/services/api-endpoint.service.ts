import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
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
   * @param responseField
   * @returns {Observable<any | any>}
   */
  postCall(urlPart, body, responseField?) {
    const url = `${this.endpointUrl}/${urlPart}`;
    if (responseField) {
      return this.http.post(url, body)
        .map(res => res[responseField])
        .catch(ErrorHelper.handleError.bind(this));
    } else {
      return this.http.post(url, body)
        .catch(ErrorHelper.handleError.bind(this));
    }
  }

  /**
   * Make a get http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param responseField
   * @param additionalParam
   * @returns {Observable<any | any>}
   */
  getCall(urlPart, responseField?, additionalParam?) {
    const url = `${this.endpointUrl}/${urlPart}`;
    if (responseField) {
      return this.http.get(url, additionalParam)
        .map(res => res[responseField])
        .catch(ErrorHelper.handleError.bind(this));
    } else {
      return this.http.get(url, additionalParam)
        .catch(ErrorHelper.handleError.bind(this));
    }
  }

  /**
   * Make a put http request
   * @param urlPart
   * @param body
   * @returns {Observable<any | any>}
   */
  putCall(urlPart, body) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.put(url, body)
      .catch(ErrorHelper.handleError.bind(this));
  }

  /**
   * Make a delete http request
   * @param urlPart
   * @returns {Observable<any | any>}
   */
  deleteCall(urlPart) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.delete(url)
      .catch(ErrorHelper.handleError.bind(this));
  }
}
