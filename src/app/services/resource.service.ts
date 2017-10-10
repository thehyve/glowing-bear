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
import {Aggregate} from '../models/aggregate';
import {ConceptConstraint} from '../models/constraints/concept-constraint';
import {TrialVisit} from '../models/trial-visit';
import {ExportJob} from '../models/export-job';
import {Query} from '../models/query';

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

  // -------------------------------------- tree node calls --------------------------------------
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

  // -------------------------------------- observations calls --------------------------------------
  /**
   * How to use this method:
   * Get the patient count and observation count per study by providing a constraint,
   * the constraint is the patient constraint that the user has composed on the right of the tree nodes,
   * the resulting counts (per study) is an array of counts organized per study from
   * the intersection of the patient constraint and the studies' constraints
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudy(constraint: Constraint): Observable<object> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();

    if (endpoint) {
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      const constraintString = JSON.stringify(constraint.toQueryObject());
      let url = `${endpoint.getUrl()}/observations/counts_per_study?constraint=${constraintString}}`;
      return this.http.get(url, {
        headers: headers
      })
        .map((response: Response) => response.json()['countsPerStudy'])
        .catch(this.handleError.bind(this));
    } else {
      console.error('Could not establish endpoint.');
    }
  }

  /**
   * How to use this method:
   * Get the patient count and observation count per concept by providing a constraint
   * the constraint is the intersection of the patient constraint that the user composed
   * on the right of the tree nodes and the constraint of the specific concept,
   * the resulting counts (per concept) is a single object containing the counts for
   * the specified concept.
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerConcept(constraint: Constraint): Observable<object> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();

    if (endpoint) {
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      const constraintString = JSON.stringify(constraint.toQueryObject());
      let url = `${endpoint.getUrl()}/observations/counts_per_concept?constraint=${constraintString}`;
      return this.http.get(url, {
        headers: headers
      })
        .map((response: Response) => response.json()['countsPerConcept'])
        .catch(this.handleError.bind(this));
    } else {
      console.error('Could not establish endpoint.');
    }
  }

  // -------------------------------------- patient calls --------------------------------------
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
    let constraintString: string = JSON.stringify(constraint.toPatientQueryObject());
    console.log(debugLabel, 'constraint:', constraintString);
    let url = `${endpoint.getUrl()}/patients?constraint=${constraintString}`;
    return this.http.get(url, {
      headers: headers
    })
      .map((res: Response) => res.json().patients as Patient[])
      .catch(this.handleError.bind(this));
  }

  // -------------------------------------- observation calls --------------------------------------
  /**
   * Give a constraint, get the corresponding observation count.
   * @param {Constraint} constraint
   * @returns {Observable<number>}
   */
  getObservationCount(constraint: Constraint): Observable<number> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    let constraintString: string = JSON.stringify(constraint.toQueryObject());
    let url = `${endpoint.getUrl()}/observations/count?constraint=${constraintString}`;
    return this.http.get(url, {
      headers: headers
    })
      .map((res: Response) => res.json()['count'])
      .catch(this.handleError.bind(this));
  }

  /**
   * Given the selected patients and observations,
   * get the count of the observations on those selected patients.
   * @param {Constraint} patientConstraint
   * @param {Constraint} observationConstraint
   * @returns {Observable<number>}
   */
  getPatientObservationCount(patientConstraint: Constraint,
                             observationConstraint: Constraint): Observable<number> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    const combination = {
      type: 'and',
      args: [
        patientConstraint.toPatientQueryObject(),
        observationConstraint.toQueryObject()
      ]
    }; console.log('udate p o cont: ', combination, JSON.stringify(combination));
    const constraintString = JSON.stringify(combination);
    let url = `${endpoint.getUrl()}/observations/count?constraint=${constraintString}`;
    return this.http.get(url, {
      headers: headers
    })
      .map((res: Response) => res.json()['count'])
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

  /**
   * Get the aggregate based on the given constraint and aggregate options,
   * the options can be {min, max, count, values, average}
   * @param {Constraint} constraint
   * @param {string[]} aggregateOptions
   * @returns {Observable<Aggregate>}
   */
  getAggregate(constraint: Constraint, aggregateOptions: string[]): Observable<Aggregate> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    let constraintString = JSON.stringify(constraint.toQueryObject());
    let url = `${endpoint.getUrl()}/observations/aggregate?`;
    let types = '';
    for (let option of aggregateOptions) {
      types += `type=${option}&`;
    }
    url += `${types}constraint=${constraintString}`;

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
  getExportDataFormats(setIds: string[]): Observable<string[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);

    let idString = '';
    for (let id of setIds) {
      idString += 'id=' + id + '&';
    }
    idString = idString.substr(0, idString.length - 1);
    let url = `${endpoint.getUrl()}/export/data_formats?${idString}`;

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
    if (name) {
      url += `?name=${name}`;
    }

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
               ids: string[],
               elements: Object[]): Observable<ExportJob> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({headers: headers});
    let url = `${endpoint.getUrl()}/export/${jobId}/run`;

    return this.http.post(url, {
      id: ids,
      elements: elements
    }, options)
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

  // -------------------------------------- query calls --------------------------------------
  /**
   * Get the queries that the current user has saved.
   * @returns {Observable<Query[]>}
   */
  getQueries(): Observable<Query[]> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      let url = `${endpoint.getUrl()}/queries`;

      return this.http.get(url, {
        headers: headers
      })
        .map((response: Response) => response.json().queries as Query[])
        .catch(this.handleError.bind(this));
    } else {
      console.error('Could not establish endpoint.');
    }
  }

  /**
   * Save a new query.
   * @param {Object} queryBody
   * @returns {Observable<Query>}
   */
  saveQuery(queryBody: object): Observable<Query> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({headers: headers});
      let body = JSON.stringify(queryBody);
      let url = `${endpoint.getUrl()}/queries`;

      return this.http.post(url, body, options)
        .map((res: Response) => res.json() as Query)
        .catch(this.handleError.bind(this));
    } else {
      console.error('Could not establish endpoint.');
    }
  }

  /**
   * Modify an existing query.
   * @param {string} queryId
   * @param {Object} queryBody
   * @returns {Observable<Query>}
   */
  updateQuery(queryId: string, queryBody: object): Observable<null> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({headers: headers});
      let body = JSON.stringify(queryBody);
      let url = `${endpoint.getUrl()}/queries/${queryId}`;

      return this.http.put(url, body, options)
        .catch(this.handleError.bind(this));
    } else {
      console.error('Could not establish endpoint.');
    }
  }

  /**
   * Delete an existing query.
   * @param {string} queryId
   * @returns {Observable<any>}
   */
  deleteQuery(queryId: string): Observable<null> {
    let headers = new Headers();
    let endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({headers: headers});
      let url = `${endpoint.getUrl()}/queries/${queryId}`;

      return this.http.delete(url, options)
        .catch(this.handleError.bind(this));
    } else {
      console.error('Could not establish endpoint.');
    }
  }

}
