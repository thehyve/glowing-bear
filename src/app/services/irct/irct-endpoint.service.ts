import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from 'app/config/app.config';
import {IRCTResourceDef} from '../../models/irct-models/irct-resource-definition';

@Injectable()
export class IRCTEndPointService {

  private endpointUrl: string;

  constructor(private http: HttpClient,
              private appConfig: AppConfig) {
    this.endpointUrl = this.appConfig.getConfig('api-url');
  }

  /**
   * only handles the 'invalid_token' error, other errors are passed on.
   * @param {HttpErrorResponse | any} error
   */
  private handleError(res: HttpErrorResponse | any) {
    const status = res['status'];
    const url = res['url'];
    const message = res['message'];
    const summary = `Status: ${status}\nurl: ${url}\nMessage: ${message}`;
    console.error(summary);
    console.error(res['error']);
  }

  /**
   * Make a post http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param body
   * @param responseField
   * @returns {Observable<any | any>}
   */
  private postCall(urlPart, body, responseField) {
    const url = `${this.endpointUrl}/${urlPart}`;
    if (responseField) {
      return this.http.post(url, body)
        .map(res => res[responseField])
        .catch(this.handleError.bind(this));
    } else {
      return this.http.post(url, body)
        .catch(this.handleError.bind(this));
    }
  }

  /**
   * Make a get http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param responseField
   * @returns {Observable<any | any>}
   */
  private getCall(urlPart, responseField) {
    const url = `${this.endpointUrl}/${urlPart}`;
    if (responseField) {
      return this.http.get(url)
        .map(res => res[responseField])
        .catch(this.handleError.bind(this));
    } else {
      return this.http.get(url)
        .catch(this.handleError.bind(this));
    }
  }

  /**
   * Make a put http request
   * @param urlPart
   * @param body
   * @returns {Observable<any | any>}
   */
  private putCall(urlPart, body) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.put(url, body)
      .catch(this.handleError.bind(this));
  }

  /**
   * Make a delete http request
   * @param urlPart
   * @returns {Observable<any | any>}
   */
  private deleteCall(urlPart) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.delete(url)
      .catch(this.handleError.bind(this));
  }

  // -------------------------------------- init calls --------------------------------------

  /**
   * Returns the available IRCT resources.
   * @returns {Observable<IRCTResourceDef[]>}
   */
  getIRCTResources(): Observable<IRCTResourceDef[]> {
    const urlPart = 'resourceService/resources';
    return this.getCall(urlPart, false);
  }
}
