import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { Study } from '../models/study';
import { EndpointService } from './endpoint.service';

@Injectable()
export class ResourceService {

  constructor(private http: Http, private endpointService: EndpointService) { }

  getStudies(): Promise<Study[]> {
    var headers = new Headers();
    var endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.access_token}`);
    return this.http.get(`${endpoint.url}/studies`, {
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

}
