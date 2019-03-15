/**
 * Copyright 2019 The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {ResourceService} from './resource.service';
import {CountItem} from '../models/aggregate-models/count-item';
import {AppConfig} from '../config/app.config';
import {Constraint} from '../models/constraint-models/constraint';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHelper} from '../utilities/error-helper';
import {ConstraintHelper} from '../utilities/constraint-utilities/constraint-helper';
import {SubjectSetConstraint} from '../models/constraint-models/subject-set-constraint';


@Injectable({
  providedIn: 'root'
})
export class CountService {

  // the counts in the gb-cohort-selection, number of subjects matching a specified criteria
  private _currentSelectionCount: CountItem;
  // The total numbers of subjects & observations for all the cohorts
  private _allCohortsCount: CountItem;

  // Flag indicating if the observation counts are calculated and shown
  private _showObservationCounts: boolean;

  /**
   * The map that holds the conceptCode -> count item relations
   *  e.g.
   * "EHR:DEM:AGE": {
   *   "observationCount": 3,
   *   "subjectCount": 3
   *  },
   * "EHR:VSIGN:HR": {
   *  "observationCount": 9,
   *  "subjectCount": 3
   * }
   */
  private _conceptCountMap: Map<string, CountItem>;
  /**
   * The map that holds the studyId -> count item relations
   * e.g.
   * "MIX_HD": {
   *   "observationCount": 12,
   *   "subjectCount": 3
   * }
   */
  private _studyCountMap: Map<string, CountItem>;
  /**
   * The map that holds the studyId -> conceptCode -> count item relations
   * e.g.
   * "SHARED_CONCEPTS_STUDY_A": {
   *    "DEMO:POB": {
   *        "observationCount": 2,
   *        "subjectCount": 2
   *    },
   *    "VSIGN:HR": {
   *        "observationCount": 3,
   *        "subjectCount": 3
   *    }
   * }
   */
  private _studyConceptCountMap: Map<string, Map<string, CountItem>>;

  // the subset of _studyConceptCountMap that holds the selected maps,
  // which corresponds to the selected cohort(s)
  private _selectedStudyConceptCountMap: Map<string, Map<string, CountItem>>;
  // the subset of _studyCountMap that holds the selected studies,
  // which corresponds to the selected cohort(s)
  private _selectedStudyCountMap: Map<string, CountItem>;
  // the subset of _conceptCountMap that holds the selected maps,
  // which corresponds to the selected cohort(s)
  private _selectedConceptCountMap: Map<string, CountItem>;
  // the async subject telling if the selectedConceptCountMap is updated
  private _selectedConceptCountMapUpdated: Subject<Map<string, CountItem>>
    = new Subject<Map<string, CountItem>>();


  constructor(private appConfig: AppConfig,
              private resourceService: ResourceService) {
    this.showObservationCounts = this.appConfig.getConfig('show-observation-counts');
    this.initializeCounts();
  }

  initializeCounts() {
    this.allCohortsCount = new CountItem(0, 0);
    this.currentSelectionCount = new CountItem(0, 0);
  }

  updateAllCounts(constraint: Constraint) {
    const patientLevelConstraint = ConstraintHelper.ensurePatientLevelConstraint(constraint);
    return new Promise((resolve, reject) => {
      forkJoin(
        this.getCounts(constraint),
        this.resourceService.getCountsPerStudy(patientLevelConstraint),
        this.resourceService.getCountsPerStudyAndConcept(patientLevelConstraint),
        this.resourceService.getCountsPerConcept(patientLevelConstraint)
      ).subscribe(res => {
        this.allCohortsCount = res[0];
        this.selectedStudyCountMap = res[1];
        this.selectedStudyConceptCountMap = res[2];
        this.selectedConceptCountMap = res[3];
        resolve(true);
      }, (err) => {
        reject(err);
      })
    });
  }

  /**
   * When no observation counts requested, takes advantage of subject set constraint knowing number of subjects.
   * Falls back to making reqular call otherwise
   * @param constraint
   */
  getCounts(constraint: Constraint) {
    if (!this.showObservationCounts
      && constraint instanceof SubjectSetConstraint
      && constraint.setSize > -1) {
      let countItem = new CountItem(constraint.setSize, -1);
      return Observable.of(countItem);
    }
    return this.resourceService.getCounts(constraint);
  }

  updateCurrentSelectionCount(constraint: Constraint): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.updateCohortSelectionCounts(constraint)
        .then(() => {
          let cohortSelectionCounts = this.resourceService.cohortSelectionCounts;
          this.currentSelectionCount.subjectCount = cohortSelectionCounts.subjectCount;
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /*
   * ------------------------------------------------------------------------- countMap-related methods
   */
  loadCountMaps(): Promise<any> {
    return new Promise((resolve, reject) => {
      let promise1 = this.loadConceptCountMap();
      let promise2 = this.loadStudyCountMap();
      let promise3 = this.loadStudyConceptCountMap();
      Promise.all([promise1, promise2, promise3])
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        })
    });
  }

  loadConceptCountMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.getCountsPerConcept(new TrueConstraint())
        .subscribe((map: Map<string, CountItem>) => {
          this.conceptCountMap = map;
          resolve(true);
        }, (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
          reject('Fail to load concept count map from server.');
        });
    });
  }

  loadStudyCountMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.getCountsPerStudy(new TrueConstraint())
        .subscribe((map: Map<string, CountItem>) => {
          this.studyCountMap = map;
          resolve(true);
        }, (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
          reject('Fail to load study count map from server.');
        });
    });
  }

  loadStudyConceptCountMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.getCountsPerStudyAndConcept(new TrueConstraint())
        .subscribe((map: Map<string, Map<string, CountItem>>) => {
          this.studyConceptCountMap = map;
          resolve(true);
        }, (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
          reject('Fail to load study-concept count map from server.');
        });
    });
  }

  get currentSelectionCount(): CountItem {
    return this._currentSelectionCount;
  }

  set currentSelectionCount(value: CountItem) {
    this._currentSelectionCount = value;
  }

  get allCohortsCount(): CountItem {
    return this._allCohortsCount;
  }

  set allCohortsCount(value: CountItem) {
    this._allCohortsCount = value;
  }

  get showObservationCounts(): boolean {
    return this._showObservationCounts;
  }

  set showObservationCounts(value: boolean) {
    this._showObservationCounts = value;
  }

  get conceptCountMap(): Map<string, CountItem> {
    return this._conceptCountMap;
  }

  set conceptCountMap(value: Map<string, CountItem>) {
    this._conceptCountMap = value;
  }

  get studyCountMap(): Map<string, CountItem> {
    return this._studyCountMap;
  }

  set studyCountMap(value: Map<string, CountItem>) {
    this._studyCountMap = value;
  }

  get studyConceptCountMap(): Map<string, Map<string, CountItem>> {
    return this._studyConceptCountMap;
  }

  set studyConceptCountMap(value: Map<string, Map<string, CountItem>>) {
    this._studyConceptCountMap = value;
  }

  get selectedConceptCountMap(): Map<string, CountItem> {
    return this._selectedConceptCountMap;
  }

  set selectedConceptCountMap(value: Map<string, CountItem>) {
    this._selectedConceptCountMap = value;
    this.selectedConceptCountMapUpdated.next(value);
  }

  get selectedConceptCountMapUpdated(): Subject<Map<string, CountItem>> {
    return this._selectedConceptCountMapUpdated;
  }

  set selectedConceptCountMapUpdated(value: Subject<Map<string, CountItem>>) {
    this._selectedConceptCountMapUpdated = value;
  }

  get selectedStudyCountMap(): Map<string, CountItem> {
    return this._selectedStudyCountMap;
  }

  set selectedStudyCountMap(value: Map<string, CountItem>) {
    this._selectedStudyCountMap = value;
  }

  get selectedStudyConceptCountMap(): Map<string, Map<string, CountItem>> {
    return this._selectedStudyConceptCountMap;
  }

  set selectedStudyConceptCountMap(value: Map<string, Map<string, CountItem>>) {
    this._selectedStudyConceptCountMap = value;
  }

}
