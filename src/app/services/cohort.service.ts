/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Injectable} from '@angular/core';
import {ResourceService} from './resource.service';
import {Cohort} from '../models/cohort-models/cohort';
import {ConstraintService} from './constraint.service';
import {AppConfig} from '../config/app.config';
import {CohortDiffRecord} from '../models/cohort-models/cohort-diff-record';
import {CohortSetType} from '../models/cohort-models/cohort-set-type';
import {CohortDiffItem} from '../models/cohort-models/cohort-diff-item';
import {CohortDiffType} from '../models/cohort-models/cohort-diff-type';
import {CohortSubscriptionFrequency} from '../models/cohort-models/cohort-subscription-frequency';
import {ConstraintHelper} from '../utilities/constraint-utilities/constraint-helper';
import {MessageHelper} from '../utilities/message-helper';
import {ErrorHelper} from '../utilities/error-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {TrueConstraint} from '../models/constraint-models/true-constraint';

/**
 * This service concerns with
 * (1) Updating subject and observation counts Cohort Selection
 * (2) Saving / Updating / Restoring / Deleting cohorts in the 'Cohorts' panel on the left
 */
@Injectable({
  providedIn: 'root',
})
export class CohortService {
  // The current cohort, which is continuously being edited and stays in the browser memory
  private _currentCohort: Cohort;
  // The list of cohorts saved by the user
  private _cohorts: Cohort[] = [];
  // The total numbers of subjects & observations
  private _totalCounts: CountItem;
  private _inclusionCounts: CountItem;
  private _exclusionCounts: CountItem;
  // indicate when constraints are changed, whether to update counts immediately,
  // used in gb-constraint-component
  private _instantCohortCountsUpdate: boolean;
  // flag indicating if cohort counts are being updated
  private _isUpdating = false;
  // flag indicating if the cohort constraint in Cohort Selection has been changed
  private _isDirty = true;
  // the counts in the first step
  private _counts: CountItem;

  /*
   * ------ other variables ------
   */
  // Flag indicating if the cohort subscription optioin for each cohort in the cohort panel should be included
  private _isCohortSubscriptionIncluded = false;
  // Flag indicating if the observation counts are calculated and shown
  private _showObservationCounts: boolean;
  // Flag indicating if saving a cohort is finished
  private _isSavingCohortCompleted = true;

  constructor(private appConfig: AppConfig,
              private resourceService: ResourceService,
              private constraintService: ConstraintService) {
    this.instantCohortCountsUpdate = this.appConfig.getConfig('instant-cohort-counts-update');
    this.showObservationCounts = this.appConfig.getConfig('show-observation-counts');
    this.isCohortSubscriptionIncluded = this.appConfig.getConfig('include-cohort-subscription');

    this.initializeCounts();
    this.loadCohorts();
    // initial updates
    this.update(true);
  }

  initializeCounts() {
    this.totalCounts = new CountItem(0, 0);
    this.inclusionCounts = new CountItem(0, 0);
    this.exclusionCounts = new CountItem(0, 0);
    this.counts = new CountItem(0, 0);
  }

  clearAll(): Promise<any> {
    this.constraintService.clearCohortConstraint();
    this.isDirty = true;
    return this.update(true);
  }

  /**
   * ----------------------------- Update the queries on the left-side panel -----------------------------
   */
  loadCohorts() {
    this.resourceService.getQueries()
      .subscribe(
        (cohorts: Cohort[]) => {
          this.handleLoadedCohorts(cohorts);
        }
      );
  }

  handleLoadedCohorts(cohorts: Cohort[]) {
    // reset cohorts array
    this.cohorts.length = 0;
    // create current cohort
    let current: Cohort = new Cohort('', 'currently editing');
    current.createDate = new Date().toISOString();
    current.updateDate = new Date().toISOString();
    current.selected = true;
    current.controlsEnabled = false;
    current.constraint = new TrueConstraint();
    this.currentCohort = current;
    // process saved cohorts
    let bookmarkedCohorts = [];
    cohorts.forEach(c => {
      if (c.subscribed) {
        // load cohort diff records for this cohort
        this.resourceService.diffQuery(c.id)
          .subscribe(
            (records) => {
              c.diffRecords = this.parseCohortDiffRecords(records);
            }
          );
      }
      if (c.bookmarked) {
        bookmarkedCohorts.push(c);
      } else {
        this.cohorts.push(c);
      }
    });
    this.cohorts = [this.currentCohort].concat(bookmarkedCohorts).concat(this.cohorts);
  }

