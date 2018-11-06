/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Cohort} from '../../models/cohort-models/cohort';
import {CountItem} from '../../models/aggregate-models/count-item';

export class CohortServiceMock {
  private _cohorts: Cohort[] = [];
  inclusionCounts: CountItem;
  exclusionCounts: CountItem;
  counts: CountItem;
  allCounts: CountItem;


  constructor() {
    this.initializeCounts();
  }

  initializeCounts() {
    this.allCounts = new CountItem(0, 0);
    this.inclusionCounts = new CountItem(0, 0);
    this.exclusionCounts = new CountItem(0, 0);
    this.counts = new CountItem(0, 0);
  }

  public updateCurrent(initialUpdate?: boolean): Promise<any> {
    return new Promise<any>(resolve => {
      resolve(true);
    });
  }

  clearAll(): Promise<any> {
    return new Promise<any>(resolve => resolve(true));
  }

  get cohorts(): Cohort[] {
    return this._cohorts;
  }

  set cohorts(value: Cohort[]) {
    this._cohorts = value;
  }

  saveCohortByName(name: string) {
  }

  saveCohortByObject(obj: object) {
  }

  toggleCohortSubscription(target: Cohort) {
  }

  toggleCohortBookmark(target: Cohort) {
  }

  restoreCohort(target: Cohort) {
  }

  deleteCohort(target: Cohort) {
  }

  editCohort(target: Cohort, obj: object) {
  }

}
