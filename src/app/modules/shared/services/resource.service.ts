import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Study} from '../models/study';
import {Patient} from '../models/patient';
import {EndpointService} from './endpoint.service';

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

  getPatients(): Observable<Patient[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.getAccessToken()}`);

    let url = endpoint.getUrl() + '/'+ endpoint.getVersion() +'/patients?constraint={"type":"true"}';
    return this.http.get(url, {
      headers: headers
    })
      .map((res:Response) => res.json())
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  }

}
