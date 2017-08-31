import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions, ResponseContentType} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Study} from '../models/study';
import {Patient} from '../models/patient';
import {EndpointService} from './endpoint.service';
import {Constraint} from '../models/constraints/constraint';
import {PatientSetPostResponse} from '../models/patient-set-post-response';
import {Aggregate} from '../models/aggregate';
import {ConceptConstraint} from '../models/constraints/concept-constraint';
import {PatientSet} from '../models/patient-set';
import {TrialVisit} from '../models/trial-visit';
import {ExportJob} from '../models/export-job';

@Injectable()
export class ResourceService {

  constructor(private http: Http, private endpointService: EndpointService) {
  }

  /**
   * Currently only handles the 'invalid_token' error, other errors are passed on.
   * @param error
   * @returns {any}
   */
  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;

      if (err === 'invalid_token') {
        this.endpointService.invalidateToken();
      }

    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg || 'Server error');
  }

  // -------------------------------------- study calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<Study[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();

    if (endpoint) {
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      let url = `${endpoint.getUrl()}/studies`;
      return this.http.get(url, {
        headers: headers
      })
        .map((response: Response) => response.json().studies as Study[])
        .catch(this.handleError.bind(this));
    } else {
      console.error('Could not establish endpoint.');
    }

  }

  /**
   * Get a specific branch of the tree nodes
   * @param {string} root - the path to the specific tree node
   * @param {number} depth - the depth of the tree we want to access
   * @param {boolean} hasCounts - whether we want to include patient and observation counts in the tree nodes
   * @param {boolean} hasTags - whether we want to include metadata in the tree nodes
   * @returns {Observable<Object>}
   */
  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();

    if (endpoint) {
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      let url = `${endpoint.getUrl()}/tree_nodes?root=${root}&depth=${depth}`;
      if (hasCounts) {
        url += '&counts=true';
      }
      if (hasTags) {
        url += '&tags=true';
      }
      return this.http.get(url, {
        headers: headers
      })
        .map((response: Response) => response.json().tree_nodes)
        .catch(this.handleError.bind(this));
    } else {
      console.error('Could not establish endpoint.');
    }
  }

  // -------------------------------------- patient calls --------------------------------------

  /**
   * Get the list of patient sets that the current user saved
   * @returns {Observable<PatientSet[]>}
   */
  getPatientSets(): Observable<PatientSet[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();

    if (endpoint) {
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      let url = `${endpoint.getUrl()}/patient_sets`;

      return this.http.get(url, {
        headers: headers
      })
        .map((response: Response) => response.json().patientSets as PatientSet[])
        .catch(this.handleError.bind(this));
    } else {
      console.error('Could not establish endpoint.');
    }
  }

  /**
   * Given a constraint, return the corresponding patient list
   * @param constraint
   * @param debugLabel - for debugging purpose
   * @returns {Observable<R|T>}
   */
  getPatients(constraint: Constraint, debugLabel: string): Observable<Patient[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    let constraintString: string = JSON.stringify(constraint.toQueryObject());
    console.log(debugLabel, 'constraint:', constraintString);
    let url = `${endpoint.getUrl()}/patients?constraint=${constraintString}`;
    return this.http.get(url, {
      headers: headers
    })
      .map((res: Response) => res.json().patients as Patient[])
      .catch(this.handleError.bind(this));
  }

  /**
   * Given the name and constraint of the patient set to be saved, save it to transmart
   * @param name - the name of the patient set to be saved
   * @param constraint - the constraint of the patient set to be saved
   * @returns {Observable<PatientSetPostResponse>}
   */
  savePatients(name: string, constraint: Constraint): Observable<PatientSetPostResponse> {
    if (!name) {
      // Default name
      name = 'patient set';
    }
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(constraint.toQueryObject());
    let url = `${endpoint.getUrl()}/patient_sets?name=${name}`;

    return this.http.post(url, body, options)
      .map((res: Response) => res.json() as PatientSetPostResponse)
      .catch(this.handleError.bind(this));
  }

  // -------------------------------------- aggregate calls --------------------------------------

  /**
   * Given a constraint, get its aggregate which includes min, max, average or categorical values
   * @param constraint
   * @returns {Observable<Aggregate>}
   */
  getConceptAggregate(constraint: ConceptConstraint): Observable<Aggregate> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    let constraintString = JSON.stringify(constraint.toQueryObject());
    let url = `${endpoint.getUrl()}/observations/aggregate?`;
    if (constraint.concept.type === 'NUMERIC') {
      url += `type=min&type=max&type=average&type=count&constraint=${constraintString}`;
    } else {
      url += `type=values&constraint=${constraintString}`;
    }

    return this.http.get(url, {
      headers: headers
    })
      .map((res: Response) => res.json() as Aggregate)
      .catch(this.handleError.bind(this));
  }

  // -------------------------------------- trial visit calls --------------------------------------
  /**
   * Given a constraint, normally a concept or a study constraint, return the corresponding trial visit list
   * @param constraint
   * @returns {Observable<R|T>}
   */
  getTrialVisits(constraint: Constraint): Observable<TrialVisit[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    let constraintString = JSON.stringify(constraint.toQueryObject());
    let url = `${endpoint.getUrl()}/dimensions/trial visit/elements?constraint=${constraintString}`;

    return this.http.get(url, {
      headers: headers
    })
      .map((res: Response) => res.json().elements as TrialVisit[])
      .catch(this.handleError.bind(this));
  }

  // -------------------------------------- export calls --------------------------------------
  /**
   * Given a list of patient set ids as strings, get the corresponding data formats available for download
   * @param patientSetIds
   * @returns {Observable<string[]>}
   */
  getExportDataFormats(patientSetIds: string[]): Observable<string[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);

    let idString = '';
    for (let id of patientSetIds) {
      idString += 'id=' + id + '&';
    }
    let url = `${endpoint.getUrl()}/export/data_formats?${idString}typeOfSet=patient`;

    return this.http.get(url, {
      headers: headers
    })
      .map((res: Response) => res.json().dataFormats as string[])
      .catch(this.handleError.bind(this));
  }

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<ExportJob[]>}
   */
  getExportJobs(): Observable<ExportJob[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    let url = `${endpoint.getUrl()}/export/jobs`;
    return this.http.get(url, {
      headers: headers
    })
      .map((res: Response) => res.json().exportJobs as ExportJob[])
      .catch(this.handleError.bind(this));
  }

  /**
   * Create a new export job for the current user, with a given name
   * @param name
   * @returns {Observable<ExportJob>}
   */
  createExportJob(name: string): Observable<ExportJob> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({headers: headers});
    let url = `${endpoint.getUrl()}/export/job`;
    if (name) { url += `?name=${name}`; }

    return this.http.post(url, {}, options)
      .map((res: Response) => res.json().exportJob as ExportJob)
      .catch(this.handleError.bind(this));
  }

  /**
   * Run an export job:
   * the setOption should be either 'patient' or 'observation';
   * the ids should be an array of patient-set ids or observation-set ids;
   * the elements should be an array of objects like this -
   * {
   *    dataType: 'clinical',
   *    format: 'TSV'
   * }
   * @param jobId
   * @param setOption
   * @param ids
   * @param elements
   * @returns {Observable<R|T>}
   */
  runExportJob(jobId: string,
               setOption: string,
               ids: string[],
               elements: Object[]): Observable<ExportJob> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({headers: headers});
    let idString = '';
    for (let id of ids) {
      idString += 'id=' + id + '&';
    }
    let elementString = JSON.stringify(elements);
    let url = `${endpoint.getUrl()}/export/${jobId}/run?typeOfSet=${setOption}&${idString}elements=${elementString}`;

    return this.http.post(url, {}, options)
      .map((res: Response) => res.json().exportJob as ExportJob)
      .catch(this.handleError.bind(this));
  }

  /**
   * Given an export job id, return the blob (zipped file) ready to be used on frontend
   * @param jobId
   * @returns {Observable<blob>}
   */
  downloadExportJob(jobId: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/zip');
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);

    let url = `${endpoint.getUrl()}/export/${jobId}/download`;
    return this.http.get(url, {
      headers: headers,
      responseType: ResponseContentType.Blob
    })
      .map((res: Response) => res)
      .catch(this.handleError.bind(this));
  }

}