  public update(initialUpdate?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isDirty) {
        this.isUpdating = true;
        let constraint = this.constraintService.cohortConstraint();
        let inclusionConstraint = this.constraintService.inclusionConstraint();
        let exclusionConstraint = this.constraintService.exclusionConstraint();
        this.resourceService
          .updateInclusionExclusionCounts(constraint, inclusionConstraint, exclusionConstraint)
          .then(() => {
            let inCounts = this.resourceService.inclusionCounts;
            let exCounts = this.resourceService.exclusionCounts;
            this.inclusionCounts = inCounts;
            this.exclusionCounts = exCounts;
            this.counts.subjectCount = inCounts.subjectCount - exCounts.subjectCount;
            this.counts.observationCount = inCounts.observationCount - exCounts.observationCount;
            if (initialUpdate) {
              this.totalCounts.subjectCount = this.counts.subjectCount;
              this.totalCounts.observationCount = this.counts.observationCount;
            }
            this.constraintService.selectedStudyConceptCountMap = this.resourceService.selectedStudyConceptCountMap;
            this.constraintService.selectedConceptCountMap = this.resourceService.selectedConceptCountMap;
            this.isUpdating = false;
            this.isDirty = false;
            this.currentCohort.constraint = constraint;
            this.currentCohort.updateDate = new Date().toISOString();
            this.prepareVariables(resolve);
          })
          .catch(err => {
            reject(err);
          });
      } else {
        resolve(true);
      }
    });
  }

  prepareVariables(resolve) {
    if (this.constraintService.isTreeNodesLoading) {
      window.setTimeout((function () {
        this.prepareVariables(resolve);
      }).bind(this), 500);
    } else {
      this.constraintService.updateVariables();
      resolve(true);
    }
  }


  public saveCohortByName(name: string) {
    let result = new Cohort('', name);
    result.constraint = this.currentCohort.constraint;
    this.saveCohort(result);
  }

  public saveCohortByObject(obj: object) {
    this.saveCohort(ConstraintHelper.mapObjectToCohort(obj));
  }

  public saveCohort(target: Cohort) {
    this.isSavingCohortCompleted = false;
    this.resourceService.saveQuery(target)
      .subscribe(
        (newlySaved: Cohort) => {
          newlySaved.collapsed = true;
          newlySaved.visible = true;

          this.cohorts.push(newlySaved);
          this.isSavingCohortCompleted = true;
          const summary = 'Cohort "' + newlySaved.name + '" is added.';
          MessageHelper.alert('success', summary);
        },
        (err) => {
          console.error(err);
          this.isSavingCohortCompleted = true;
          const summary = 'Could not add the query "' + target.name + '".';
          MessageHelper.alert('error', summary);
        }
      );
  }

  /**
   * Restore cohort
   * @param {Cohort} cohort
   */
  public restoreCohort(cohort: Cohort): Promise<any> {
    return new Promise((resolve, reject) => {
      MessageHelper.alert('info', `Start importing cohort "${cohort.name}".`);
      if (cohort.constraint) {
        cohort.selected = true;
        this.currentCohort.constraint = cohort.constraint;
        this.constraintService.clearCohortConstraint();
        this.constraintService.restoreCohortConstraint(cohort.constraint);
        this.isDirty = true;
        this.update()
          .then(() => {
            MessageHelper.alert('info', 'Success', `Cohort ${cohort.name} is successfully imported.`);
            resolve(true);
          })
          .catch(err => {
            MessageHelper.alert('error', 'Fail to restore query ', cohort.name);
            reject(err);
          });
      }
      else {
        reject(`Cohort "${cohort.name}" does not have valid constraint to restore.`);
      }
    });
  }

  public updateCohort(target: Cohort, obj: object) {
    this.resourceService.updateQuery(target.id, obj)
      .subscribe(
        () => {
          if (target.subscribed) {
            this.resourceService.diffQuery(target.id)
              .subscribe(
                records => {
                  target.diffRecords = this.parseCohortDiffRecords(records);
                }
              );
          }
        },
        err => ErrorHelper.handleError(err)
      );
  }

  public deleteCohort(query: Cohort) {
    this.resourceService.deleteQuery(query['id'])
      .subscribe(
        () => {
          const index = this.cohorts.indexOf(query);
          if (index > -1) {
            this.cohorts.splice(index, 1);
          }
        },
        err => ErrorHelper.handleError(err)
      );
  }

  public parseCohortDiffRecords(records: object[]): CohortDiffRecord[] {
    let diffRecords: CohortDiffRecord[] = [];
    for (let record of records) {
      let items = [];
      // parse the added objects
      if (record['objectsAdded']) {
        for (let objectId of record['objectsAdded']) {
          let item = new CohortDiffItem();
          item.objectId = objectId;
          item.diffType = CohortDiffType.ADDED;
          items.push(item);
        }
      }
      // parse the removed objects
      if (record['objectsRemoved']) {
        for (let objectId of record['objectsRemoved']) {
          let item = new CohortDiffItem();
          item.objectId = objectId;
          item.diffType = CohortDiffType.REMOVED;
          items.push(item);
        }
      }
      if (items.length > 0) {
        let diffRecord: CohortDiffRecord = new CohortDiffRecord();
        diffRecord.id = record['id'];
        diffRecord.queryName = record['queryName'];
        diffRecord.queryUsername = record['queryUsername'];
        diffRecord.setId = record['setId'];
        diffRecord.setType = record['setType'] === 'PATIENT' ?
          CohortSetType.PATIENT : CohortSetType.SAMPLE;
        diffRecord.createDate = record['createDate'];
        diffRecord.diffItems = items;
        diffRecords.push(diffRecord);
      }
    }
    return diffRecords;
  }

  public toggleCohortSubscription(target: Cohort) {
    target.subscribed = !target.subscribed;
    let obj = {
      subscribed: target.subscribed
    };
    if (target.subscribed) {
      obj['subscriptionFreq'] =
        target.subscriptionFreq ? target.subscriptionFreq : CohortSubscriptionFrequency.WEEKLY;
      target.subscriptionFreq = obj['subscriptionFreq'];
    }
    this.updateCohort(target, obj);
  }

  public toggleCohortBookmark(target: Cohort) {
    target.bookmarked = !target.bookmarked;
    let obj = {
      bookmarked: target.bookmarked
    };
    this.updateCohort(target, obj);
  }

  get inclusionCounts(): CountItem {
    return this._inclusionCounts;
  }

  set inclusionCounts(value: CountItem) {
    this._inclusionCounts = value;
  }

  get exclusionCounts(): CountItem {
    return this._exclusionCounts;
  }

  set exclusionCounts(value: CountItem) {
    this._exclusionCounts = value;
  }

  get totalCounts(): CountItem {
    return this._totalCounts;
  }

  set totalCounts(value: CountItem) {
    this._totalCounts = value;
  }

  get counts(): CountItem {
    return this._counts;
  }

  set counts(value: CountItem) {
    this._counts = value;
  }

  get currentCohort(): Cohort {
    return this._currentCohort;
  }

  set currentCohort(value: Cohort) {
    this._currentCohort = value;
  }

  get cohorts(): Cohort[] {
    return this._cohorts;
  }

  set cohorts(value: Cohort[]) {
    this._cohorts = value;
  }

  get instantCohortCountsUpdate(): boolean {
    return this._instantCohortCountsUpdate;
  }

  set instantCohortCountsUpdate(value: boolean) {
    this._instantCohortCountsUpdate = value;
  }

  get isDirty(): boolean {
    return this._isDirty;
  }

  set isDirty(value: boolean) {
    this._isDirty = value;
  }

  get isUpdating(): boolean {
    return this._isUpdating;
  }

  set isUpdating(value: boolean) {
    this._isUpdating = value;
  }

  get showObservationCounts(): boolean {
    return this._showObservationCounts;
  }

  set showObservationCounts(value: boolean) {
    this._showObservationCounts = value;
  }

  get isSavingCohortCompleted(): boolean {
    return this._isSavingCohortCompleted;
  }

  set isSavingCohortCompleted(value: boolean) {
    this._isSavingCohortCompleted = value;
  }

  get isCohortSubscriptionIncluded(): boolean {
    return this._isCohortSubscriptionIncluded;
  }

  set isCohortSubscriptionIncluded(value: boolean) {
    this._isCohortSubscriptionIncluded = value;
  }
}
