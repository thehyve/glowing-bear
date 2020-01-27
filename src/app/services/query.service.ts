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
import {AuthenticationService} from "./authentication.service";
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
      case ExploreQueryType.COUNT_GLOBAL:
      case ExploreQueryType.COUNT_GLOBAL_OBFUSCATED:
        this.globalCount = this.cryptoService.decryptIntegerWithEphemeralKey(results[0].encryptedCount);
        break;

      case ExploreQueryType.COUNT_PER_SITE:
      case ExploreQueryType.COUNT_PER_SITE_OBFUSCATED:
      case ExploreQueryType.COUNT_PER_SITE_SHUFFLED:
      case ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED:
      case ExploreQueryType.PATIENT_LIST:
        this.perSiteCounts = results.map((result) => this.cryptoService.decryptIntegerWithEphemeralKey(result.encryptedCount));
        this.globalCount = this.perSiteCounts.reduce((a, b) => a+b);
        break;

      default:
        console.error(`unknown explore query type: ${this.query.type}`);
        break;
    }

    console.log(`Parsed results of ${results.length} nodes with a global count of ${this.globalCount}`);

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

  get availableExploreQueryTypes(): ExploreQueryType[] {

    if (this._availableExploreQueryTypes) {
      return this._availableExploreQueryTypes
    }

    this._availableExploreQueryTypes = this.authService.userRoles.map((role) => {
      switch (role) {
        case ExploreQueryType.PATIENT_LIST.id:
          return ExploreQueryType.PATIENT_LIST;

        case ExploreQueryType.COUNT_PER_SITE.id:
          return ExploreQueryType.COUNT_PER_SITE;

        case ExploreQueryType.COUNT_PER_SITE_OBFUSCATED.id:
          return ExploreQueryType.COUNT_PER_SITE_OBFUSCATED;

        case ExploreQueryType.COUNT_PER_SITE_SHUFFLED.id:
          return ExploreQueryType.COUNT_PER_SITE_SHUFFLED;

        case ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED.id:
          return ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED;

        case ExploreQueryType.COUNT_GLOBAL.id:
          return ExploreQueryType.COUNT_GLOBAL;

        case ExploreQueryType.COUNT_GLOBAL_OBFUSCATED.id:
          return ExploreQueryType.COUNT_GLOBAL_OBFUSCATED;

        default:
          return null;
      }
    }).filter((role) => role !== null);

    console.log(`User ${this.authService.username} explore query types: ${this._availableExploreQueryTypes}`);
    return this._availableExploreQueryTypes;
  }
}
