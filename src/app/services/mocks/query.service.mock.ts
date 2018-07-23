/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Query} from '../../models/query-models/query';
import {CountItem} from '../../models/aggregate-models/count-item';

export class QueryServiceMock {
  private _queries: Query[] = [];
  counts_0: CountItem;
  inclusionCounts: CountItem;
  exclusionCounts: CountItem;
  counts_1: CountItem;
  counts_2: CountItem;


  constructor() {
    this.initializeCounts();
  }

  initializeCounts() {
    this.counts_0 = new CountItem(0, 0);
    this.inclusionCounts = new CountItem(0, 0);
    this.exclusionCounts = new CountItem(0, 0);
    this.counts_1 = new CountItem(0, 0);
    this.counts_2 = new CountItem(0, 0);
  }

  public update_1(): Promise<any> {
    return new Promise<any>(resolve => {
      resolve(true);
    });
  }

  public update_2(): Promise<any> {
    return new Promise<any>(resolve => {
      resolve(true);
    });
  }

  public update_3(): Promise<any> {
    return new Promise<any>(resolve => {
      resolve(true);
    });
  }

  get queries(): Query[] {
    return this._queries;
  }

  set queries(value: Query[]) {
    this._queries = value;
  }

  saveQueryByName(name: string) {
  }

  saveQueryByObject(obj: object) {
  }

  toggleQuerySubscription(query: Query) {
  }

  toggleQueryBookmark(query: Query) {
  }

  restoreQuery(query: Query) {
  }

  deleteQuery(query: Query) {
  }

  updateQuery(query: Query, queryObj: object) {
  }

}
