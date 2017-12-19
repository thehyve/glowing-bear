import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions, ResponseContentType} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Study} from '../models/study';
import {EndpointService} from './endpoint.service';
import {Constraint} from '../models/constraints/constraint';
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

  /**
   * Make a post http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param body
   * @param responseField
   * @returns {any}
   */
  private postCall(urlPart, body, responseField) {
    const endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      const options = new RequestOptions({headers: headers});
      const url = `${endpoint.getUrl()}/${urlPart}`;
      if (responseField) {
        return this.http.post(url, body, options)
          .map((res: Response) => res.json()[responseField])
          .catch(this.handleError.bind(this));
      } else {
        return this.http.post(url, body, options)
          .map((res: Response) => res.json())
          .catch(this.handleError.bind(this));
      }
    } else {
      this.handleError({message: 'Could not establish endpoint.'});
    }
  }

  /**
   * Make a get http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param responseField
   * @returns {Observable<any | any>}
   */
  private getCall(urlPart, responseField) {
    const endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      const options = new RequestOptions({headers: headers});
      const url = `${endpoint.getUrl()}/${urlPart}`;
      if (responseField) {
        return this.http.get(url, options)
          .map((response: Response) => response.json()[responseField])
          .catch(this.handleError.bind(this));
      } else {
        return this.http.get(url, options)
          .map((response: Response) => response.json())
          .catch(this.handleError.bind(this));
      }

    } else {
      this.handleError({message: 'Could not establish endpoint.'});
    }
  }

  /**
   * Make a put http request
   * @param urlPart
   * @param body
   * @returns {Observable<any | any>}
   */
  private putCall(urlPart, body) {
    const endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({headers: headers});
      let url = `${endpoint.getUrl()}/${urlPart}`;
      return this.http.put(url, body, options)
        .catch(this.handleError.bind(this));
    } else {
      this.handleError({message: 'Could not establish endpoint.'});
    }
  }

  /**
   * Make a delete http request
   * @param urlPart
   * @returns {Observable<any | any>}
   */
  private deleteCall(urlPart) {
    const endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({headers: headers});
      let url = `${endpoint.getUrl()}/${urlPart}`;
      return this.http.delete(url, options)
        .catch(this.handleError.bind(this));
    } else {
      this.handleError({message: 'Could not establish endpoint.'});
    }
  }

  // -------------------------------------- tree node calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<Study[]> {
    const urlPart = 'studies';
    const responseField = 'studies';
    return this.getCall(urlPart, responseField);
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
    let urlPart = `tree_nodes?root=${root}&depth=${depth}`;
    if (hasCounts) {
      urlPart += '&counts=true';
    }
    if (hasTags) {
      urlPart += '&tags=true';
    }
    const responseField = 'tree_nodes';
    return this.getCall(urlPart, responseField);
  }

  // -------------------------------------- observations calls --------------------------------------
  /**
   * Given a constraint, get the patient counts and observation counts
   * organized per study, then per concept
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudyAndConcept(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/counts_per_study_and_concept';
    const constraintString = JSON.stringify(constraint.toQueryObject());
    const body = {constraint: constraintString};
    const responseField = 'countsPerStudy';
    return this.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- observation calls --------------------------------------
  /**
   * Give a constraint, get the corresponding patient count and observation count.
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCounts(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/counts';
    const constraintString = JSON.stringify(constraint.toQueryObject());
    const body = {constraint: constraintString};
    const responseField = false;
    return this.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- aggregate calls --------------------------------------
  /**
   * Get the aggregate based on the given constraint and aggregate options,
   * the options can be {min, max, count, values, average}
   * @param {Constraint} constraint
   * @returns {Observable<object>}
   */
  getAggregate(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/aggregates_per_concept';
    const body = {constraint: JSON.stringify(constraint.toQueryObject())};
    const responseField = 'aggregatesPerConcept';
    return this.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- trial visit calls --------------------------------------
  /**
   * Given a constraint, normally a concept or a study constraint, return the corresponding trial visit list
   * @param constraint
   * @returns {Observable<R|T>}
   */
  getTrialVisits(constraint: Constraint): Observable<TrialVisit[]> {
    const constraintString = JSON.stringify(constraint.toQueryObject());
    const urlPart = `dimensions/trial visit/elements?constraint=${constraintString}`;
    const responseField = 'elements';
    return this.getCall(urlPart, responseField);
  }

  // -------------------------------------- pedigree calls --------------------------------------
  /**
   * Get the available pedigree relation types such as parent, child, spouse, sibling and various twin types
   * @returns {Observable<Object[]>}
   */
  getPedigreeRelationTypes(): Observable<object[]> {
    const urlPart = 'pedigree/relation_types';
    const responseField = 'relationTypes';
    return this.getCall(urlPart, responseField);
  }

  // -------------------------------------- patient set calls --------------------------------------
  createPatientSet(name: string, constraint: Constraint): Observable<object> {
    const urlPart = `patient_sets?name=${name}`;
    const body = constraint.toQueryObject();
    return this.postCall(urlPart, body, null);
  }

  // -------------------------------------- export calls --------------------------------------
  /**
   * Given a list of patient set ids as strings, get the corresponding data formats available for download
   * @param constraint
   * @returns {Observable<string[]>}
   */
  getExportDataFormats(constraint: Constraint): Observable<string[]> {
    const urlPart = 'export/data_formats';
    const body = {constraint: constraint.toQueryObject()};
    const responseField = 'dataFormats';
    return this.postCall(urlPart, body, responseField);
  }

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<ExportJob[]>}
   */
  getExportJobs(): Observable<any[]> {
    const urlPart = 'export/jobs';
    const responseField = 'exportJobs';
    return this.getCall(urlPart, responseField);
  }

  /**
   * Create a new export job for the current user, with a given name
   * @param name
   * @returns {Observable<ExportJob>}
   */
  createExportJob(name: string): Observable<ExportJob> {
    const urlPart = `export/job?name=${name}`;
    const responseField = 'exportJob';
    return this.postCall(urlPart, {}, responseField);
  }

  /**
   * Run an export job:
   * the elements should be an array of objects like this -
   * [{
   *    dataType: 'clinical',
   *    format: 'TSV',
   *    dataView: 'surveyTable' // NTR specific
   * }]
   *
   * @param jobId
   * @param elements
   * @param constraint
   * @returns {Observable<ExportJob>}
   */
  runExportJob(jobId: string,
               constraint: Constraint,
               elements: object[]): Observable<ExportJob> {
    const urlPart = `export/${jobId}/run`;
    const responseField = 'exportJob';
    const body = {
      constraint: constraint.toQueryObject(),
      elements: elements
    };
    return this.postCall(urlPart, body, responseField);
  }

  /**
   * Given an export job id, return the blob (zipped file) ready to be used on frontend
   * @param jobId
   * @returns {Observable<blob>}
   */
  downloadExportJob(jobId: string) {
    let endpoint = this.endpointService.getEndpoint();
    let headers = new Headers();
    headers.append('Content-Type', 'application/zip');
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    let url = `${endpoint.getUrl()}/export/${jobId}/download`;
    const options = new RequestOptions({
      headers: headers,
      responseType: ResponseContentType.Blob
    });
    return this.http.get(url, options)
      .map((res: Response) => res)
      .catch(this.handleError.bind(this));
  }

  // -------------------------------------- query calls --------------------------------------
  /**
   * Get the queries that the current user has saved.
   * @returns {Observable<Query[]>}
   */
  getQueries(): Observable<Query[]> {
    const urlPart = `queries`;
    const responseField = 'queries';
    return this.getCall(urlPart, responseField);
  }

  /**
   * Save a new query.
   * @param {Object} queryBody
   * @returns {Observable<Query>}
   */
  saveQuery(queryBody: object): Observable<Query> {
    const urlPart = `queries`;
    const body = JSON.stringify(queryBody);
    return this.postCall(urlPart, body, null);
  }

  /**
   * Modify an existing query.
   * @param {string} queryId
   * @param {Object} queryBody
   * @returns {Observable<Query>}
   */
  updateQuery(queryId: string, queryBody: object): Observable<null> {
    const urlPart = `queries/${queryId}`;
    const body = JSON.stringify(queryBody);
    return this.putCall(urlPart, body);
  }

  /**
   * Delete an existing query.
   * @param {string} queryId
   * @returns {Observable<any>}
   */
  deleteQuery(queryId: string): Observable<null> {
    const urlPart = `queries/${queryId}`;
    return this.deleteCall(urlPart);
  }

}
