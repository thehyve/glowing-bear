/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2019 - 2020 LDS EPFL
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { TreeNodeService } from './tree-node.service';
import { ExploreQuery } from '../models/query-models/explore-query';
import { ConstraintService } from './constraint.service';
import { AppConfig } from '../config/app.config';
import { ExploreQueryType } from '../models/query-models/explore-query-type';
import { AuthenticationService } from './authentication.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ExploreQueryService } from './api/medco-node/explore-query.service';
import { ApiExploreQueryResult } from '../models/api-response-models/medco-node/api-explore-query-result';
import { CryptoService } from './crypto.service';
import { GenomicAnnotationsService } from './api/genomic-annotations.service';
import { ExploreQueryResult } from '../models/query-models/explore-query-result';
import { Observable, ReplaySubject, throwError, Subject } from 'rxjs';
import { ErrorHelper } from '../utilities/error-helper';
import { MessageHelper } from '../utilities/message-helper';

/**
 * This service concerns with updating subject counts.
 */
@Injectable()
export class QueryService {

  // the currently selected query
  private _query: ExploreQuery;

  // the query type the user is authorized to
  private _queryType: ExploreQueryType;

  // the current query results
  private readonly _queryResults: ReplaySubject<ExploreQueryResult>;

  // flag indicating if the counts are being updated
  private _isUpdating;

  // flag indicating if the query has been changed
  private _isDirty;

  private _lastSuccessfulSet = new Subject<number[]>()
  // i2b2 query-level timing policy
  private _queryTimingSameInstance = false;


  constructor(private appConfig: AppConfig,
    private treeNodeService: TreeNodeService,
    private constraintService: ConstraintService,
    private exploreQueryService: ExploreQueryService,
    private authService: AuthenticationService,
    private cryptoService: CryptoService,
    private genomicAnnotationsService: GenomicAnnotationsService) {
    this._queryResults = new ReplaySubject<ExploreQueryResult>(1);
    this.clearAll();
  }

  clearAll() {
    this.queryResults.next();
    this.isUpdating = false;
    this.isDirty = false;
    this.constraintService.clearConstraint();
    this.query = new ExploreQuery();
  }

  /**
   * Parse and decrypt results from MedCo nodes.
   */
  private parseExploreQueryResults(encResults: ApiExploreQueryResult[]): ExploreQueryResult {
    if (encResults.length === 0) {
      throw ErrorHelper.handleNewError('Empty results, no processing done');
    }

    let parsedResults = new ExploreQueryResult();
    switch (this.queryType) {
      case ExploreQueryType.COUNT_GLOBAL:
      case ExploreQueryType.COUNT_GLOBAL_OBFUSCATED:
        parsedResults.globalCount = this.cryptoService.decryptIntegerWithEphemeralKey(encResults[0].encryptedCount);
        break;

      case ExploreQueryType.COUNT_PER_SITE:
      case ExploreQueryType.COUNT_PER_SITE_OBFUSCATED:
      case ExploreQueryType.COUNT_PER_SITE_SHUFFLED:
      case ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED:
      case ExploreQueryType.PATIENT_LIST:
        parsedResults.perSiteCounts = encResults.map((result) => this.cryptoService.decryptIntegerWithEphemeralKey(result.encryptedCount));
        parsedResults.globalCount = parsedResults.perSiteCounts.reduce((a, b) => a + b);
        break;

      default:
        throw ErrorHelper.handleNewError(`unknown explore query type: ${this.queryType}`);
    }

    if (this.queryType === ExploreQueryType.PATIENT_LIST) {
      parsedResults.resultInstanceID = encResults.map(({ patientSetID }) => patientSetID)
      parsedResults.patientLists = encResults.map((result) =>
        result.encryptedPatientList ? result.encryptedPatientList.map((encryptedPatientID) =>
          this.cryptoService.decryptIntegerWithEphemeralKey(encryptedPatientID)
        ) : []);

      if (parsedResults.globalCount === 0) {
        MessageHelper.alert('success', 'No patients found matching this query');
      }

    }

    console.log(`Parsed results of ${encResults.length} nodes with a global count of ${parsedResults.globalCount}`);
    return parsedResults;
  }

