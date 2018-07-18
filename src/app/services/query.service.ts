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
import {Query} from '../models/query-models/query';
import {ConstraintService} from './constraint.service';
import {Step} from '../models/query-models/step';
import {SubjectSetConstraint} from '../models/constraint-models/subject-set-constraint';
import {FormatHelper} from '../utilities/format-helper';
import {SubjectSet} from '../models/constraint-models/subject-set';
import {Constraint} from '../models/constraint-models/constraint';
import {AppConfig} from '../config/app.config';
import {QueryDiffRecord} from '../models/query-models/query-diff-record';
import {QuerySetType} from '../models/query-models/query-set-type';
import {QueryDiffItem} from '../models/query-models/query-diff-item';
import {QueryDiffType} from '../models/query-models/query-diff-type';
import {QuerySubscriptionFrequency} from '../models/query-models/query-subscription-frequency';
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
export class QueryService {
  // The current step at which the user is composing query
  private _step: Step = Step.I;
  // The currently selected query
  private _query: Query;
  // The list of queries of the user
  private _queries: Query[] = [];
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
  private _isDirty_1 = false;
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
  private _isDirty_2 = false;
  // the number of subjects further refined in the second step
  // _subjectCount_2 < or = _subjectCount_1
  // _observationCount_2 could be <, > or = _observationCount_1
  private _counts_2: CountItem;
  /*
   *  ------ variables used in the 3rd step (table) accordion in Data Selection ------
   */
  private _instantCountsUpdate_3: boolean;
  private _isUpdating_3 = false;
  private _isDataTableUsed = true;
  /*
   * ------ other variables ------
   */
  // Flag indicating if the query subscription optioin for each query in the query panel should be incldued
  private _isQuerySubscriptionIncluded = false;
  // Flag indicating if the observation counts are calculated and shown
  private _showObservationCounts: boolean;
  // Flag indicating if saving a query is finished
  private _isSavingQueryCompleted = true;

  constructor(private appConfig: AppConfig,
              private resourceService: ResourceService,
              private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
              private dataTableService: DataTableService,
              private crossTableService: CrossTableService,
              private exportService: ExportService) {
    this.instantCountsUpdate_1 = this.appConfig.getConfig('instant-counts-update-1', false);
    this.instantCountsUpdate_2 = this.appConfig.getConfig('instant-counts-update-2', false);
    this.instantCountsUpdate_3 = this.appConfig.getConfig('instant-counts-update-3', false);
    this.showObservationCounts = this.appConfig.getConfig('show-observation-counts', true);
    this.isDataTableUsed = this.appConfig.getConfig('include-data-table', true);
    this.isQuerySubscriptionIncluded = this.appConfig.getConfig('include-query-subscription', false);

    this.initializeCounts();
    this.loadQueries();
    // initial updates
    this.update_1(true)
      .then(() => {
        this.update_2()
          .then(() => {
            this.update_3();
          })
          .catch(err => {
            console.error(err);
          })
      })
      .catch(err => {
        console.error(err);
      })
  }

  initializeCounts() {
    this.counts_0 = new CountItem(0, 0);
    this.inclusionCounts = new CountItem(0, 0);
    this.exclusionCounts = new CountItem(0, 0);
    this.counts_1 = new CountItem(0, 0);
    this.counts_2 = new CountItem(0, 0);
  }

  /**
   * ----------------------------- Update the queries on the left-side panel -----------------------------
   */
  loadQueries() {
    this.resourceService.getQueries()
      .subscribe(
        (queries: Query[]) => {
          this.handleLoadedQueries(queries);
        }
      );
  }

  handleLoadedQueries(queries: Query[]) {
    this.queries.length = 0;
    let bookmarkedQueries = [];
    queries.forEach(query => {
      query.collapsed = true;
      query.visible = true;
      query.subscriptionCollapsed = true;
      if (query.createDate) {
        query.createDateInfo = FormatHelper.formatDateSemantics(new Date(query.createDate));
      }
      if (query.updateDate) {
        query.updateDateInfo = FormatHelper.formatDateSemantics(new Date(query.updateDate));
      }
      if (query.subscribed) {
        if (!query.subscriptionFreq) {
          query.subscriptionFreq = QuerySubscriptionFrequency.WEEKLY;
        }
        /*
         * load query diff records for this query
         */
        this.resourceService.diffQuery(query.id)
          .subscribe(
            (records) => {
              query.diffRecords = this.parseQueryDiffRecords(records);
            }
          );
      }

      if (query.bookmarked) {
        bookmarkedQueries.push(query);
      } else {
        this.queries.push(query);
      }
    });
    this.queries = bookmarkedQueries.concat(this.queries);
  }

