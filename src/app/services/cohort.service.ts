/**
 * Copyright 2017 - 2019  The Hyve B.V.
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
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';
import {ConstraintMark} from '../models/constraint-models/constraint-mark';
import {Subject} from 'rxjs';
import {CountService} from './count.service';
import {SubjectSetConstraint} from '../models/constraint-models/subject-set-constraint';
import {SubjectSet} from '../models/constraint-models/subject-set';
import {Constraint} from '../models/constraint-models/constraint';

/**
 * This service concerns with
 * Saving / Updating / Restoring / Deleting cohorts in the 'Cohorts' panel on the left
 *
 * workflow:
 * - when the user changes the constraint(s) inside gb-cohort-selection:
 *          updateCountsWithCurrentCohort() -> updateCountsWithAllCohorts()
 * - when the user changes cohort selection inside gb-cohorts:
 *          updateCountsWithAllCohorts()
 */
@Injectable({
  providedIn: 'root',
})
export class CohortService {
  // The current cohort, which is continuously being edited and stays in the browser memory
  private _currentCohort: Cohort;
  // The list of cohorts saved by the user
  private _cohorts: Cohort[] = [];
  // flag indicating if the current cohort is being updated (gb-cohort-selection)
  private _isUpdatingCurrent = false;
  // flag indicating if all the cohorts are being updated (gb-cohorts)
  private _isUpdatingAll = false;
  // flag indicating if the current cohort constraint in gb-cohort-selection has been changed
  private _isDirty = true;
  private _cohortsUpdated: Subject<Cohort[]> = new Subject<Cohort[]>();
  // indicate when constraints are changed, whether to update counts immediately,
  // used in gb-constraint-component
  private _instantCohortCountsUpdate: boolean;
  // indicate when constraints are changed, whether to update counts immediately,
  // used in gb-constraint-component
  private _saveSubjectSetBeforeUpdatingCounts: boolean;
  /*
   * ------ other variables ------
   */

  // Flag indicating if the cohort subscription option for each cohort in the cohort panel should be included
  private _isCohortSubscriptionIncluded = false;
  // Flag indicating if saving a cohort is finished
  private _isSavingCohortCompleted = true;
  constructor(private appConfig: AppConfig,
              private resourceService: ResourceService,
              private constraintService: ConstraintService,
              private countService: CountService) {
    this.isCohortSubscriptionIncluded = this.appConfig.getConfig('include-cohort-subscription');
    this.instantCohortCountsUpdate = this.appConfig.getConfig('instant-cohort-counts-update');
    this.saveSubjectSetBeforeUpdatingCounts = this.appConfig.getConfig('autosave-subject-sets');
    this.loadCohorts();
    // initial updates
    this.updateCountsWithCurrentCohort();
  }

  clearAll(): Promise<any> {
    this.constraintService.clearCohortConstraint();
    this.isDirty = true;
    return this.updateCountsWithCurrentCohort();
  }


  /**
   * ----------------------------- Update the queries on the left-side panel -----------------------------
   */
  loadCohorts() {
    this.resourceService.getCohorts()
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
        this.resourceService.diffCohort(c.id)
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

  public updateCountsWithCurrentCohort(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isDirty) {
        this.isUpdatingCurrent = true;
        let constraint = this.constraintService.cohortSelectionConstraint();
        this.countService.updateCurrentSelectionCount(constraint)
          .then(() => {
            this.currentCohort.constraint = constraint;
            this.currentCohort.updateDate = new Date().toISOString();
            this.isUpdatingCurrent = false;
            this.isDirty = false;

            if (this.currentCohort.selected) {
              this.updateCountsWithAllCohorts()
                .then(() => {
                  resolve(true)
                })
                .catch(err => {
                  reject(err);
                })
            } else {
              resolve(true);
            }
          })
          .catch(err => {
            reject(err);
          });
      } else {
        resolve(true);
      }
    });
  }

  public updateCountsWithAllCohorts(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('Updating counts from all cohorts...');
      this.isUpdatingAll = true;
      let combination: CombinationConstraint = new CombinationConstraint();
      combination.combinationState = CombinationState.And;
      combination.mark = ConstraintMark.SUBJECT;
      this.cohorts.forEach((cohort: Cohort) => {
        if (cohort.selected) {
          combination.addChild(cohort.constraint);
        }
      });
      if (this.saveSubjectSetBeforeUpdatingCounts) {
        this.resourceService.saveSubjectSet('temp', combination).subscribe((subjectSet: SubjectSet) => {
          return this.updateAllCounts(new SubjectSetConstraint(subjectSet))
            .then(() =>
              resolve(true)
            ).catch(err => {
              reject(err);
            });
        });
      } else {
        return this.updateAllCounts(combination)
          .then(() =>
            resolve(true)
          ).catch(err => {
            reject(err);
          });
      }
    });
  }

  private updateAllCounts(constraint: Constraint) {
    return new Promise((resolve, reject) => {
      return this.countService.updateAllCounts(constraint)
        .then(() => {
          this.isUpdatingAll = false;
          this.cohortsUpdated.next(this.cohorts);
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });
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
    this.resourceService.saveCohort(target)
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
        this.updateCountsWithCurrentCohort()
          .then(() => {
            MessageHelper.alert('info', 'Success', `Cohort ${cohort.name} is successfully imported.`);
            this.currentCohort.selected = true;
            resolve(true);
          })
          .catch(err => {
            MessageHelper.alert('error', 'Fail to restore query ', cohort.name);
            reject(err);
          });
      } else {
        reject(`Cohort "${cohort.name}" does not have valid constraint to restore.`);
      }
    });
  }

  public editCohort(target: Cohort, obj: object) {
    this.resourceService.editCohort(target.id, obj)
      .subscribe(
        () => {
          if (target.subscribed) {
            this.resourceService.diffCohort(target.id)
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

  public deleteCohort(target: Cohort) {
    this.resourceService.deleteCohort(target['id'])
      .subscribe(
        () => {
          const index = this.cohorts.indexOf(target);
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
    this.editCohort(target, obj);
  }

  public toggleCohortBookmark(target: Cohort) {
    target.bookmarked = !target.bookmarked;
    let obj = {
      bookmarked: target.bookmarked
    };
    this.editCohort(target, obj);
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

  get isDirty(): boolean {
    return this._isDirty;
  }

  set isDirty(value: boolean) {
    this._isDirty = value;
  }

  get isUpdatingCurrent(): boolean {
    return this._isUpdatingCurrent;
  }

  set isUpdatingCurrent(value: boolean) {
    this._isUpdatingCurrent = value;
  }

  get isUpdatingAll(): boolean {
    return this._isUpdatingAll;
  }

  set isUpdatingAll(value: boolean) {
    this._isUpdatingAll = value;
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

  get cohortsUpdated(): Subject<Cohort[]> {
    return this._cohortsUpdated;
  }

  set cohortsUpdated(value: Subject<Cohort[]>) {
    this._cohortsUpdated = value;
  }

  get instantCohortCountsUpdate(): boolean {
    return this._instantCohortCountsUpdate;
  }

  set instantCohortCountsUpdate(value: boolean) {
    this._instantCohortCountsUpdate = value;
  }

  get saveSubjectSetBeforeUpdatingCounts(): boolean {
    return this._saveSubjectSetBeforeUpdatingCounts;
  }

  set saveSubjectSetBeforeUpdatingCounts(value: boolean) {
    this._saveSubjectSetBeforeUpdatingCounts = value;
  }
}
