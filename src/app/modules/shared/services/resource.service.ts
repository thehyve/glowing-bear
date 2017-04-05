import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Study} from '../models/Study';
import {Patient} from '../models/Patient';
import {EndpointService} from './endpoint.service';
import {Constraint} from "../models/constraints/Constraint";

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
   * @param constraint
   * @returns {Observable<Patient[]>}
   */
  getPatients(constraint: Constraint): Observable<Patient[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.getAccessToken()}`);

    // let url = endpoint.getUrl() + '/'+ endpoint.getVersion() +'/patients?constraint={"type":"true"}';
    let url = endpoint.getUrl() + '/'+ endpoint.getVersion() +'/patients?constraint='+constraint.toJsonString();

    return this.http.get(url, {
      headers: headers
    })
      .map((res:Response) => res.json().patients)
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  }

}
