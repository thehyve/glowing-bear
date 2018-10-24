/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {ResourceService} from './resource.service';
import {TreeNodeService} from './tree-node.service';
import {Cohort} from '../models/cohort-models/cohort';
import {ConstraintService} from './constraint.service';
import {Step} from '../models/cohort-models/step';
import {FormatHelper} from '../utilities/format-helper';
import {Constraint} from '../models/constraint-models/constraint';
import {AppConfig} from '../config/app.config';
import {CohortDiffRecord} from '../models/cohort-models/cohort-diff-record';
import {CohortSetType} from '../models/cohort-models/cohort-set-type';
import {CohortDiffItem} from '../models/cohort-models/cohort-diff-item';
import {CohortDiffType} from '../models/cohort-models/cohort-diff-type';
import {CohortSubscriptionFrequency} from '../models/cohort-models/cohort-subscription-frequency';
import {DataTableService} from './data-table.service';
import {DataTable} from '../models/table-models/data-table';
import {ExportService} from './export.service';
import {CrossTableService} from './cross-table.service';
import {ConstraintHelper} from '../utilities/constraint-utilities/constraint-helper';
import {MessageHelper} from '../utilities/message-helper';
import {ErrorHelper} from '../utilities/error-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {HttpErrorResponse} from '@angular/common/http';

type LoadingState = 'loading' | 'complete';

/**
 * This service concerns with
 * (1) Updating subject and observation counts in the steps in data-selection
 * (2) Saving / Updating / Restoring / Deleting queries in the queries panel on the left
 *
 * Remark: the subject set, observation set, concept set and study set used
 * in the 2nd step (i.e. the projection step) are subsets of the corresponding sets
 * in the 1st step (i.e. the selection step).
 * Hence, each time the 1st sets updated, so should be the 2nd sets.
 * However, each time the 2nd sets updated, the 1st sets remain unaffected.
 *
 * General workflow of data selection:
 * select subjects (rows), update the counts in the 1st step -->
 * select concepts (columns), update the counts in the 2nd step -->
 * update data table and charts (to be implemented) in 3rd/4th steps -->
 * update data formats available for export based on the previous data selection
 */
@Injectable()
export class CohortService {
  // The current cohort, which is continuously being edited and stays in the browser memory
  private _cohort: Cohort;
  // The list of queries of the user
  private _cohorts: Cohort[] = [];
  /*
   * ------ variables used in the 0th step, i.e. the total numbers of things ------
   */
  private _counts_0: CountItem;
  /*
   * ------ variables used in the 1st step (Selection) accordion in Data Selection ------
   */
  private _inclusionCounts: CountItem;
  private _exclusionCounts: CountItem;
  /*
   * when step 1 constraints are changed, whether to call update_1 immediately,
   * used in gb-constraint-component
   */
  private _instantCountsUpdate_1: boolean;
  // flag indicating if the counts in the first step are being updated
  private _isUpdating_1 = false;
  // flag indicating if the query in the 1st step has been changed
  private _isDirty_1 = true;
  // the counts in the first step
  private _counts_1: CountItem;
  loadingStateInclusion: LoadingState = 'complete';
  loadingStateExclusion: LoadingState = 'complete';
  loadingStateTotal_1: LoadingState = 'complete';

