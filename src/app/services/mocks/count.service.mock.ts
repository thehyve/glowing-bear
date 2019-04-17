/**
 * Copyright 2019 The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CountItem} from '../../models/aggregate-models/count-item';
import {Subject} from 'rxjs';
import {Constraint} from '../../models/constraint-models/constraint';

export class CountServiceMock {
  currentSelectionCount: CountItem;
  allCohortsCount: CountItem;

  public conceptCountMap: Map<string, CountItem>;
  public studyCountMap: Map<string, CountItem>;
  public studyConceptCountMap: Map<string, Map<string, CountItem>>;
  public selectedConceptCountMapUpdated: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.initializeCounts();

    // construct the maps
    let map1 = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    map1.set('concept1', item1);
    let map2 = new Map<string, CountItem>();
    let item2 = new CountItem(30, 110);
    let item3 = new CountItem(70, 90);
    map2.set('concept2', item2);
    map2.set('concept3', item3);

    this.studyConceptCountMap = new Map<string, Map<string, CountItem>>();
    this.studyConceptCountMap.set('study1', map1);
    this.studyConceptCountMap.set('study2', map2);

    this.studyCountMap = new Map<string, CountItem>();
    this.studyCountMap.set('study1', new CountItem(10, 20));
    this.studyCountMap.set('study2', new CountItem(100, 200));

    this.conceptCountMap = new Map<string, CountItem>();
    this.conceptCountMap.set('concept1', new CountItem(10, 20));
    this.conceptCountMap.set('concept2', new CountItem(30, 110));
    this.conceptCountMap.set('concept3', new CountItem(70, 90));
  }

  initializeCounts() {
    this.allCohortsCount = new CountItem(0, 0);
    this.currentSelectionCount = new CountItem(0, 0);
  }

  updateCountsWithCurrentCohort(initialUpdate?: boolean): Promise<any> {
    return new Promise<any>(resolve => {
      resolve(true);
    });
  }

  loadCountMaps(): Promise<any> {
    return new Promise<any>(resolve => {
      resolve(true);
    });
  }

  updateAllCounts(constraint: Constraint): Promise<any>  {
    return new Promise<any>(resolve => {
      resolve(true);
    });
  }

  updateCurrentSelectionCount(constraint: Constraint): Promise<any> {
    return new Promise<any>(resolve => {
      resolve(true);
    });
  }
}
