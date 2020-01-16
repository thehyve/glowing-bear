/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2019  LDS EPFL
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {TreeNodeService} from './tree-node.service';
import {ExploreQuery} from '../models/query-models/explore-query';
import {ConstraintService} from './constraint.service';
import {AppConfig} from '../config/app.config';
import {ExploreQueryType} from "../models/query-models/explore-query-type";
import {AuthenticationService} from "./authentication/authentication.service";
import {Observable, of} from "rxjs";
import {map, switchMap, tap} from 'rxjs/operators';
import {ExploreQueryService} from "./api/medco-node/explore-query.service";
import {ExploreQueryResult} from "../models/api-response-models/medco-node/explore-query-result";
import {CryptoService} from "./crypto.service";
import {GenomicAnnotationsService} from "./api/genomic-annotations.service";

/**
 * This service concerns with updating subject counts.
 */
@Injectable()
export class QueryService {

  // the currently selected query
  private _query: ExploreQuery;

  // list of available query types
  private _availableExploreQueryTypes: ExploreQueryType[];

  // the explore query results
  private _globalCount: number;
  private _perSiteCounts: number[];
  private _patientLists: string[][];

  // flag indicating if the counts are being updated
  private _isUpdating;

  // flag indicating if the query has been changed
  private _isDirty = false;

  constructor(private appConfig: AppConfig,
              private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
              private exploreQueryService: ExploreQueryService,
              private authService: AuthenticationService,
              private cryptoService: CryptoService,
              private genomicAnnotationsService: GenomicAnnotationsService) {
    this.clearAll();
  }

  clearAll() {
    this.globalCount = 0;
    this.perSiteCounts = [];
    this.patientLists = [];
    this.isUpdating = false;
    this.isDirty = false;
    this.constraintService.clearConstraint();
    this.query = new ExploreQuery();
  }

  private parseExploreQueryResults(results: ExploreQueryResult[]) {
    if (results.length === 0) {
      console.log("Empty results, no processing done");
      return
    }

    switch (this.query.type) {
      case ExploreQueryType.COUNT_GLOBAL || ExploreQueryType.COUNT_GLOBAL_OBFUSCATED:
        this.globalCount = this.cryptoService.decryptInteger(results[0].encryptedCount);
        break;

      case ExploreQueryType.COUNT_PER_SITE || ExploreQueryType.COUNT_PER_SITE_OBFUSCATED ||
        ExploreQueryType.COUNT_PER_SITE_SHUFFLED || ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED || ExploreQueryType.PATIENT_LIST:
        this.perSiteCounts = results.map((result) => this.cryptoService.decryptInteger(result.encryptedCount));
        this.globalCount = this.perSiteCounts.reduce((a, b) => a+b);
        break;

      default:
        console.error(`unknown explore query type: ${this.query.type}`)
    }

    if (this.query.type === ExploreQueryType.PATIENT_LIST) {
      this.patientLists = results.map((result) => result.encryptedPatientList);
    }
  }

  public execQuery(): void {
    this.isUpdating = true;

    // prepare and execute query
    this.query.generateUniqueId();
    this.query.constraint = this.constraintService.constraint();

    this.genomicAnnotationsService.addVariantIdsToConstraints(this.query.constraint).pipe(
      switchMap( () => this.exploreQueryService.exploreQuery(this.query))
    ).subscribe(
      (results: ExploreQueryResult[]) => {
        this.parseExploreQueryResults(results);
        this.isUpdating = false;
        this.isDirty = false;
      },
      err => console.error(`error during explore query: ${err}`)
    );
  }

  get globalCount(): number {
    return this._globalCount;
  }

  set globalCount(value: number) {
    this._globalCount = value;
  }

  get query(): ExploreQuery {
    return this._query;
  }

  set query(value: ExploreQuery) {
    this._query = value;
  }

  get perSiteCounts(): number[] {
    return this._perSiteCounts;
  }

  set perSiteCounts(value: number[]) {
    this._perSiteCounts = value;
  }

  get patientLists(): string[][] {
    return this._patientLists;
  }

  set patientLists(value: string[][]) {
    this._patientLists = value;
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

  get availableExploreQueryTypes(): Observable<ExploreQueryType[]> {

    if (this._availableExploreQueryTypes) {
      return of(this._availableExploreQueryTypes);
    }

    return this.authService.authorisations.pipe(map((authorizations) => {

      this._availableExploreQueryTypes = [];

      for (let authorization of authorizations) {
        switch (authorization) {
          case ExploreQueryType.PATIENT_LIST.id:
            this._availableExploreQueryTypes.push(ExploreQueryType.PATIENT_LIST);
            break;

          case ExploreQueryType.COUNT_PER_SITE.id:
            this._availableExploreQueryTypes.push(ExploreQueryType.COUNT_PER_SITE);
            break;

          case ExploreQueryType.COUNT_PER_SITE_OBFUSCATED.id:
            this._availableExploreQueryTypes.push(ExploreQueryType.COUNT_PER_SITE_OBFUSCATED);
            break;

          case ExploreQueryType.COUNT_PER_SITE_SHUFFLED.id:
            this._availableExploreQueryTypes.push(ExploreQueryType.COUNT_PER_SITE_SHUFFLED);
            break;

          case ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED.id:
            this._availableExploreQueryTypes.push(ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED);
            break;

          case ExploreQueryType.COUNT_GLOBAL.id:
            this._availableExploreQueryTypes.push(ExploreQueryType.COUNT_GLOBAL);
            break;

          case ExploreQueryType.COUNT_GLOBAL_OBFUSCATED.id:
            this._availableExploreQueryTypes.push(ExploreQueryType.COUNT_GLOBAL_OBFUSCATED);
            break;

          default:
            console.log("could not parse authorization " + authorization);
            break;
        }
      }

      return this._availableExploreQueryTypes;
    }));
  }
}
