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

  getStudies(): Promise<Study[]> {
    var headers = new Headers();
    var endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.getAccessToken()}`);
    return this.http.get(`${endpoint.getUrl()}/studies`, {
      headers: headers
    })
      .toPromise()
      .then((response: Response) => {
        return response.json().studies as Study[]
      })
      .catch(() => {
        console.log("an error occurred");
      });
  }

  /**
   * Given a constraint, retrieve the corresponding patient array
   * @param constraint - the constraint of the patient set to be queried
   * @returns {Observable<Patient[]>}
   */
  getPatients(constraint: Constraint): Observable<Patient[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.getAccessToken()}`);

    let url = endpoint.getUrl() +'/patients?constraint='+constraint.toJsonString();

    return this.http.get(url, {
      headers: headers
    })
      .map((res:Response) => res.json().patients as Patient[])
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
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
    headers.append('Authorization', `Bearer ${endpoint.getAccessToken()}`);
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({headers: headers});
    let body = constraint.toJsonString();
    let url = endpoint.getUrl() + '/patient_sets?name='+name;

    return this.http.post(url, body, options)
      .map((res:Response) => res.json() as PatientSetPostResponse)
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  }

}