  /**
   * ------------------------------------------------- BEGIN: step 1 -------------------------------------------------
   */
  public update_1(initialUpdate?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
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
        })
    });
  }

  /**
   * ------------------------------------------------- END: step 1 ---------------------------------------------------
   */

  /**
   * ------------------------------------------------- BEGIN: step 2 -------------------------------------------------
   */
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
      // Only update the tree in the 2nd step when the user changes sth. in the 1st step
      if (this.step !== Step.II) {
        let checklist = this.query ? this.query.observationQuery['data'] : null;
        if (checklist) {
          let parentPaths = [];
          for (let path of checklist) {
            let _parentPaths = this.treeNodeService.getParentTreeNodePaths(path);
            for (let _parentPath of _parentPaths) {
              if (!parentPaths.includes(_parentPath)) {
                parentPaths.push(_parentPath);
              }
            }
          }
          checklist = checklist.concat(parentPaths);
        } else if (this.treeNodeService.selectedProjectionTreeData.length > 0) {
          checklist = [];
          for (let selectedNode of this.treeNodeService.selectedProjectionTreeData) {
            checklist.push(selectedNode['fullName']);
          }
        }
        this.treeNodeService.updateProjectionTreeData(checklist);
      }

      this.query = null;
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
        this.query = null; // clear query
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
      this.update_2a()
        .then(this.update_2b.bind(this))
        .then(() => resolve(true))
        .catch(err => reject(err));
    });
  }

  /**
   * update the table
   */
  public update_3(targetDataTable?: DataTable): Promise<any> {
    return new Promise((resolve, reject) => {
      this.isDirty_3 = true;
      this.isUpdating_3 = true;
      if (this.isDataTableUsed) {
        this.dataTableService.dataTable.currentPage = 1;
        this.dataTableService.updateDataTable(targetDataTable)
          .then(() => {
            this.isDirty_3 = false;
            this.isUpdating_3 = false;
            resolve(true);
          })
          .catch(err => reject(err))
      } else {
        this.isDirty_3 = false;
        this.isUpdating_3 = false;
        resolve(true);
      }
    });

  }

  /**
   * ------------------------------------------------- END: step 2 --------------------------------------------------
   */
  public saveQueryByName(queryName: string) {
    let newQuery = new Query('', queryName);
    newQuery.subjectQuery = this.constraintService.constraint_1();
    let data = [];
    for (let item of this.treeNodeService.selectedProjectionTreeData) {
      data.push(item['fullName']);
    }
    newQuery.observationQuery = {data: data};
    newQuery.dataTable = this.dataTableService.dataTable;
    this.saveQuery(newQuery);
  }

  public saveQueryByObject(queryObj: object) {
    let newQuery: Query = ConstraintHelper.mapObjectToQuery(queryObj);
    this.saveQuery(newQuery);
  }

  saveQuery(newQuery: Query) {
    this.isSavingQueryCompleted = false;
    this.resourceService.saveQuery(newQuery)
      .subscribe(
        (newlySavedQuery: Query) => {
          newlySavedQuery.collapsed = true;
          newlySavedQuery.visible = true;

          this.queries.push(newlySavedQuery);
          this.isSavingQueryCompleted = true;
          const summary = 'Query "' + newlySavedQuery.name + '" is added.';
          MessageHelper.alert('success', summary);
        },
        (err) => {
          console.error(err);
          this.isSavingQueryCompleted = true;
          const summary = 'Could not add the query "' + newQuery.name + '".';
          MessageHelper.alert('error', summary);
        }
      );
  }

  /**
   * Restore query
   * @param {Query} query
   */
  public restoreQuery(query: Query): Promise<any> {
    return new Promise((resolve, reject) => {
      MessageHelper.alert('info', `Start importing query ${query.name}.`);
      this.query = query;
      this.step = Step.I;
      if (query.subjectQuery) {
        this.constraintService.clearConstraint_1();
        this.constraintService.restoreConstraint_1(query.subjectQuery);
      }
      this.update_1(false)
        .then(() => {
          this.update_2()
            .then(() => {
              this.update_3(query.dataTable)
                .then(() => {
                  MessageHelper
                    .alert('info', 'Success', `Query ${query.name} is successfully imported.`);
                  resolve(true);
                })
                .catch(err => {
                  const msg = 'Fail to update step 3.';
                  MessageHelper.alert('error', msg);
                  reject(msg);
                })
            })
            .catch(err => {
              const msg = 'Fail to update step 2.';
              MessageHelper.alert('error', msg);
              reject(msg);
            });
        })
        .catch(err => {
          const msg = 'Fail to update step 1.';
          MessageHelper.alert('error', msg);
          reject(msg);
        });
    });
  }

  public updateQuery(query: Query, queryObj: object) {
    this.resourceService.updateQuery(query.id, queryObj)
      .subscribe(
        () => {
          if (query.subscribed) {
            this.resourceService.diffQuery(query.id)
              .subscribe(
                records => {
                  query.diffRecords = this.parseQueryDiffRecords(records);
                }
              );
          }
        },
        err => ErrorHelper.handleError(err)
      );
  }

  public deleteQuery(query: Query) {
    this.resourceService.deleteQuery(query['id'])
      .subscribe(
        () => {
          const index = this.queries.indexOf(query);
          if (index > -1) {
            this.queries.splice(index, 1);
          }
          // An alternative would be to directly update the queries
          // using 'treeNodeService.updateQueries()'
          // but this approach retrieves new query objects and
          // leaves the all queries to remain collapsed
        },
        err => ErrorHelper.handleError(err)
      );
  }

  public parseQueryDiffRecords(records: object[]): QueryDiffRecord[] {
    let diffRecords: QueryDiffRecord[] = [];
    for (let record of records) {
      let items = [];
      // parse the added objects
      if (record['objectsAdded']) {
        for (let objectId of record['objectsAdded']) {
          let item = new QueryDiffItem();
          item.objectId = objectId;
          item.diffType = QueryDiffType.ADDED;
          items.push(item);
        }
      }
      // parse the removed objects
      if (record['objectsRemoved']) {
        for (let objectId of record['objectsRemoved']) {
          let item = new QueryDiffItem();
          item.objectId = objectId;
          item.diffType = QueryDiffType.REMOVED;
          items.push(item);
        }
      }
      if (items.length > 0) {
        let diffRecord: QueryDiffRecord = new QueryDiffRecord();
        diffRecord.id = record['id'];
        diffRecord.queryName = record['queryName'];
        diffRecord.queryUsername = record['queryUsername'];
        diffRecord.setId = record['setId'];
        diffRecord.setType = record['setType'] === 'PATIENT' ?
          QuerySetType.PATIENT : QuerySetType.SAMPLE;
        diffRecord.createDate = record['createDate'];
        diffRecord.diffItems = items;
        diffRecords.push(diffRecord);
      }
    }
    return diffRecords;
  }

  public toggleQuerySubscription(query: Query) {
    query.subscribed = !query.subscribed;
    let queryObj = {
      subscribed: query.subscribed
    };
    if (query.subscribed) {
      queryObj['subscriptionFreq'] =
        query.subscriptionFreq ? query.subscriptionFreq : QuerySubscriptionFrequency.WEEKLY;
      query.subscriptionFreq = queryObj['subscriptionFreq'];
    }
    this.updateQuery(query, queryObj);
  }

  public toggleQueryBookmark(query: Query) {
    query.bookmarked = !query.bookmarked;
    let queryObj = {
      bookmarked: query.bookmarked
    };
    this.updateQuery(query, queryObj);
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

  get query(): Query {
    return this._query;
  }

  set query(value: Query) {
    this._query = value;
  }

  get queries(): Query[] {
    return this._queries;
  }

  set queries(value: Query[]) {
    this._queries = value;
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

  get step(): Step {
    return this._step;
  }

  set step(value: Step) {
    this._step = value;
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

  get isSavingQueryCompleted(): boolean {
    return this._isSavingQueryCompleted;
  }

  set isSavingQueryCompleted(value: boolean) {
    this._isSavingQueryCompleted = value;
  }

  get isDataTableUsed(): boolean {
    return this._isDataTableUsed;
  }

  set isDataTableUsed(value: boolean) {
    this._isDataTableUsed = value;
  }

  get isQuerySubscriptionIncluded(): boolean {
    return this._isQuerySubscriptionIncluded;
  }

  set isQuerySubscriptionIncluded(value: boolean) {
    this._isQuerySubscriptionIncluded = value;
  }
}
