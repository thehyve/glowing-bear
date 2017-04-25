import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Study} from '../models/study';
import {Patient} from '../models/patient';
import {EndpointService} from './endpoint.service';
import {Constraint} from "../models/constraints/constraint";
import {PatientSetPostResponse} from "../models/patient-set-post-response";

@Injectable()
export class ResourceService {

  constructor(private http: Http, private endpointService: EndpointService) {
  }

  /**
   * Currently only handles the 'invalid_token' error, other errors are passed on.
   * @param error
   * @returns {any}
   */
  private handleError(error: Response|any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;

      if (err == 'invalid_token') {
        this.endpointService.invalidateToken();
      }

    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg || 'Server error');
  }

  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<Study[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();

    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    let url = `${endpoint.getUrl()}/studies`;
    return this.http.get(url, {
      headers: headers
    })
      .map((response:Response) => response.json().studies as Study[])
      .catch(this.handleError.bind(this));
  }

  getTreeNodes(): Observable<object> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);

    let url = `${endpoint.getUrl()}/tree_nodes`;
    return this.http.get(url, {
      headers: headers
    })
      .map((response:Response) => response.json().tree_nodes)
      .catch(this.handleError.bind(this));
  }

  /**
   * Given a constraint, retrieve the corresponding patient array
   * @param constraint - the constraint of the patient set to be queried
   * @returns {Observable<Patient[]>}
   */
  getPatients(constraint: Constraint): Observable<Patient[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);

    let constraintString = JSON.stringify(constraint.toQueryObject());
    console.log("run patient query with Constraint: " + constraintString);
    let url = `${endpoint.getUrl()}/patients?constraint=${constraintString}`;
    return this.http.get(url, {
      headers: headers
    })
      .map((res:Response) => res.json().patients as Patient[])
      .catch(this.handleError.bind(this));
  }

  /**
   * Given the name and constraint of the patient set to be saved, save it to transmart
   * @param name - the name of the patient set to be saved
   * @param constraint - the constraint of the patient set to be saved
   * @returns {Observable<PatientSetPostResponse>}
   */
  savePatients(name: string, constraint: Constraint): Observable<PatientSetPostResponse> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(constraint.toQueryObject());
    let url = `${endpoint.getUrl()}/patient_sets?name=${name}`;

    return this.http.post(url, body, options)
      .map((res:Response) => res.json() as PatientSetPostResponse)
      .catch(this.handleError.bind(this));
  }

}