  /*
   * ------ variables used in the 2nd step (Projection) accordion in Data Selection ------
   */
  /*
   * when step 2 constraints are changed, whether to call update_2 immediately,
   * used in gb-projection-component
   */
  private _instantCountsUpdate_2: boolean;
  // flag indicating if the counts in the 2nd step are being updated
  private _isUpdating_2 = false;
  // flag indicating if the counts in the 2nd step caused by the changes in the 1st step are being updated
  private _isPreparing_2 = false;
  // flag indicating if the query in the 2nd step has been changed
  private _isDirty_2 = true;
  // the number of subjects further refined in the second step
  // _subjectCount_2 < or = _subjectCount_1
  // _observationCount_2 could be <, > or = _observationCount_1
  private _counts_2: CountItem;
  // boolean value to indicate if all tree nodes in step 2 are checked
  private _checkAll_2 = false;
  /*
   *  ------ variables used in the 3rd step (table) accordion in Data Selection ------
   */
  private _instantCountsUpdate_3: boolean;
  private _isUpdating_3 = false;
  private _isDataTableUsed = true;
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
              private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
              private dataTableService: DataTableService,
              private crossTableService: CrossTableService,
              private exportService: ExportService) {
    this.instantCountsUpdate_1 = this.appConfig.getConfig('instant-counts-update-1');
    this.instantCountsUpdate_2 = this.appConfig.getConfig('instant-counts-update-2');
    this.instantCountsUpdate_3 = this.appConfig.getConfig('instant-counts-update-3');
    this.showObservationCounts = this.appConfig.getConfig('show-observation-counts');
    let includeDataTable = this.appConfig.getConfig('include-data-table');
    if (!includeDataTable) {
      this.isDataTableUsed = false;
    } else {
      this.exportService.isExportEnabled().subscribe((exportEnabled) =>
        this.isDataTableUsed = exportEnabled
      );
    }
    this.isCohortSubscriptionIncluded = this.appConfig.getConfig('include-query-subscription');

    this.initializeCounts();
    this.loadCohorts();
    // initial updates
    this.updateAll(true);
  }

  initializeCounts() {
    this.counts_0 = new CountItem(0, 0);
    this.inclusionCounts = new CountItem(0, 0);
    this.exclusionCounts = new CountItem(0, 0);
    this.counts_1 = new CountItem(0, 0);
    this.counts_2 = new CountItem(0, 0);
  }

  updateAll(initialUpdate?: boolean): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.update_1(initialUpdate)
        .then(() => {
          this.update_2()
            .then(() => {
              this.update_3()
                .then(() => {
                  resolve(true);
                })
                .catch(err => {
                  console.error(err);
                  reject(err);
                })
            })
            .catch(err => {
              console.error(err);
              reject(err);
            })
        })
        .catch(err => {
          console.error(err);
          reject(err);
        })
    });
  }

  clearAll(): Promise<any> {
    this.constraintService.clearConstraint_1();
    this.constraintService.clearConstraint_2();
    this.checkAll_2 = false;
    this.isDirty_1 = true;
    this.isDirty_2 = true;
    this.isDirty_3 = true;
    return this.updateAll(true);
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
    this.cohorts.length = 0;
    let bookmarkedQueries = [];
    cohorts.forEach(c => {
      c.collapsed = true;
      c.visible = true;
      c.subscriptionCollapsed = true;
      if (c.createDate) {
        c.createDateInfo = FormatHelper.formatDateSemantics(new Date(c.createDate));
      }
      if (c.updateDate) {
        c.updateDateInfo = FormatHelper.formatDateSemantics(new Date(c.updateDate));
      }
      if (c.subscribed) {
        if (!c.subscriptionFreq) {
          c.subscriptionFreq = CohortSubscriptionFrequency.WEEKLY;
        }
        /*
         * load cohort diff records for this cohort
         */
        this.resourceService.diffQuery(c.id)
          .subscribe(
            (records) => {
              c.diffRecords = this.parseCohortDiffRecords(records);
            }
          );
      }

      if (c.bookmarked) {
        bookmarkedQueries.push(c);
      } else {
        this.cohorts.push(c);
      }
    });
    this.cohorts = bookmarkedQueries.concat(this.cohorts);
  }

  public update_1(initialUpdate?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isDirty_1) {
        // update export flags
        this.exportService.isLoadingExportDataTypes = true;
        this.isUpdating_1 = true;
        // set the flags
        this.loadingStateInclusion = 'loading';
        this.loadingStateExclusion = 'loading';
        this.loadingStateTotal_1 = 'loading';
        let constraint_1 = this.constraintService.constraint_1();
        let inclusionConstraint = this.constraintService.generateInclusionConstraint();
        let exclusionConstraint = this.constraintService.generateExclusionConstraint();
        this.resourceService.updateInclusionExclusionCounts(constraint_1, inclusionConstraint, exclusionConstraint)
          .then(() => {
            let inCounts = this.resourceService.inclusionCounts;
            let exCounts = this.resourceService.exclusionCounts;
            this.inclusionCounts = inCounts;
            this.exclusionCounts = exCounts;
            this.counts_1.subjectCount = inCounts.subjectCount - exCounts.subjectCount;
            this.counts_1.observationCount = inCounts.observationCount - exCounts.observationCount;
            if (initialUpdate) {
              this.counts_0.subjectCount = this.counts_1.subjectCount;
              this.counts_0.observationCount = this.counts_1.observationCount;
            }
            this.treeNodeService.selectedStudyConceptCountMap = this.resourceService.selectedStudyConceptCountMap;
            this.treeNodeService.selectedConceptCountMap = this.resourceService.selectedConceptCountMap;
            this.isUpdating_1 = false;
            this.loadingStateInclusion = 'complete';
            this.loadingStateExclusion = 'complete';
            this.loadingStateTotal_1 = 'complete';

            this.counts_2.subjectCount = -1;
            this.counts_2.observationCount = -1;
            // step 1 is no longer dirty
            this.isDirty_1 = false;
            // step 2 becomes dirty and needs to be updated
            this.isDirty_2 = true;
            resolve(true);
          })
          .catch(err => {
            reject(err);
          });
      } else {
        resolve(true);
      }
    });
  }

  /**
   * This following functions handle the asynchronicity
   * between updating the 2nd-step counts and the loading of tree nodes:
   * only when the tree nodes are completely loaded can we start updating
   * the counts in the 2nd step
   */
  update_2a(): Promise<any> {
    return new Promise(resolve => {
      this.prepare_2(resolve);
    });
  }

  prepare_2(resolve) {
    if (this.treeNodeService.isTreeNodeLoadingCompleted) {
      // update the tree in the 2nd step
      let checklist = this.treeNodeService.getFullProjectionTreeDataChecklist(null);
      this.treeNodeService.updateProjectionTreeData(checklist);
      this.cohort = null;
      this.isPreparing_2 = false;
      resolve(true);
    } else {
      window.setTimeout((function () {
        this.prepare_2(resolve);
      }).bind(this), 500);
    }
  }

  update_2b(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isUpdating_1 && !this.isPreparing_2) {
        this.isUpdating_2 = true;
        this.cohort = null;
        // update the subject count and observation count in the 2nd step
        const constraint_1_2: Constraint = this.constraintService.constraint_1_2();
        this.resourceService.getCounts(constraint_1_2)
          .subscribe(
            (countItem: CountItem) => {
              // update counts and flags
              this.counts_2 = countItem;
              this.isUpdating_2 = false;
              this.isDirty_2 = false;
              this.isDirty_3 = true;
              // update the export variables
              this.exportService.updateExports();
              // update the final tree nodes in the summary panel
              if (this.counts_2.subjectCount > 0) {
                this.treeNodeService.updateFinalTreeNodes();
              } else {
                this.treeNodeService.finalTreeNodes = [];
              }
              // update the cross table baseline constraint
              this.crossTableService.constraint = this.constraintService.constraint_1();
              resolve(true);
            },
            (err: HttpErrorResponse) => {
              ErrorHelper.handleError(err);
              reject(err.message);
            }
          );
      } else {
        resolve(true);
      }
    });
  }

  /**
   * update the subject, observation, concept and study counts in the second step
   */
  public update_2(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isDirty_2) {
        this.update_2a()
          .then(this.update_2b.bind(this))
          .then(() => resolve(true))
          .catch(err => reject(err));
      } else {
        resolve(true);
      }
    });
  }

  /**
   * update the table
   */
  public update_3(targetDataTable?: DataTable): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isDirty_3) {
        this.isUpdating_3 = true;
        if (this.isDataTableUsed) {
          this.dataTableService.dataTable.currentPage = 1;
          this.dataTableService.updateDataTable(targetDataTable)
            .then(() => {
              this.isDirty_3 = false;
              this.isUpdating_3 = false;
              resolve(true);
            })
            .catch(err => {
              ErrorHelper.handleError(err);
              this.isDirty_3 = false;
              this.isUpdating_3 = false;
              reject(err)
            })
        } else {
          this.isDirty_3 = false;
          this.isUpdating_3 = false;
          resolve(true);
        }
      } else {
        resolve(true);
      }
    });

  }

  public saveCohortByName(name: string) {
    let result = new Cohort('', name);
    result.constraint = this.constraintService.constraint_1();
    this.saveCohort(result);
  }

  public saveCohortByObject(obj: object) {
    this.saveCohort(ConstraintHelper.mapObjectToCohort(obj));
  }

  saveCohort(target: Cohort) {
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
      MessageHelper.alert('info', `Start importing query ${cohort.name}.`);
      this.cohort = cohort;
      if (cohort.constraint) {
        this.constraintService.clearConstraint_1();
        this.constraintService.restoreConstraint_1(cohort.constraint);
      }
      this.isDirty_1 = true;
      this.isDirty_2 = true;
      this.isDirty_3 = true;
      this.updateAll()
        .then(() => {
          MessageHelper.alert('info', 'Success', `Query ${cohort.name} is successfully imported.`);
          resolve(true);
        })
        .catch(err => {
          MessageHelper.alert('error', 'Fail to restore query ', cohort.name);
          reject(err);
        });
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
          // An alternative would be to directly update the queries
          // using 'treeNodeService.updateQueries()'
          // but this approach retrieves new query objects and
          // leaves the all queries to remain collapsed
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

  get counts_0(): CountItem {
    return this._counts_0;
  }

  set counts_0(value: CountItem) {
    this._counts_0 = value;
  }

  get counts_1(): CountItem {
    return this._counts_1;
  }

  set counts_1(value: CountItem) {
    this._counts_1 = value;
  }

  get counts_2(): CountItem {
    return this._counts_2;
  }

  set counts_2(value: CountItem) {
    this._counts_2 = value;
  }

  get cohort(): Cohort {
    return this._cohort;
  }

  set cohort(value: Cohort) {
    this._cohort = value;
  }

  get cohorts(): Cohort[] {
    return this._cohorts;
  }

  set cohorts(value: Cohort[]) {
    this._cohorts = value;
  }

  get instantCountsUpdate_1(): boolean {
    return this._instantCountsUpdate_1;
  }

  set instantCountsUpdate_1(value: boolean) {
    this._instantCountsUpdate_1 = value;
  }

  get instantCountsUpdate_2(): boolean {
    return this._instantCountsUpdate_2;
  }

  set instantCountsUpdate_2(value: boolean) {
    this._instantCountsUpdate_2 = value;
  }

  get instantCountsUpdate_3(): boolean {
    return this._instantCountsUpdate_3;
  }

  set instantCountsUpdate_3(value: boolean) {
    this._instantCountsUpdate_3 = value;
  }

  get isUpdating_1(): boolean {
    return this._isUpdating_1;
  }

  set isUpdating_1(value: boolean) {
    this._isUpdating_1 = value;
  }

  get isUpdating_2(): boolean {
    return this._isUpdating_2;
  }

  set isUpdating_2(value: boolean) {
    this._isUpdating_2 = value;
  }

  get isUpdating_3(): boolean {
    return this._isUpdating_3;
  }

  set isUpdating_3(value: boolean) {
    this._isUpdating_3 = value;
  }

  get isPreparing_2(): boolean {
    return this._isPreparing_2;
  }

  set isPreparing_2(value: boolean) {
    this._isPreparing_2 = value;
  }

  get isDirty_1(): boolean {
    return this._isDirty_1;
  }

  set isDirty_1(value: boolean) {
    this._isDirty_1 = value;
  }

  get isDirty_2(): boolean {
    return this._isDirty_2;
  }

  set isDirty_2(value: boolean) {
    this._isDirty_2 = value;
  }

  get isDirty_3(): boolean {
    return this.dataTableService.dataTable.isDirty;
  }

  set isDirty_3(value: boolean) {
    this.dataTableService.dataTable.isDirty = value;
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

  get isDataTableUsed(): boolean {
    return this._isDataTableUsed;
  }

  set isDataTableUsed(value: boolean) {
    this._isDataTableUsed = value;
  }

  get isCohortSubscriptionIncluded(): boolean {
    return this._isCohortSubscriptionIncluded;
  }

  set isCohortSubscriptionIncluded(value: boolean) {
    this._isCohortSubscriptionIncluded = value;
  }

  get checkAll_2(): boolean {
    return this._checkAll_2;
  }

  set checkAll_2(value: boolean) {
    this._checkAll_2 = value;
  }
}