  public execQuery(): void {

    if (!this.constraintService.hasConstraint()) {
      MessageHelper.alert('warn', 'No constraints specified, please correct.');
      return;
    } else if (!this.queryType) {
      MessageHelper.alert('warn', 'No authorized query type.');
      return;
    }

    this.isUpdating = true;

    // prepare and execute query
    this.query.generateUniqueId();
    this.query.constraint = this.constraintService.generateConstraint();
    this.query.queryTimingSameInstanceNum = this.queryTimingSameInstance

    this.genomicAnnotationsService.addVariantIdsToConstraints(this.query.constraint).pipe(
      catchError((err) => {
        MessageHelper.alert('warn', 'Invalid genomic annotation in query, please correct.');
        return throwError(err);
      }),
      switchMap(() => this.exploreQueryService.exploreQuery(this.query))
    ).subscribe(
      (results: ApiExploreQueryResult[]) => {
        let parsedResults = this.parseExploreQueryResults(results);
        if (parsedResults.resultInstanceID) {
          this._lastSuccessfulSet.next(parsedResults.resultInstanceID)
        }
        this.queryResults.next(parsedResults);
        this.isUpdating = false;
        this.isDirty = false;
      },
      (err) => {
        ErrorHelper.handleError(`Error during explore query ${this.query.uniqueId}`, err);
        this.isUpdating = false;
        this.isDirty = true;
      }
    );
  }

  get query(): ExploreQuery {
    return this._query;
  }

  set query(value: ExploreQuery) {
    this._query = value;
  }

  get queryResults(): ReplaySubject<ExploreQueryResult> {
    return this._queryResults;
  }

  get isUpdating(): boolean {
    return this._isUpdating;
  }

  set isUpdating(value: boolean) {
    this._isUpdating = value;
  }

  get isDirty(): boolean {
    return this._isDirty;
  }

  set isDirty(value: boolean) {
    this._isDirty = value;
  }

  // get the query type from the user's authorizations
  get queryType(): ExploreQueryType {

    if (this._queryType) {
      return this._queryType;
    }

    // map authorization to query type
    let authorizedTypes = this.authService.userRoles.map((role) => {
      switch (role) {
        case ExploreQueryType.PATIENT_LIST.id:
          return ExploreQueryType.PATIENT_LIST;

        case ExploreQueryType.COUNT_PER_SITE.id:
          return ExploreQueryType.COUNT_PER_SITE;

        case ExploreQueryType.COUNT_GLOBAL.id:
          return ExploreQueryType.COUNT_GLOBAL;

        default:
          return null;
      }
    }).filter((role) => role !== null);

    if (authorizedTypes.length === 0) {
      console.log(`User ${this.authService.username} has no explore query types available.`);
      return undefined;
    }

    // select the most permissive query type
    this._queryType = authorizedTypes.reduce((prevRole, curRole) => {
      if (!prevRole || curRole.weight > prevRole.weight) {
        return curRole;
      } else {
        return prevRole;
      }
    })

    console.log(`User ${this.authService.username} has explore query types: ${authorizedTypes}, selected ${this._queryType}`);
    return this._queryType;
  }


  /**
   * Whether of not the explore results component should be visible.
   */
  get displayExploreResultsComponent(): Observable<boolean> {
    return this.queryResults.pipe(map((queryResults) =>
      queryResults !== undefined && this.queryType.hasPerSiteCounts && queryResults.globalCount > 0));
  }

  get lastSuccessfulSet(): Observable<number[]> {
    return this._lastSuccessfulSet.asObservable()
  }
  get queryTimingSameInstance(): boolean {
    return this._queryTimingSameInstance
  }

  set queryTimingSameInstance(val: boolean) {
    this._queryTimingSameInstance = val
  }
}
