/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HttpHelper} from 'app/utilities/http-helper';
import {AppConfig} from '../config/app.config';
import {GbBackendQuery} from '../models/gb-backend-models/gb-backend-query';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GbBackendHttpService {

  private httpHelper: HttpHelper;
  private _endpointUrl: string;

  constructor(private appConfig: AppConfig, httpClient: HttpClient) {
    this.endpointUrl = `${this.appConfig.getConfig('gb-backend-url')}`;
    this.httpHelper = new HttpHelper(this.endpointUrl, httpClient);
  }

  get endpointUrl(): string {
    return this._endpointUrl;
  }

  set endpointUrl(value: string) {
    this._endpointUrl = value;
  }


  // -------------------------------------- query calls --------------------------------------
  /**
   * Get the queries that the current user has saved.
   * @returns {Observable<Query[]>}
   */
  getQueries(): Observable<GbBackendQuery[]> {
    const urlPart = `queries`;
    const responseField = 'queries';
    return this.httpHelper.getCall(urlPart, responseField);
  }

  /**
   * save a new query
   * @param {GbBackendQuery} transmartQuery
   * @returns {Observable<GbBackendQuery>}
   */
  saveQuery(transmartQuery: GbBackendQuery): Observable<GbBackendQuery> {
    const urlPart = `queries`;
    const queryBody = {};
    if (transmartQuery.name) {
      queryBody['name'] = transmartQuery.name;
    }
    if (transmartQuery.queryConstraint) {
      queryBody['queryConstraint'] = transmartQuery.queryConstraint;
    }
    if (transmartQuery.bookmarked) {
      queryBody['bookmarked'] = transmartQuery.bookmarked;
    }
    if (transmartQuery.subscribed) {
      queryBody['subscribed'] = transmartQuery.subscribed;
    }
    if (transmartQuery.subscriptionFreq) {
      queryBody['subscriptionFreq'] = transmartQuery.subscriptionFreq;
    }
    if (transmartQuery.queryBlob) {
      queryBody['queryBlob'] = transmartQuery.queryBlob;
    }
    return this.httpHelper.postCall(urlPart, queryBody, null);
  }

  /**
   * Modify an existing query.
   * @param {string} queryId
   * @param {Object} queryBody
   * @returns {Observable<Query>}
   */
  updateQuery(queryId: string, queryBody: object): Observable<{}> {
    const urlPart = `queries/${queryId}`;
    return this.httpHelper.putCall(urlPart, queryBody);
  }

  /**
   * Delete an existing query.
   * @param {string} queryId
   * @returns {Observable<any>}
   */
  deleteQuery(queryId: string): Observable<{}> {
    const urlPart = `queries/${queryId}`;
    return this.httpHelper.deleteCall(urlPart);
  }

  // -------------------------------------- query differences --------------------------------------
  /**
   *
   * @param queryId
   */
  diffQuery(queryId: string): Observable<object[]> {
    const urlPart = `queries/${queryId}/sets`;
    const responseField = 'querySets';
    return this.httpHelper.getCall(urlPart, responseField);
  }
}
